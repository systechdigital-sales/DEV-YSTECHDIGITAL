import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import type { PaymentRecord, ClaimResponse } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, claim_id } = body

    console.log("Payment verification started:", { razorpay_payment_id, claim_id })

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex")

    if (razorpay_signature !== expectedSign) {
      console.error("Invalid payment signature")
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get claim details
    const claim = await db.collection<ClaimResponse>("claims").findOne({ id: claim_id })
    if (!claim) {
      console.error("Claim not found:", claim_id)
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 })
    }

    // Create payment record
    const paymentRecord: PaymentRecord = {
      id: `payment_${Date.now()}`,
      claimId: claim_id,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: 99,
      currency: "INR",
      status: "success",
      customerEmail: claim.email,
      customerName: `${claim.firstName} ${claim.lastName}`,
      createdAt: new Date().toISOString(),
    }

    // Save payment record
    await db.collection<PaymentRecord>("payments").insertOne(paymentRecord)

    // Update claim status
    await db.collection<ClaimResponse>("claims").updateOne(
      { id: claim_id },
      {
        $set: {
          paymentStatus: "completed",
          paymentId: razorpay_payment_id,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    // Send success email
    try {
      await sendEmail(claim.email, "Payment Successful - OTT Key Processing - SYSTECH DIGITAL", "payment_success", {
        ...claim,
        paymentId: razorpay_payment_id,
      })
      console.log("Payment success email sent")
    } catch (emailError) {
      console.error("Failed to send payment success email:", emailError)
    }

    console.log("Payment verification completed successfully")
    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 })
  }
}
