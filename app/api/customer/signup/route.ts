import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { signupFormSchema } from "@/lib/definitions"
import type { IOTTKey } from "@/models/OTTKey"
import type { IClaimResponse } from "@/models/ClaimResponse"
import type { Collection } from "mongodb"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = signupFormSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, email, phone } = validation.data
    const normalizedEmail = email.toLowerCase().trim()

    let db
    try {
      const { db: connectedDb } = await getDatabase()
      db = connectedDb
    } catch (dbError) {
      console.error("Error connecting to database for signup route:", dbError)
      return NextResponse.json(
        { message: "Failed to connect to the database. Please try again later." },
        { status: 500 },
      )
    }

    // Check if email already exists in claims
    const claimsCollection: Collection<IClaimResponse> = db.collection("claimresponses")
    try {
      const existingClaim = await claimsCollection.findOne({ email: normalizedEmail })
      if (existingClaim) {
        return NextResponse.json(
          { message: "An account with this email already exists. Please login instead." },
          { status: 409 },
        )
      }
    } catch (checkError) {
      console.error("Error checking existing claim:", checkError)
      return NextResponse.json({ message: "An error occurred during signup. Please try again later." }, { status: 500 })
    }

    // Find an available OTT key
    const ottKeysCollection: Collection<IOTTKey> = db.collection("ottkeys")
    let assignedOttKey: IOTTKey | null = null
    try {
      const result = await ottKeysCollection.findOneAndUpdate(
        { status: "available" },
        { $set: { status: "assigned", assignedTo: normalizedEmail, assignedAt: new Date() } },
        { returnDocument: "after" }, // Use returnDocument for MongoDB driver 4.x+
      )
      assignedOttKey = result.value
      console.log("Found and assigned OTT key:", assignedOttKey?.ottCode)
    } catch (ottKeyError) {
      console.error("Error assigning OTT key:", ottKeyError)
      return NextResponse.json({ message: "Failed to assign an OTT code. Please try again later." }, { status: 500 })
    }

    if (!assignedOttKey) {
      return NextResponse.json(
        { message: "No available OTT codes at the moment. Please try again later." },
        { status: 503 },
      )
    }

    // Create a new claim response
    const newClaim: IClaimResponse = {
      name,
      email: normalizedEmail,
      phone,
      ottCode: assignedOttKey.ottCode,
      status: "delivered", // Mark as delivered since it's assigned
      claimedAt: new Date(),
      approvedAt: new Date(),
      deliveryMethod: "email", // Assuming email delivery
      deliveryStatus: "sent",
      deliveredAt: new Date(),
      paymentStatus: "paid", // Assuming signup implies payment is handled or not required for this flow
    }

    try {
      await claimsCollection.insertOne(newClaim)
      console.log("New claim saved:", newClaim.email)
    } catch (saveError) {
      console.error("Error saving new claim:", saveError)
      // If saving claim fails, try to revert OTT key status
      await ottKeysCollection
        .findOneAndUpdate(
          { ottCode: assignedOttKey.ottCode },
          { $set: { status: "available", assignedTo: null, assignedAt: null } },
        )
        .catch((revertError) => console.error("Failed to revert OTT key status:", revertError))
      return NextResponse.json({ message: "Failed to create your account. Please try again later." }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Account created and OTT code assigned successfully!",
        ottCode: assignedOttKey.ottCode,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("An unexpected error occurred in signup route:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred during signup. Please try again later." },
      { status: 500 },
    )
  }
}
