import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

// Rate limiting storage (in production, use Redis or database)
const otpAttempts = new Map<string, { count: number; resetTime: number }>()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email address" }, { status: 400 })
    }

    // Rate limiting check
    const now = Date.now()
    const attemptKey = normalizedEmail
    const attempts = otpAttempts.get(attemptKey)

    if (attempts && attempts.count >= 3 && now < attempts.resetTime) {
      const remainingTime = Math.ceil((attempts.resetTime - now) / 1000 / 60)
      return NextResponse.json(
        {
          success: false,
          message: `Too many OTP requests. Please try again in ${remainingTime} minutes.`,
        },
        { status: 429 },
      )
    }

    // Reset attempts if time window has passed
    if (attempts && now >= attempts.resetTime) {
      otpAttempts.delete(attemptKey)
    }

    // Connect to database and check if email exists in ottkeys collection
    const { db } = await connectToDatabase()

    const ottKey = await db.collection("ottkeys").findOne({
      "Assigned To": { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    })

    if (!ottKey) {
      return NextResponse.json(
        {
          success: false,
          message: "No OTT key found for this email address. Please contact support if you believe this is an error.",
        },
        { status: 404 },
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP in database with expiration (10 minutes)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await db.collection("customer_otps").deleteMany({ email: normalizedEmail })
    await db.collection("customer_otps").insertOne({
      email: normalizedEmail,
      otp,
      expiresAt: otpExpiry,
      attempts: 0,
      createdAt: new Date(),
    })

    // Send OTP email
    const emailSent = await sendEmail({
      to: normalizedEmail,
      subject: "Your OTT Dashboard Login Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">SYSTECH DIGITAL</h1>
            <h2 style="color: #374151; margin-bottom: 20px;">Your Login Code</h2>
          </div>
          
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h3 style="color: white; margin-bottom: 15px;">Your 6-Digit Code</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 8px;">${otp}</span>
            </div>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #374151; margin-bottom: 10px;">Important:</h4>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>This code expires in <strong>10 minutes</strong></li>
              <li>Use this code to access your OTT activation dashboard</li>
              <li>Don't share this code with anyone</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p>Need help? Contact us at <strong>sales.systechdigital@gmail.com</strong> or call <strong>+91 7709803412</strong></p>
            <p style="margin-top: 20px;">© 2024 SYSTECH DIGITAL. All rights reserved.</p>
          </div>
        </div>
      `,
    })

    if (!emailSent) {
      return NextResponse.json(
        { success: false, message: "Failed to send OTP email. Please try again." },
        { status: 500 },
      )
    }

    // Update rate limiting
    const currentAttempts = otpAttempts.get(attemptKey)
    if (currentAttempts) {
      otpAttempts.set(attemptKey, {
        count: currentAttempts.count + 1,
        resetTime: currentAttempts.resetTime,
      })
    } else {
      otpAttempts.set(attemptKey, {
        count: 1,
        resetTime: now + 15 * 60 * 1000, // 15 minutes
      })
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your email address",
    })
  } catch (error) {
    console.error("Error sending OTP:", error)
    return NextResponse.json(
      { success: false, message: "Failed to send OTP. Please try again later." },
      { status: 500 },
    )
  }
}
