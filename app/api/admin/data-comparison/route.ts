import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    const claimsCollection = db.collection("claims")
    const transactionsCollection = db.collection("razorpay_transactions")

    // Get all claims with paymentId
    const claims = await claimsCollection
      .find({
        paymentId: { $exists: true, $ne: null, $ne: "" },
      })
      .toArray()

    // Get all razorpay transactions
    const transactions = await transactionsCollection.find({}).toArray()

    const matchedRecords = []
    const unclaimedPayments = []
    const paymentsWithoutClaims = []

    // Create maps for efficient lookup
    const claimsMap = new Map()
    claims.forEach((claim) => {
      if (claim.paymentId) {
        claimsMap.set(claim.paymentId, claim)
      }
    })

    const transactionsMap = new Map()
    transactions.forEach((transaction) => {
      if (transaction.razorpay_payment_id) {
        transactionsMap.set(transaction.razorpay_payment_id, transaction)
      }
    })

    // Find matched records and payments without claims
    transactions.forEach((transaction) => {
      const paymentId = transaction.razorpay_payment_id
      const matchingClaim = claimsMap.get(paymentId)

      if (matchingClaim) {
        matchedRecords.push({
          paymentId: paymentId,
          claimEmail: matchingClaim.email || "N/A",
          claimContact: matchingClaim.phone || "N/A",
          razorpayEmail: transaction.email || "N/A",
          razorpayContact: transaction.contact || "N/A",
          claimAmount: (matchingClaim.amount || 0) / 100,
          razorpayAmount: (transaction.amount || 0) / 100,
          claimStatus: matchingClaim.ottCodeStatus || "N/A",
          razorpayStatus: transaction.status || "N/A",
          claimDate: matchingClaim.createdAt ? new Date(matchingClaim.createdAt).toLocaleDateString() : "N/A",
          razorpayDate: transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : "N/A",
        })
      } else {
        paymentsWithoutClaims.push({
          razorpay_payment_id: paymentId,
          email: transaction.email || "N/A",
          contact: transaction.contact || "N/A",
          amount: (transaction.amount || 0) / 100,
          status: transaction.status || "N/A",
          created_at: transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : "N/A",
        })
      }
    })

    // Find claims without matching payments (unclaimed payments)
    claims.forEach((claim) => {
      const paymentId = claim.paymentId
      if (paymentId && !transactionsMap.has(paymentId)) {
        // This is a claim with a paymentId that doesn't exist in razorpay_transactions
        // We'll treat this as an unclaimed payment (though it might be a data inconsistency)
        unclaimedPayments.push({
          razorpay_payment_id: paymentId,
          email: claim.email || "N/A",
          contact: claim.phone || "N/A",
          amount: (claim.amount || 0) / 100,
          status: "claim_only",
          created_at: claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : "N/A",
        })
      }
    })

    const comparisonData = {
      matchedRecords,
      unclaimedPayments,
      paymentsWithoutClaims,
      stats: {
        totalClaims: claims.length,
        totalPayments: transactions.length,
        matchedCount: matchedRecords.length,
        unclaimedCount: unclaimedPayments.length,
        paymentsWithoutClaimsCount: paymentsWithoutClaims.length,
      },
    }

    return NextResponse.json({
      success: true,
      data: comparisonData,
      message: "Data comparison completed successfully",
    })
  } catch (error: any) {
    console.error("Data comparison error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to compare data",
        data: null,
      },
      { status: 500 },
    )
  }
}
