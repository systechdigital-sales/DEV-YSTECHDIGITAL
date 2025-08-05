import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { connectToDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, claimId } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !claimId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Update claim in database
    const { db } = await connectToDatabase()
    const claimsCollection = db.collection("claims")

    const updateResult = await claimsCollection.updateOne(
      { claimId },
      {
        $set: {
          paymentStatus: "paid",
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 })
    }

    // Get claim details for email
    const claim = await claimsCollection.findOne({ claimId })

    if (claim) {
      // Send payment success email
      try {
        await sendEmail({
          to: claim.email,
          subject: "Payment Successful - OTT Code Processing Started",
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
                  <p style="margin: 5px 0; color: #374151;"><strong>Claim ID:</strong> ${claimId}</p>
                  <p style="margin: 5px 0; color: #374151;"><strong>Amount Paid:</strong> ₹99</p>
                  <p style="margin: 5px 0; color: #374151;"><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">Successful</span></p>
                </div>

                <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
                  <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">What Happens Next?</h3>
                  <ol style="color: #374151; margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Your activation code is being verified</li>
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
      } catch (emailError) {
        console.error("Failed to send payment success email:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      {
        error: "Payment verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
