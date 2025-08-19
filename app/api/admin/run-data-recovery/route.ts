import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST() {
  try {
    const db = await getDatabase()

    // Import Razorpay for API calls
    const Razorpay = require("razorpay")
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const claimsCollection = db.collection("claims")
    const transactionsCollection = db.collection("razorpay_transactions")

    console.log("Starting data recovery process...")

    // Get date range for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Fetch Razorpay transactions from the last 30 days
    const razorpayPayments = await razorpay.payments.all({
      from: Math.floor(thirtyDaysAgo.getTime() / 1000),
      to: Math.floor(Date.now() / 1000),
      count: 100,
    })

    console.log(`Found ${razorpayPayments.items.length} Razorpay transactions to analyze`)

    // Get existing claims with payment IDs
    const existingClaims = await claimsCollection
      .find({
        paymentId: { $exists: true, $ne: null, $ne: "" },
      })
      .toArray()

    const existingPaymentIds = new Set(existingClaims.map((claim) => claim.paymentId))

    // Find missing claims
    const missingClaims = []
    const recoveredRecords = []
    const failedRecords = []

    for (const payment of razorpayPayments.items) {
      if (payment.status === "captured" && !existingPaymentIds.has(payment.id)) {
        missingClaims.push(payment)
      }
    }

    console.log(`Found ${missingClaims.length} missing claims records`)

    // Create missing claims records
    for (const payment of missingClaims) {
      try {
        const claimData = {
          email: payment.email || "recovered@systech.com",
          phone: payment.contact || "0000000000",
          paymentId: payment.id,
          amount: payment.amount,
          ottCodeStatus: "pending",
          createdAt: new Date(payment.created_at * 1000),
          recoveredAt: new Date(),
          isRecovered: true,
        }

        const result = await claimsCollection.insertOne(claimData)

        if (result.insertedId) {
          recoveredRecords.push({
            paymentId: payment.id,
            email: payment.email,
            amount: payment.amount / 100,
          })
          console.log(`Successfully recovered claim for payment: ${payment.id}`)
        }
      } catch (error) {
        console.error(`Failed to recover claim for payment ${payment.id}:`, error)
        failedRecords.push({
          paymentId: payment.id,
          error: error.message,
        })
      }
    }

    const recoveryMessage = `Data recovery completed! Successfully recovered ${recoveredRecords.length} missing claims records. ${failedRecords.length > 0 ? `Failed to recover ${failedRecords.length} records.` : ""}`

    console.log(recoveryMessage)

    return NextResponse.json({
      success: true,
      message: recoveryMessage,
      data: {
        recoveredCount: recoveredRecords.length,
        failedCount: failedRecords.length,
        recoveredRecords,
        failedRecords,
      },
    })
  } catch (error: any) {
    console.error("Data recovery error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Data recovery failed: ${error.message}`,
        data: null,
      },
      { status: 500 },
    )
  }
}
