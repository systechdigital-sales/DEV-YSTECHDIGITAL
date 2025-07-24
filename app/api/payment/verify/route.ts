import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, claimId } = await request.json()

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 })
    }

    // Update claim status in database
    const db = await getDatabase()
    const updateResult = await db.collection("claims").updateOne(
      { id: claimId },
      {
        $set: {
          paymentStatus: "completed",
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 })
    }

    // Get claim details for email
    const claim = await db.collection("claims").findOne({ id: claimId })

    if (claim) {
      // Send payment success email
      try {
        await sendEmail(claim.email, "Payment Successful - OTT Claim Processing Started", "payment_success", {
          ...claim,
          paymentId: razorpay_payment_id,
        })
      } catch (emailError) {
        console.error("Failed to send payment success email:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 })
  }
}
