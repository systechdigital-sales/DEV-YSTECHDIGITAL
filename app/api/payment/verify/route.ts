import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import crypto from "crypto"
import type { ClaimResponse, PaymentRecord } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, claimId } = body

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex")

    const isAuthentic = expectedSign === razorpay_signature

    const db = await getDatabase()

    if (isAuthentic) {
      // Payment successful
      const paymentRecord: PaymentRecord = {
        id: `payment_${Date.now()}`,
        claimId,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: 9900, // ₹99 in paise
        currency: "INR",
        status: "completed",
        razorpaySignature: razorpay_signature,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save payment record
      await db.collection<PaymentRecord>("payments").insertOne(paymentRecord)

      // Update claim status
      const updateResult = await db.collection<ClaimResponse>("claims").updateOne(
        { id: claimId },
        {
          $set: {
            paymentStatus: "completed",
            paymentId: razorpay_payment_id,
            updatedAt: new Date().toISOString(),
          },
        },
      )

      if (updateResult.matchedCount === 0) {
        return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 })
      }

      // Get claim data for email
      const claim = await db.collection<ClaimResponse>("claims").findOne({ id: claimId })

      if (claim) {
        // Send success email
        try {
          await sendEmail(
            claim.email,
            "Payment Successful - OTT Claim Processing - SYSTECH DIGITAL",
            "payment_success",
            {
              ...claim,
              paymentId: razorpay_payment_id,
            },
          )
        } catch (emailError) {
          console.error("Failed to send payment success email:", emailError)
        }
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
      })
    } else {
      // Payment failed
      const paymentRecord: PaymentRecord = {
        id: `payment_${Date.now()}`,
        claimId,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: 9900,
        currency: "INR",
        status: "failed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save failed payment record
      await db.collection<PaymentRecord>("payments").insertOne(paymentRecord)

      // Update claim status
      await db.collection<ClaimResponse>("claims").updateOne(
        { id: claimId },
        {
          $set: {
            paymentStatus: "failed",
            updatedAt: new Date().toISOString(),
          },
        },
      )

      // Get claim data for email
      const claim = await db.collection<ClaimResponse>("claims").findOne({ id: claimId })

      if (claim) {
        // Send failure email
        try {
          await sendEmail(claim.email, "Payment Failed - Please Try Again - SYSTECH DIGITAL", "payment_failed", {
            ...claim,
            claimId,
          })
        } catch (emailError) {
          console.error("Failed to send payment failure email:", emailError)
        }
      }

      return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 })
  }
}
