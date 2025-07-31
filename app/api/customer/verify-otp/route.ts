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

    // Find the OTP record
    const otpRecord = await db.collection("customer_otps").findOne({ email: normalizedEmail })

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "OTP not found or expired. Please request a new one." },
        { status: 400 },
      )
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await db.collection("customer_otps").deleteOne({ email: normalizedEmail }) // Clean up expired OTP
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 },
      )
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      // Increment attempt count
      await db.collection("customer_otps").updateOne({ email: normalizedEmail }, { $inc: { attempts: 1 } })

      // Optionally, add a lockout mechanism after too many failed attempts
      if (otpRecord.attempts + 1 >= 3) {
        // 3 attempts including the current one
        await db.collection("customer_otps").deleteOne({ email: normalizedEmail }) // Invalidate OTP after too many attempts
        return NextResponse.json(
          { success: false, message: "Too many failed OTP attempts. Please request a new OTP." },
          { status: 401 },
        )
      }

      return NextResponse.json({ success: false, message: "Invalid OTP. Please try again." }, { status: 401 })
    }

    // OTP is valid, delete it to prevent reuse
    await db.collection("customer_otps").deleteOne({ email: normalizedEmail })

    return NextResponse.json({ success: true, message: "OTP verified successfully" })
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return NextResponse.json(
      { success: false, message: "Failed to verify OTP. Please try again later." },
      { status: 500 },
    )
  }
}
