import { type NextRequest, NextResponse } from "next/server"

// In-memory store for OTPs (should match the one in send-otp)
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>()

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Email and OTP are required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedOTP = otp.trim()

    // Get stored OTP data
    const storedData = otpStore.get(normalizedEmail)

    if (!storedData) {
      return NextResponse.json({ success: false, message: "OTP not found. Please request a new one." }, { status: 400 })
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expires) {
      otpStore.delete(normalizedEmail)
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 },
      )
    }

    // Check attempts (max 3 attempts)
    if (storedData.attempts >= 3) {
      otpStore.delete(normalizedEmail)
      return NextResponse.json(
        { success: false, message: "Too many failed attempts. Please request a new OTP." },
        { status: 400 },
      )
    }

    // Verify OTP
    if (storedData.otp !== normalizedOTP) {
      storedData.attempts++
      return NextResponse.json(
        {
          success: false,
          message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.`,
        },
        { status: 400 },
      )
    }

    // OTP is valid - remove from store
    otpStore.delete(normalizedEmail)

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      email: normalizedEmail,
    })
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return NextResponse.json({ success: false, message: "Failed to verify OTP. Please try again." }, { status: 500 })
  }
}
