import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Email and OTP are required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Connect to database
    const { db } = await connectToDatabase()

    // Find OTP record
    const otpRecord = await db.collection("customer_otps").findOne({ email: normalizedEmail })

    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "No OTP found for this email. Please request a new OTP.",
        },
        { status: 404 },
      )
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await db.collection("customer_otps").deleteOne({ email: normalizedEmail })
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired. Please request a new one.",
        },
        { status: 400 },
      )
    }

    // Check attempt limit
    if (otpRecord.attempts >= 3) {
      await db.collection("customer_otps").deleteOne({ email: normalizedEmail })
      return NextResponse.json(
        {
          success: false,
          message: "Too many failed attempts. Please request a new OTP.",
        },
        { status: 400 },
      )
    }

    // Verify OTP
    if (otpRecord.otp !== otp.trim()) {
      // Increment attempts
      await db.collection("customer_otps").updateOne({ email: normalizedEmail }, { $inc: { attempts: 1 } })

      const remainingAttempts = 3 - (otpRecord.attempts + 1)
      return NextResponse.json(
        {
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        },
        { status: 400 },
      )
    }

    // OTP is valid - clean up
    await db.collection("customer_otps").deleteOne({ email: normalizedEmail })

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    })
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return NextResponse.json(
      { success: false, message: "Failed to verify OTP. Please try again later." },
      { status: 500 },
    )
  }
}
