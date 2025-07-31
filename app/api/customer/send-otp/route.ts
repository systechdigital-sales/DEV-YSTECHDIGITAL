import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import type { Collection } from "mongodb"

interface OTPRecord {
  email: string
  otp: string
  createdAt: Date
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    let db
    try {
      const { db: connectedDb } = await getDatabase()
      db = connectedDb
    } catch (dbError) {
      console.error("Error connecting to database for OTP:", dbError)
      return NextResponse.json({ message: "Database connection failed. Please try again later." }, { status: 500 })
    }

    // Check if the email exists in the 'ottkeys' collection (Assigned To field)
    const ottKeysCollection: Collection = db.collection("ottkeys")
    try {
      const userExists = await ottKeysCollection.findOne({ "Assigned To": email })

      if (!userExists) {
        console.warn(`Attempted OTP request for unregistered email: ${email}`)
        return NextResponse.json(
          { message: "Email not found. Please check your email address or sign up." },
          { status: 404 },
        )
      }
    } catch (queryError) {
      console.error(`Error querying ottkeys collection for email ${email}:`, queryError)
      return NextResponse.json(
        { message: "An error occurred while verifying your email. Please try again later." },
        { status: 500 },
      )
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit OTP

    // Store OTP in a temporary collection (e.g., 'otps') with an expiry
    const otpsCollection: Collection<OTPRecord> = db.collection("otps")
    try {
      await otpsCollection.insertOne({
        email,
        otp,
        createdAt: new Date(),
      })
      // Ensure TTL index exists for automatic cleanup (e.g., 5 minutes)
      await otpsCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 300 }) // 300 seconds = 5 minutes
    } catch (otpStoreError) {
      console.error(`Error storing OTP for ${email}:`, otpStoreError)
      return NextResponse.json({ message: "Failed to generate OTP. Please try again later." }, { status: 500 })
    }

    // Send OTP via email
    const emailSent = await sendEmail({
      to: email,
      subject: "Your OTP for Systech OTT Platform",
      text: `Your One-Time Password (OTP) is: ${otp}. This OTP is valid for 5 minutes.`,
      html: `<p>Your One-Time Password (OTP) is: <strong>${otp}</strong>.</p><p>This OTP is valid for 5 minutes.</p><p>If you did not request this, please ignore this email.</p>`,
    })

    if (emailSent) {
      return NextResponse.json(
        { message: "OTP sent successfully! Please check your inbox and spam folder." },
        { status: 200 },
      )
    } else {
      console.error(`Email sending failed for ${email}. Check email service configuration.`)
      return NextResponse.json(
        { message: "Failed to send OTP email. Please check your email configuration and try again later." },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Unexpected error in send-otp API:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred while sending OTP. Please try again later." },
      { status: 500 },
    )
  }
}
