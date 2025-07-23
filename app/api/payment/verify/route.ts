import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail, emailTemplates } from "@/lib/email"
import type { ClaimResponse } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, claimId } = body

    // In a real implementation, verify the payment signature with Razorpay
    // For now, we'll simulate payment verification
    const isPaymentValid = razorpay_payment_id && razorpay_signature

    const db = await getDatabase()

    if (isPaymentValid) {
      // Payment successful - update claim status
      const updateResult = await db.collection<ClaimResponse>("claims").updateOne(
        { id: claimId },
        {
          $set: {
            paymentStatus: "completed",
            paymentId: razorpay_payment_id,
            ottCodeStatus: "payment_verified",
            updatedAt: new Date().toISOString(),
          },
        },
      )

      if (updateResult.matchedCount === 0) {
        return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 })
      }

      // Get updated claim data
      const claim = await db.collection<ClaimResponse>("claims").findOne({ id: claimId })

      if (claim) {
        // Send success email
        const fullName = `${claim.firstName} ${claim.lastName}`
        const emailTemplate = emailTemplates.claimSubmitted(fullName, claim.id)

        await sendEmail({
          to: claim.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        })

        console.log("Payment verified and email sent:", {
          claimId,
          paymentId: razorpay_payment_id,
          email: claim.email,
        })
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        claimId,
      })
    } else {
      // Payment failed - update claim status
      const updateResult = await db.collection<ClaimResponse>("claims").updateOne(
        { id: claimId },
        {
          $set: {
            paymentStatus: "failed",
            paymentId: razorpay_payment_id || null,
            ottCodeStatus: "payment_failed",
            updatedAt: new Date().toISOString(),
          },
        },
      )

      // Get claim data for failed payment email
      const claim = await db.collection<ClaimResponse>("claims").findOne({ id: claimId })

      if (claim) {
        // Send payment failed email
        const fullName = `${claim.firstName} ${claim.lastName}`
        const emailTemplate = emailTemplates.paymentFailed(fullName, claim.id)

        await sendEmail({
          to: claim.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        })

        console.log("Payment failed and email sent:", {
          claimId,
          email: claim.email,
        })
      }

      return NextResponse.json({
        success: false,
        message: "Payment verification failed",
        claimId,
      })
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 })
  }
}
