import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Claim, SalesRecord, OTTKey } from "@/lib/models"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      streetAddress,
      city,
      state,
      pincode,
      activationCode,
      adminPassword,
    } = await request.json()

    // Validate admin password
    if (adminPassword !== "Tr!ckyH@ck3r#2025") {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 })
    }

    // Validate required fields
    if (!firstName || !email || !activationCode) {
      return NextResponse.json({ error: "First name, email, and activation code are required" }, { status: 400 })
    }

    await connectDB()

    // Check if activation code exists in sales records
    const salesRecord = await SalesRecord.findOne({
      activationCode: activationCode,
    })

    if (!salesRecord) {
      return NextResponse.json({ error: "Activation code not found in sales records" }, { status: 404 })
    }

    // Check if already claimed
    if (salesRecord.status === "claimed") {
      return NextResponse.json({ error: "Activation code already claimed" }, { status: 400 })
    }

    // Create a new claim record
    const newClaim = new Claim({
      firstName: firstName,
      lastName: lastName || "",
      email: email,
      phoneNumber: phoneNumber || "",
      phone: phoneNumber || "",
      streetAddress: streetAddress || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      activationCode: activationCode,
      paymentStatus: "paid", // Manual claims are considered paid
      ottStatus: "pending",
      amount: 99,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const savedClaim = await newClaim.save()

    // Find available OTT key
    const availableKey = await OTTKey.findOne({
      status: "available",
    })

    if (!availableKey) {
      return NextResponse.json({ error: "No available OTT keys" }, { status: 404 })
    }

    // Update the claim with OTT code
    await Claim.findByIdAndUpdate(savedClaim._id, {
      ottStatus: "delivered",
      ottCode: availableKey.activationCode,
      deliveredAt: new Date(),
      updatedAt: new Date(),
    })

    // Update the OTT key
    await OTTKey.findByIdAndUpdate(availableKey._id, {
      status: "assigned",
      assignedEmail: email,
      assignedDate: new Date(),
      updatedAt: new Date(),
    })

    // Update the sales record
    await SalesRecord.findByIdAndUpdate(salesRecord._id, {
      status: "claimed",
      claimedBy: email,
      claimedDate: new Date(),
      updatedAt: new Date(),
    })

    // Send email with activation code
    await sendOTTKeyEmail(email, `${firstName} ${lastName}`, availableKey.activationCode, activationCode)

    return NextResponse.json({
      success: true,
      message: `Manual claim processed successfully. OTT code ${availableKey.activationCode} assigned to ${email}`,
      data: {
        claimId: savedClaim._id,
        ottCode: availableKey.activationCode,
        email: email,
      },
    })
  } catch (error) {
    console.error("Manual claim processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Email sending function
async function sendOTTKeyEmail(email: string, name: string, ottKey: string, activationCode: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "🎉 Your OTT Platform Access Key - SYSTECH DIGITAL",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your OTT platform access has been manually processed and approved by our admin team. 
              You can now enjoy premium streaming content.
            </p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Great news! Your OTT platform access has been manually processed and approved by our admin team. 
              You can now enjoy premium streaming content.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">📱 Your Access Details:</h3>
              <p style="margin: 10px 0;"><strong>Activation Code:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${activationCode}</code></p>
              <p style="margin: 10px 0;"><strong>OTT Platform Key:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #d63384;">${ottKey}</code></p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
              <h4 style="color: #856404; margin-top: 0;">📋 How to Use Your Access:</h4>
              <ol style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Download the OTT platform app</li>
                <li>Create your account or login</li>
                <li>Go to "Redeem Code" or "Activate Subscription"</li>
                <li>Enter your OTT Platform Key: <strong>${ottKey}</strong></li>
                <li>Enjoy unlimited streaming!</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; margin: 0;">This access was manually processed by our admin team</p>
              <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Processing Date: ${new Date().toLocaleDateString("en-IN")}</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                Need help? Contact us at <a href="mailto:support@systechdigital.in" style="color: #667eea;">support@systechdigital.in</a>
              </p>
              <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">
                © 2024 SYSTECH DIGITAL. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log("OTT key email sent successfully to:", email)
  } catch (error) {
    console.error("Error sending OTT key email:", error)
    throw error
  }
}
