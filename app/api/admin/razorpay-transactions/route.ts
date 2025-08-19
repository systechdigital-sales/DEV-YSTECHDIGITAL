import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "sync") {
      // Sync transactions from Razorpay API
      return await syncTransactions()
    } else {
      // Get transactions from database with pagination and filtering
      return await getTransactions(request)
    }
  } catch (error) {
    console.error("Error in razorpay-transactions API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

async function syncTransactions() {
  try {
    const { db } = await connectToDatabase()
    const transactionsCollection = db.collection("razorpay_transactions")

    const allPayments = []
    let skip = 0
    const count = 100 // Razorpay API limit per request
    let hasMore = true

    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const fromTimestamp = Math.floor(sixtyDaysAgo.getTime() / 1000)

    console.log("[v0] Syncing transactions from:", new Date(fromTimestamp * 1000))

    while (hasMore) {
      try {
        const payments = await razorpay.payments.all({
          count: count,
          skip: skip,
          from: fromTimestamp,
        })

        allPayments.push(...payments.items)
        hasMore = payments.items.length === count
        skip += count

        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
      } catch (apiError) {
        console.error("[v0] Razorpay API error:", apiError)
        if (allPayments.length > 0) {
          console.log("[v0] Continuing with partial data due to API error")
          break
        }
        throw apiError
      }
    }

    let syncedCount = 0
    let updatedCount = 0
    let errorCount = 0

    for (const payment of allPayments) {
      try {
        const existingTransaction = await transactionsCollection.findOne({
          razorpay_payment_id: payment.id,
        })

        const transactionData = {
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          email: payment.email,
          contact: payment.contact,
          fee: payment.fee,
          tax: payment.tax,
          error_code: payment.error_code,
          error_description: payment.error_description,
          created_at: new Date(payment.created_at * 1000),
          captured_at: payment.captured_at ? new Date(payment.captured_at * 1000) : undefined,
          updatedAt: new Date(),
          lastSyncAt: new Date(),
          syncSource: "razorpay_api",
        }

        if (existingTransaction) {
          await transactionsCollection.updateOne(
            { razorpay_payment_id: payment.id },
            {
              $set: {
                ...transactionData,
                // Preserve claimId if it exists
                ...(existingTransaction.claimId && { claimId: existingTransaction.claimId }),
              },
            },
          )
          updatedCount++
        } else {
          await transactionsCollection.insertOne({
            ...transactionData,
            createdAt: new Date(),
          })
          syncedCount++
        }
      } catch (paymentError) {
        console.error("[v0] Error processing payment:", payment.id, paymentError)
        errorCount++

        await db.collection("sync_errors").insertOne({
          razorpay_payment_id: payment.id,
          error: paymentError.message,
          timestamp: new Date(),
          paymentData: payment,
        })
      }
    }

    await matchTransactionsWithClaims()

    await db.collection("sync_logs").insertOne({
      timestamp: new Date(),
      totalFetched: allPayments.length,
      syncedCount,
      updatedCount,
      errorCount,
      fromDate: new Date(fromTimestamp * 1000),
    })

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} new transactions, updated ${updatedCount} existing transactions from ${allPayments.length} total payments. ${errorCount} errors occurred.`,
      syncedCount,
      updatedCount,
      totalFetched: allPayments.length,
      errorCount,
    })
  } catch (error) {
    console.error("[v0] Error syncing transactions:", error)
    return NextResponse.json({ error: "Failed to sync transactions from Razorpay" }, { status: 500 })
  }
}

async function matchTransactionsWithClaims() {
  try {
    const { db } = await connectToDatabase()
    const transactionsCollection = db.collection("razorpay_transactions")
    const claimsCollection = db.collection("claims")

    const unmatchedTransactions = await transactionsCollection
      .find({
        $or: [{ claimId: { $exists: false } }, { claimId: null }, { claimId: "" }],
        status: { $in: ["captured", "authorized"] }, // Include authorized payments
      })
      .toArray()

    console.log("[v0] Found", unmatchedTransactions.length, "unmatched transactions")

    let matchedCount = 0

    for (const transaction of unmatchedTransactions) {
      let matchingClaim = null

      // Strategy 1: Match by razorpay_order_id
      if (transaction.razorpay_order_id) {
        matchingClaim = await claimsCollection.findOne({
          razorpayOrderId: transaction.razorpay_order_id,
        })
      }

      // Strategy 2: Match by paymentId
      if (!matchingClaim && transaction.razorpay_payment_id) {
        matchingClaim = await claimsCollection.findOne({
          paymentId: transaction.razorpay_payment_id,
        })
      }

      // Strategy 3: Match by email and contact with time proximity
      if (!matchingClaim && transaction.email && transaction.contact) {
        const transactionTime = transaction.created_at || transaction.createdAt
        const timeWindow = 4 * 60 * 60 * 1000 // Increased to 4 hours

        matchingClaim = await claimsCollection.findOne({
          $and: [
            { email: transaction.email },
            {
              $or: [{ phoneNumber: transaction.contact }, { phone: transaction.contact }],
            },
            { paymentStatus: "paid" },
            {
              createdAt: {
                $gte: new Date(transactionTime.getTime() - timeWindow),
                $lte: new Date(transactionTime.getTime() + timeWindow),
              },
            },
          ],
        })
      }

      if (!matchingClaim && transaction.email) {
        const transactionTime = transaction.created_at || transaction.createdAt
        const recentWindow = 2 * 60 * 60 * 1000 // 2 hours for email-only matching

        matchingClaim = await claimsCollection.findOne({
          email: transaction.email,
          paymentStatus: "paid",
          createdAt: {
            $gte: new Date(transactionTime.getTime() - recentWindow),
            $lte: new Date(transactionTime.getTime() + recentWindow),
          },
          $or: [{ razorpayOrderId: { $exists: false } }, { razorpayOrderId: null }, { razorpayOrderId: "" }],
        })
      }

      if (matchingClaim) {
        // Update transaction with claimId
        await transactionsCollection.updateOne(
          { _id: transaction._id },
          {
            $set: {
              claimId: matchingClaim.claimId,
              updatedAt: new Date(),
              matchedAt: new Date(),
              matchStrategy: getMatchStrategy(transaction, matchingClaim),
            },
          },
        )

        const claimUpdates = {}
        if (!matchingClaim.razorpayOrderId && transaction.razorpay_order_id) {
          claimUpdates.razorpayOrderId = transaction.razorpay_order_id
        }
        if (!matchingClaim.paymentId && transaction.razorpay_payment_id) {
          claimUpdates.paymentId = transaction.razorpay_payment_id
        }

        if (Object.keys(claimUpdates).length > 0) {
          claimUpdates.updatedAt = new Date()
          claimUpdates.matchedAt = new Date()

          await claimsCollection.updateOne({ claimId: matchingClaim.claimId }, { $set: claimUpdates })
        }

        matchedCount++
        console.log("[v0] Matched transaction", transaction.razorpay_payment_id, "with claim", matchingClaim.claimId)
      }
    }

    console.log(`[v0] Successfully matched ${matchedCount} transactions with claims`)
  } catch (error) {
    console.error("[v0] Error matching transactions with claims:", error)
  }
}

function getMatchStrategy(transaction, claim) {
  if (claim.razorpayOrderId === transaction.razorpay_order_id) return "order_id"
  if (claim.paymentId === transaction.razorpay_payment_id) return "payment_id"
  if (
    claim.email === transaction.email &&
    (claim.phoneNumber === transaction.contact || claim.phone === transaction.contact)
  )
    return "email_contact"
  if (claim.email === transaction.email) return "email_only"
  return "unknown"
}

async function getTransactions(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("order") || "desc"

    const { db } = await connectToDatabase()
    const transactionsCollection = db.collection("razorpay_transactions")

    // Build search query
    const query: any = {}
    if (search) {
      query.$or = [
        { razorpay_payment_id: { $regex: search, $options: "i" } },
        { razorpay_order_id: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } },
        { claimId: { $regex: search, $options: "i" } },
      ]
    }

    if (status && status !== "all") {
      query.status = status
    }

    console.log("Transactions query:", JSON.stringify(query, null, 2))

    // Build sort object
    const sortObj: any = {}
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1

    // Get total count for pagination
    const total = await transactionsCollection.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    console.log(`Transactions pagination: page=${page}, limit=${limit}, skip=${skip}, total=${total}`)

    // Fetch paginated data
    const transactions = await transactionsCollection.find(query).sort(sortObj).skip(skip).limit(limit).toArray()

    console.log(`Found ${transactions.length} transactions`)

    // Convert ObjectId to string and format dates
    const formattedTransactions = transactions.map((transaction) => ({
      ...transaction,
      _id: transaction._id.toString(),
      id: transaction._id.toString(),
      created_at: transaction.created_at?.toISOString(),
      captured_at: transaction.captured_at?.toISOString(),
      refunded_at: transaction.refunded_at?.toISOString(),
      createdAt: transaction.createdAt?.toISOString(),
      updatedAt: transaction.updatedAt?.toISOString(),
    }))

    return NextResponse.json({
      transactions: formattedTransactions,
      data: formattedTransactions,
      count: total,
      total,
      page,
      totalPages,
      limit,
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      {
        transactions: [],
        data: [],
        count: 0,
        total: 0,
        page: 1,
        totalPages: 0,
        limit: 10,
        error: "Failed to fetch transactions",
      },
      { status: 500 },
    )
  }
}
