import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId, type Collection } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, address, city, state, postalCode, activationCode } = await request.json()

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !postalCode || !activationCode) {
      return NextResponse.json({ success: false, error: "All fields are required." }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format." }, { status: 400 })
    }
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format. Must be 10 digits." },
        { status: 400 },
      )
    }
    if (!/^\d{6}$/.test(postalCode)) {
      return NextResponse.json(
        { success: false, error: "Invalid postal code format. Must be 6 digits." },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const claimsCollection: Collection = db.collection("claims")
    const salesCollection: Collection = db.collection("salesrecords")

    // Start a session for transaction
    const session = db.client.startSession()

    try {
      session.startTransaction()

      // 1. Verify activation code status in salesrecords
      const salesRecord = await salesCollection.findOne({ activationCode }, { session })

      if (!salesRecord) {
        await session.abortTransaction()
        return NextResponse.json({ success: false, error: "Activation code not found." }, { status: 404 })
      }

      if (salesRecord.status === "claimed") {
        await session.abortTransaction()
        return NextResponse.json(
          { success: false, error: "This activation code has already been claimed." },
          { status: 409 },
        )
      }

      if (salesRecord.status !== "available") {
        await session.abortTransaction()
        return NextResponse.json(
          { success: false, error: `Activation code status is '${salesRecord.status}'.` },
          { status: 400 },
        )
      }

      // 2. Create the new claim record
      const newClaimResponse = {
        _id: new ObjectId(), // Generate a new ObjectId for the claim
        id: new ObjectId().toHexString(), // A string ID for external use if needed
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        postalCode,
        activationCode,
        paymentStatus: "pending", // Initial status before payment
        ottCodeStatus: "pending", // Initial status before automation assigns code
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const insertResult = await claimsCollection.insertOne(newClaimResponse, { session })

      if (!insertResult.acknowledged) {
        await session.abortTransaction()
        throw new Error("Failed to insert claim response.")
      }

      // IMPORTANT: salesRecord status is NOT updated to "claimed" here.
      // It will be updated by the automation process after payment verification.

      await session.commitTransaction()

      // Construct redirect URL for payment gateway
      const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment?claimId=${newClaimResponse.id}&amount=99&customerName=${encodeURIComponent(firstName + " " + lastName)}&customerEmail=${encodeURIComponent(email)}&customerPhone=${encodeURIComponent(phone)}`

      return NextResponse.json({
        success: true,
        message: "Claim submitted successfully. Proceed to payment.",
        redirectUrl,
      })
    } catch (transactionError) {
      await session.abortTransaction()
      console.error("Transaction failed:", transactionError)
      return NextResponse.json(
        {
          success: false,
          error: (transactionError as Error).message || "Failed to submit claim due to a transaction error.",
        },
        { status: 500 },
      )
    } finally {
      await session.endSession()
    }
  } catch (error: any) {
    console.error("Error in OTT claim submission:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error." }, { status: 500 })
  }
}
