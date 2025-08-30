import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { transactionId, razorpay_payment_id, razorpay_order_id, email, claimId } = await request.json()

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const claimsCollection = db.collection("claims")
    const transactionsCollection = db.collection("razorpay_transactions")

    // Get the transaction details
    const transaction = await transactionsCollection.findOne({ _id: transactionId })
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Find matching claim using multiple strategies
    let matchingClaim = null

    // Strategy 1: Match by claimId if provided
    if (claimId) {
      matchingClaim = await claimsCollection.findOne({ claimId: claimId })
    }

    // Strategy 2: Match by razorpay_order_id
    if (!matchingClaim && transaction.razorpay_order_id) {
      matchingClaim = await claimsCollection.findOne({
        razorpayOrderId: transaction.razorpay_order_id,
      })
    }

    // Strategy 3: Match by email and contact
    if (!matchingClaim && transaction.email) {
      matchingClaim = await claimsCollection.findOne({
        email: transaction.email,
        $or: [{ phoneNumber: transaction.contact }, { phone: transaction.contact }],
      })
    }

    // Strategy 4: Match by email only (most recent)
    if (!matchingClaim && transaction.email) {
      matchingClaim = await claimsCollection.findOne({ email: transaction.email }, { sort: { createdAt: -1 } })
    }

    if (!matchingClaim) {
      return NextResponse.json(
        {
          error: "No matching claim found for this transaction",
          details: "Could not find a claim with matching email, phone, or order ID",
        },
        { status: 404 },
      )
    }

    // Update the claim with transaction data
    const updateData = {
      updatedAt: new Date(),
      lastSyncedAt: new Date(),
      syncedFromRazorpay: true,
    }

    // Update payment status if transaction is captured
    if (transaction.status === "captured") {
      updateData.paymentStatus = "paid"
      updateData.paidAt = transaction.captured_at || transaction.created_at
      updateData.ottStatus = "pending"
    }

    // Update payment details
    if (transaction.razorpay_payment_id && !matchingClaim.paymentId) {
      updateData.paymentId = transaction.razorpay_payment_id
    }

    if (transaction.razorpay_order_id && !matchingClaim.razorpayOrderId) {
      updateData.razorpayOrderId = transaction.razorpay_order_id
    }

    // Update razorpay specific fields
    updateData.razorpayStatus = transaction.status
    updateData.razorpayAmount = transaction.amount

    // Update the claim
    const claimUpdateResult = await claimsCollection.updateOne({ _id: matchingClaim._id }, { $set: updateData })

    // Update the transaction with claimId if not already linked
    const transactionUpdateData = {
      updatedAt: new Date(),
      matchedAt: new Date(),
      matchStrategy: "manual_update",
    }

    if (!transaction.claimId) {
      transactionUpdateData.claimId = matchingClaim.claimId
    }

    const transactionUpdateResult = await transactionsCollection.updateOne(
      { _id: transaction._id },
      { $set: transactionUpdateData },
    )

    // Trigger automation if payment is captured
    if (transaction.status === "captured" && matchingClaim.claimId) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/webhook/claims-trigger`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claimId: matchingClaim.claimId }),
        })
        console.log(`🤖 Triggered automation for claim ${matchingClaim.claimId}`)
      } catch (automationError) {
        console.error(`Failed to trigger automation for ${matchingClaim.claimId}:`, automationError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Claim updated successfully from transaction data",
      claimId: matchingClaim.claimId,
      email: matchingClaim.email,
      paymentStatus: updateData.paymentStatus || matchingClaim.paymentStatus,
      claimUpdated: claimUpdateResult.modifiedCount > 0,
      transactionUpdated: transactionUpdateResult.modifiedCount > 0,
      matchStrategy: getMatchStrategy(transaction, matchingClaim),
      updatedFields: Object.keys(updateData),
    })
  } catch (error) {
    console.error("Error updating claim from transaction:", error)
    return NextResponse.json(
      {
        error: "Failed to update claim from transaction",
        details: error.message,
      },
      { status: 500 },
    )
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
  return "manual_match"
}
