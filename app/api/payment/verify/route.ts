import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { connectToDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("Payment verification started")

    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, claimId } = body

    console.log("Payment verification data:", {
      razorpay_order_id,
      razorpay_payment_id,
      claimId,
      signature_received: !!razorpay_signature,
    })

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !claimId) {
      console.error("Missing required payment verification fields")
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment verification fields",
        },
        { status: 400 },
      )
    }

    // Verify Razorpay signature
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      console.error("Razorpay secret key not configured")
      return NextResponse.json(
        {
          success: false,
          error: "Payment configuration error",
        },
        { status: 500 },
      )
    }

    const body_string = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", secret).update(body_string).digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
      console.error("Invalid payment signature")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment signature",
        },
        { status: 400 },
      )
    }

    console.log("Payment signature verified successfully")

    // Connect to database and update claim
    const { db } = await connectToDatabase()
    const claimsCollection = db.collection("claims")

    // First, get the claim details
    const claim = await claimsCollection.findOne({ claimId })

    if (!claim) {
      console.error("Claim not found:", claimId)
      return NextResponse.json(
        {
          success: false,
          error: "Claim not found",
        },
        { status: 404 },
      )
    }

    console.log("Found claim for payment update:", claim.claimId)

    // Update claim with payment information
    const updateResult = await claimsCollection.updateOne(
      { claimId },
      {
        $set: {
          paymentStatus: "paid",
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          paidAt: new Date(),
          updatedAt: new Date(),
          // Keep OTT status as pending until automation processes it
          ottStatus: "pending",
        },
      },
    )

    if (updateResult.matchedCount === 0) {
      console.error("Failed to update claim payment status")
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update payment status",
        },
        { status: 500 },
      )
    }

    console.log("Claim payment status updated successfully")

    // Send payment success email
    try {
      console.log("Sending payment success email...")
      const customerName = `${claim.firstName} ${claim.lastName}`

      await sendEmail({
        to: claim.email,
        subject: "🎉 Payment Successful - OTT Code Processing Started - SYSTECH IT SOLUTIONS",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0fdf4;">
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Payment Successful!</h1>
              <p style="color: #dcfce7; margin: 10px 0 0 0; font-size: 16px;">Your OTT code is being processed</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #22c55e;">
                <h2 style="color: #15803d; margin: 0 0 10px 0; font-size: 20px;">Payment Details</h2>
                <p style="margin: 5px 0; color: #374151;"><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Order ID:</strong> ${razorpay_order_id}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Claim ID:</strong> ${claimId}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Customer:</strong> ${customerName}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Amount Paid:</strong> ₹99</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">Successful</span></p>
                <p style="margin: 5px 0; color: #374151;"><strong>OTT Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Processing</span></p>
              </div>

              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">What Happens Next?</h3>
                <ol style="color: #374151; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;"> Your claim will be processed automatically .</li>
                  <li style="margin-bottom: 8px;">OTT code will be generated and assigned</li>
                  <li style="margin-bottom: 8px;">You'll receive the code within 24-48 hours</li>
                  <li>Start enjoying your premium OTT subscription!</li>
                </ol>
              </div>

              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px; text-align: center;">
                  <strong>Processing Time:</strong> Your OTT code will be delivered to this email address within 24-48 hours. Please check your inbox and spam folder.
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Need help? Contact us at <a href="mailto:support@systechdigital.in" style="color: #3b82f6;">support@systechdigital.in</a>
                </p>
              </div>
            </div>
          </div>
        `,
      })

      console.log("Payment success email sent successfully")
    } catch (emailError) {
      console.error("Failed to send payment success email:", emailError)
      // Don't fail the payment verification if email fails
    }

    // Trigger automation processing
    try {
      console.log("Triggering automation for claim:", claimId)
      const automationResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/webhook/claims-trigger`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ claimId }),
        },
      )

      if (automationResponse.ok) {
        console.log("Automation triggered successfully")
      } else {
        console.error("Failed to trigger automation")
      }
    } catch (automationError) {
      console.error("Error triggering automation:", automationError)
      // Don't fail payment verification if automation trigger fails
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and claim updated successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      claimId,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Payment verification failed",
      },
      { status: 500 },
    )
  }
}
