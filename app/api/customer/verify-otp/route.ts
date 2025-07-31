import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Collection } from "mongodb"

interface OTPRecord {
  email: string
  otp: string
  createdAt: Date
}

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 })
    }

    let db
    try {
      const { db: connectedDb } = await getDatabase()
      db = connectedDb
    } catch (dbError) {
      console.error("Error connecting to database for OTP verification:", dbError)
      return NextResponse.json({ message: "Database connection failed. Please try again later." }, { status: 500 })
    }

    const otpsCollection: Collection<OTPRecord> = db.collection("otps")
    let storedOtpRecord: OTPRecord | null = null
    try {
      storedOtpRecord = await otpsCollection.findOne({ email, otp })
    } catch (queryError) {
      console.error(`Error querying OTP for ${email}:`, queryError)
      return NextResponse.json(
        { message: "An error occurred during OTP verification. Please try again later." },
        { status: 500 },
      )
    }

    if (!storedOtpRecord) {
      return NextResponse.json({ message: "Invalid OTP or OTP expired." }, { status: 401 })
    }

    // OTP is valid, delete it to prevent reuse
    try {
      await otpsCollection.deleteOne({ _id: storedOtpRecord._id })
    } catch (deleteError) {
      console.error(`Error deleting used OTP for ${email}:`, deleteError)
      // Log error but don't block login, as OTP was already validated
    }

    return NextResponse.json({ message: "OTP verified successfully!" }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in verify-otp API:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred during OTP verification. Please try again later." },
      { status: 500 },
    )
  }
}
