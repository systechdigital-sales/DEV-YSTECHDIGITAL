import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form data
    const claimData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      streetAddress: formData.get("streetAddress") as string,
      addressLine2: formData.get("addressLine2") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      postalCode: formData.get("postalCode") as string,
      country: formData.get("country") as string,
      purchaseType: formData.get("purchaseType") as string,
      activationCode: formData.get("activationCode") as string,
      purchaseDate: formData.get("purchaseDate") as string,
      invoiceNumber: formData.get("invoiceNumber") as string,
      sellerName: formData.get("sellerName") as string,
      agreeToTerms: formData.get("agreeToTerms") === "true",
    }

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "purchaseType",
      "activationCode",
      "purchaseDate",
    ]

    for (const field of requiredFields) {
      if (!claimData[field as keyof typeof claimData]) {
        return NextResponse.json({ success: false, message: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Generate claim ID
    const claimId = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Connect to database
    const { db } = await connectToDatabase()
    const claimsCollection = db.collection("claims")

    // Create claim record
    const claimRecord = {
      claimId,
      ...claimData,
      status: "pending",
      paymentStatus: "pending",
      ottCodeStatus: "pending", // Add this field to ensure OTT status is pending by default
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Save to database
    await claimsCollection.insertOne(claimRecord)

    // Send order placed email
    try {
      await sendEmail({
        to: claimData.email,
        subject: "Order Placed Successfully - OTT Code Claim",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Order Placed Successfully!</h1>
              <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 16px;">Your OTT code claim has been received</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
                <h2 style="color: #1e40af; margin: 0 0 10px 0; font-size: 20px;">Order Details</h2>
                <p style="margin: 5px 0; color: #374151;"><strong>Claim ID:</strong> ${claimId}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Customer:</strong> ${claimData.firstName} ${claimData.lastName}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${claimData.email}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Phone:</strong> ${claimData.phoneNumber}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Activation Code:</strong> ${claimData.activationCode}</p>
              </div>

              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #22c55e;">
                <h3 style="color: #15803d; margin: 0 0 15px 0; font-size: 18px;">Next Steps</h3>
                <ol style="color: #374151; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Complete the payment process (₹99)</li>
                  <li style="margin-bottom: 8px;">Your claim will be processed within 24-48 hours</li>
                  <li style="margin-bottom: 8px;">OTT code will be delivered to your email</li>
                  <li>Enjoy your premium OTT subscription!</li>
                </ol>
              </div>

              <div style="text-align: center; margin: 25px 0;">
                <p style="color: #6b7280; margin: 0;">Processing Fee: <strong style="color: #1f2937; font-size: 24px;">₹99</strong></p>
                <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">One-time payment • Includes all taxes</p>
              </div>

              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px; text-align: center;">
                  <strong>Important:</strong> Please complete the payment to process your claim. Your activation code will be verified and OTT access will be provided upon successful payment.
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Need help? Contact us at <a href="mailto:sales.systechdigital@gmail.com" style="color: #3b82f6;">sales.systechdigital@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error("Failed to send order placed email:", emailError)
      // Don't fail the request if email fails
    }

    // Create payment URL with all required parameters
    const paymentParams = new URLSearchParams({
      claimId,
      customerName: `${claimData.firstName} ${claimData.lastName}`,
      customerEmail: claimData.email,
      customerPhone: claimData.phoneNumber,
      amount: "99",
      activationCode: claimData.activationCode,
      purchaseType: claimData.purchaseType,
    })

    const redirectUrl = `/payment?${paymentParams.toString()}`

    return NextResponse.json({
      success: true,
      message: "Claim submitted successfully",
      claimId,
      redirectUrl,
    })
  } catch (error) {
    console.error("Error submitting claim:", error)
    return NextResponse.json({ success: false, message: "Failed to submit claim. Please try again." }, { status: 500 })
  }
}
