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

    while (hasMore) {
      const payments = await razorpay.payments.all({
        count: count,
        skip: skip,
      })

      allPayments.push(...payments.items)

      // Check if there are more payments to fetch
      hasMore = payments.items.length === count
      skip += count

      // Add a small delay to avoid rate limiting
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    let syncedCount = 0
    let updatedCount = 0

    for (const payment of allPayments) {
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
        created_at: new Date(payment.created_at * 1000), // Convert Unix timestamp
        captured_at: payment.captured_at ? new Date(payment.captured_at * 1000) : undefined,
        updatedAt: new Date(),
      }

      if (existingTransaction) {
        // Update existing transaction
        await transactionsCollection.updateOne({ razorpay_payment_id: payment.id }, { $set: transactionData })
        updatedCount++
      } else {
        // Insert new transaction
        await transactionsCollection.insertOne({
          ...transactionData,
          createdAt: new Date(),
        })
        syncedCount++
      }
    }

    // Try to match transactions with claims
    await matchTransactionsWithClaims()

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} new transactions, updated ${updatedCount} existing transactions from ${allPayments.length} total payments`,
      syncedCount,
      updatedCount,
      totalFetched: allPayments.length,
    })
  } catch (error) {
    console.error("Error syncing transactions:", error)
    return NextResponse.json({ error: "Failed to sync transactions from Razorpay" }, { status: 500 })
  }
}

async function matchTransactionsWithClaims() {
  try {
    const { db } = await connectToDatabase()
    const transactionsCollection = db.collection("razorpay_transactions")
    const claimsCollection = db.collection("claims")

    // Find transactions without claimId
    const unmatchedTransactions = await transactionsCollection
      .find({
        claimId: { $exists: false },
      })
      .toArray()

    for (const transaction of unmatchedTransactions) {
      // Try to find matching claim by razorpay_order_id
      const matchingClaim = await claimsCollection.findOne({
        razorpayOrderId: transaction.razorpay_order_id,
      })

      if (matchingClaim) {
        // Update transaction with claimId
        await transactionsCollection.updateOne(
          { _id: transaction._id },
          {
            $set: {
              claimId: matchingClaim.claimId,
              updatedAt: new Date(),
            },
          },
        )
      }
    }
  } catch (error) {
    console.error("Error matching transactions with claims:", error)
  }
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
      data: formattedTransactions,
      total,
      page,
      totalPages,
      limit,
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      {
        data: [],
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
