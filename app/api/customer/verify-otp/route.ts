import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Email and OTP are required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    let db
    try {
      ;({ db } = await connectToDatabase())
    } catch (dbError) {
      console.error("Database connection error in verify-otp route:", dbError)
      return NextResponse.json(
        { success: false, message: "Failed to connect to the database. Please try again later." },
        { status: 500 },
      )
    }

    let otpRecord
    try {
      otpRecord = await db.collection("customer_otps").findOne({ email: normalizedEmail })
      console.log(`OTP record lookup for ${normalizedEmail}:`, !!otpRecord)
    } catch (queryError) {
      console.error("Error querying customer_otps collection:", queryError)
      return NextResponse.json(
        { success: false, message: "Failed to retrieve OTP information. Please try again later." },
        { status: 500 },
      )
    }

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "OTP not found or expired. Please request a new one." },
        { status: 400 },
      )
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await db.collection("customer_otps").deleteOne({ _id: otpRecord._id })
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 },
      )
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      // Increment attempt count
      await db.collection("customer_otps").updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } })
      return NextResponse.json({ success: false, message: "Invalid OTP. Please try again." }, { status: 401 })
    }

    // OTP is valid, delete it from the database
    try {
      await db.collection("customer_otps").deleteOne({ _id: otpRecord._id })
      console.log(`OTP for ${normalizedEmail} successfully verified and deleted.`)
    } catch (deleteError) {
      console.error("Error deleting OTP record after successful verification:", deleteError)
      // Log the error but don't prevent success response as OTP was valid
    }

    return NextResponse.json({ success: true, message: "OTP verified successfully." })
  } catch (error) {
    console.error("An unexpected error occurred in verify-otp route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during OTP verification. Please try again later." },
      { status: 500 },
    )
  }
}
