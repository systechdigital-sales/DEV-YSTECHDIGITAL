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

    // Connect to database
    let db
    try {
      ;({ db } = await connectToDatabase())
      console.log("Database connection established for send-otp route.")
    } catch (dbError) {
      console.error("Database connection error in send-otp route:", dbError)
      return NextResponse.json(
        { success: false, message: "Failed to connect to the database. Please try again later." },
        { status: 500 },
      )
    }

    // Check if email exists in ottkeys collection
    let ottKey
    try {
      // Corrected: Changed "Assigned To" to "assignedEmail" and added \s* for robust matching
      ottKey = await db.collection("ottkeys").findOne({
        assignedEmail: { $regex: new RegExp(`^\\s*${normalizedEmail}\\s*$`, "i") },
      })
      console.log(`Database query for email '${normalizedEmail}' completed. Found OTT key:`, !!ottKey)
    } catch (queryError) {
      console.error("Error querying ottkeys collection:", queryError)
      return NextResponse.json(
        { success: false, message: "Failed to retrieve OTT key information. Please try again later." },
        { status: 500 },
      )
    }

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
    const otpExpiryMinutes = 10 // Define OTP expiry in minutes

    // Store OTP in database with expiration (10 minutes)
    const otpExpiry = new Date(Date.now() + otpExpiryMinutes * 60 * 1000)

    try {
      await db.collection("customer_otps").deleteMany({ email: normalizedEmail })
      await db.collection("customer_otps").insertOne({
        email: normalizedEmail,
        otp,
        expiresAt: otpExpiry,
        attempts: 0,
        createdAt: new Date(),
      })
      console.log(`OTP stored for ${normalizedEmail}.`)
    } catch (otpDbError) {
      console.error("Error storing OTP in database:", otpDbError)
      return NextResponse.json(
        { success: false, message: "Failed to store OTP. Please try again later." },
        { status: 500 },
      )
    }

    // Send OTP email
    const emailSent = await sendEmail({
      to: normalizedEmail,
      subject: "Your SYSTECH DIGITAL Login Code", // Updated subject
      template: "otp_login_code", // Use the new template
      data: {
        otp: otp,
        otpExpiryMinutes: otpExpiryMinutes,
      },
    })

    if (!emailSent) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send OTP email. Please check your email address and spam folder, or try again later.",
        },
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
    console.error("An unexpected error occurred in send-otp route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while sending OTP. Please try again later." },
      { status: 500 },
    )
  }
}
