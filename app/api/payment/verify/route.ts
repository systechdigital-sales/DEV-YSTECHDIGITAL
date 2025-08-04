import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, claim_id } = body

    console.log("Payment verification request:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      claim_id,
    })

    // Verify Razorpay signature
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      throw new Error("Razorpay secret key not configured")
    }

    const body_string = razorpay_order_id + "|" + razorpay_payment_id
    const expected_signature = crypto.createHmac("sha256", secret).update(body_string).digest("hex")

    const is_authentic = expected_signature === razorpay_signature

    if (!is_authentic) {
      console.error("Invalid payment signature")
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 })
    }

    console.log("Payment signature verified successfully")

    // Update claim in database
    const db = await getDatabase()
    const claimsCollection = db.collection("claims")

    const updateResult = await claimsCollection.updateOne(
      { id: claim_id },
      {
        $set: {
          paymentStatus: "paid",
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          updatedAt: new Date(),
        },
      },
    )

    if (updateResult.matchedCount === 0) {
      console.error("Claim not found:", claim_id)
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 })
    }

    console.log("Claim updated successfully:", claim_id)

    // Get updated claim for email
    const updatedClaim = await claimsCollection.findOne({ id: claim_id })

    if (updatedClaim) {
      // Send payment success email
      try {
        await sendEmail({
          to: updatedClaim.email,
          subject: "Payment Successful - OTT Code Processing",
          template: "payment_success_detailed",
          data: {
            customerName: `${updatedClaim.firstName} ${updatedClaim.lastName}`,
            email: updatedClaim.email,
            phone: updatedClaim.phone,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            claimId: claim_id,
            amount: "₹99",
            date: new Date().toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          },
        })
        console.log("Payment success email sent to:", updatedClaim.email)
      } catch (emailError) {
        console.error("Failed to send payment success email:", emailError)
        // Don't fail the payment verification if email fails
      }

      // --- NEW: Trigger automation immediately after successful payment ---
      try {
        console.log(`Triggering automation for claim ID: ${claim_id}`)
        const automationTriggerResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/webhook/claims-trigger`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            // Optionally send claim_id if the webhook needs to process a specific claim
            // body: JSON.stringify({ claimId: claim_id }),
          },
        )
        const automationResult = await automationTriggerResponse.json()
        console.log("Automation trigger response:", automationResult)
        if (!automationTriggerResponse.ok) {
          console.error("Failed to trigger automation:", automationResult.error)
        }
      } catch (automationError) {
        console.error("Error triggering automation webhook:", automationError)
      }
      // --- END NEW ---
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and claim updated successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    })
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ success: false, error: error.message || "Payment verification failed" }, { status: 500 })
  }
}
