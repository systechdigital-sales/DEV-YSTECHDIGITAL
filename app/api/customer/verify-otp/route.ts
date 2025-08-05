import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    console.log("=== VERIFY OTP REQUEST START ===")
    const { email, otp } = await request.json()
    console.log("Received OTP verification request for email:", email, "OTP:", otp)

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Email and OTP are required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedOtp = otp.trim()

    console.log("Normalized email:", normalizedEmail)
    console.log("Normalized OTP:", normalizedOtp)

    // Connect to database
    let db
    try {
      ;({ db } = await connectToDatabase())
      console.log("Database connection established for verify-otp route.")
    } catch (dbError) {
      console.error("Database connection error in verify-otp route:", dbError)
      return NextResponse.json(
        { success: false, message: "Failed to connect to the database. Please try again later." },
        { status: 500 },
      )
    }

    // Find the OTP record
    let otpRecord
    try {
      otpRecord = await db.collection("customer_otps").findOne({
        email: normalizedEmail,
        otp: normalizedOtp,
      })
      console.log("OTP record found:", !!otpRecord)
    } catch (queryError) {
      console.error("Error querying OTP record:", queryError)
      return NextResponse.json(
        { success: false, message: "Failed to verify OTP. Please try again later." },
        { status: 500 },
      )
    }

    if (!otpRecord) {
      console.log("Invalid OTP or email combination")
      return NextResponse.json({ success: false, message: "Invalid OTP. Please check and try again." }, { status: 400 })
    }

    // Check if OTP has expired
    const now = new Date()
    if (now > otpRecord.expiresAt) {
      console.log("OTP has expired")
      // Clean up expired OTP
      try {
        await db.collection("customer_otps").deleteOne({ _id: otpRecord._id })
        console.log("Expired OTP cleaned up")
      } catch (cleanupError) {
        console.error("Error cleaning up expired OTP:", cleanupError)
      }
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 },
      )
    }

    // Check attempt count
    if (otpRecord.attempts >= 3) {
      console.log("Too many OTP attempts")
      // Clean up OTP after too many attempts
      try {
        await db.collection("customer_otps").deleteOne({ _id: otpRecord._id })
        console.log("OTP cleaned up after too many attempts")
      } catch (cleanupError) {
        console.error("Error cleaning up OTP after attempts:", cleanupError)
      }
      return NextResponse.json(
        { success: false, message: "Too many failed attempts. Please request a new OTP." },
        { status: 400 },
      )
    }

    // OTP is valid, clean it up
    try {
      await db.collection("customer_otps").deleteOne({ _id: otpRecord._id })
      console.log("Valid OTP cleaned up after successful verification")
    } catch (cleanupError) {
      console.error("Error cleaning up valid OTP:", cleanupError)
    }

    // Get user's OTT key information
    let ottKeyData = null
    try {
      console.log("Fetching OTT key data for authenticated user...")

      // Get all collections to search through
      const collections = await db.listCollections().toArray()
      console.log(
        "Available collections:",
        collections.map((c) => c.name),
      )

      // Filter collections that might contain OTT keys
      const possibleCollections = collections.filter(
        (c) =>
          c.name.toLowerCase().includes("ott") ||
          c.name.toLowerCase().includes("key") ||
          c.name.toLowerCase().includes("activation") ||
          c.name.toLowerCase().includes("claim") ||
          c.name.toLowerCase().includes("sales"),
      )

      console.log(
        "Possible OTT collections:",
        possibleCollections.map((c) => c.name),
      )

      // If no specific collections found, search all collections
      if (possibleCollections.length === 0) {
        console.log("No specific OTT collections found, searching all collections")
        possibleCollections.push(...collections)
      }

      // Search through each collection
      for (const collection of possibleCollections) {
        console.log(`Searching in collection: ${collection.name}`)

        // Different possible field names for email
        const emailFields = [
          "assignedEmail",
          "assigned_email",
          "email",
          "customerEmail",
          "customer_email",
          "userEmail",
          "user_email",
          "assignedTo",
          "assigned_to",
          "Assigned To",
          "Email",
          "Customer Email",
          "User Email",
        ]

        // Try each email field
        for (const field of emailFields) {
          try {
            // Try exact match first
            let query = { [field]: normalizedEmail }
            console.log(`Trying exact match query:`, query)

            ottKeyData = await db.collection(collection.name).findOne(query)

            if (ottKeyData) {
              console.log(`Found OTT key with exact match in ${collection.name} using field ${field}`)
              break
            }

            // Try case-insensitive regex match
            query = {
              [field]: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
            }
            console.log(`Trying regex match query:`, query)

            ottKeyData = await db.collection(collection.name).findOne(query)

            if (ottKeyData) {
              console.log(`Found OTT key with regex match in ${collection.name} using field ${field}`)
              break
            }
          } catch (queryError) {
            console.log(`Query failed for field ${field} in ${collection.name}:`, queryError.message)
            continue
          }
        }

        if (ottKeyData) {
          console.log("OTT key found, breaking collection loop")
          break
        }
      }

      console.log("OTT key data found:", !!ottKeyData)
    } catch (ottKeyError) {
      console.error("Error fetching OTT key data:", ottKeyError)
      // Don't fail the login if we can't fetch OTT key data
    }

    console.log("=== VERIFY OTP REQUEST SUCCESS ===")
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      user: {
        email: normalizedEmail,
        loginTime: new Date().toISOString(),
        ottKey: ottKeyData,
      },
    })
  } catch (error) {
    console.error("An unexpected error occurred in verify-otp route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while verifying OTP. Please try again later." },
      { status: 500 },
    )
  }
}
