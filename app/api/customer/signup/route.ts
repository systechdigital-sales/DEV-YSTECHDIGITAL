import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Collection } from "mongodb"
import { signupFormSchema } from "@/lib/definitions"
import type { IOTTKey } from "@/models/OTTKey"
import type { IClaimResponse } from "@/models/ClaimResponse"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = signupFormSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, email, phone } = validation.data

    let db
    try {
      const { db: connectedDb } = await getDatabase()
      db = connectedDb
    } catch (dbError) {
      console.error("Error connecting to database for signup:", dbError)
      return NextResponse.json({ message: "Database connection failed. Please try again later." }, { status: 500 })
    }

    // Check if email already exists in claims
    const claimsCollection: Collection<IClaimResponse> = db.collection("claimresponses")
    try {
      const existingClaim = await claimsCollection.findOne({ email })
      if (existingClaim) {
        return NextResponse.json({ message: "This email is already registered." }, { status: 409 })
      }
    } catch (queryError) {
      console.error(`Error checking existing claim for ${email}:`, queryError)
      return NextResponse.json(
        { message: "An error occurred during registration. Please try again later." },
        { status: 500 },
      )
    }

    // Find an available OTT key
    const ottKeysCollection: Collection<IOTTKey> = db.collection("ottkeys")
    let assignedOttKey: IOTTKey | null = null
    try {
      assignedOttKey = await ottKeysCollection.findOneAndUpdate(
        { status: "available" },
        { $set: { status: "assigned", assignedTo: email, assignedAt: new Date() } },
        { returnDocument: "after" },
      )

      if (!assignedOttKey.value) {
        return NextResponse.json(
          { message: "No available OTT codes at the moment. Please try again later." },
          { status: 503 },
        )
      }
    } catch (ottKeyError) {
      console.error(`Error assigning OTT key for ${email}:`, ottKeyError)
      return NextResponse.json({ message: "Failed to assign an OTT code. Please try again later." }, { status: 500 })
    }

    // Create a new claim record
    try {
      const newClaim: IClaimResponse = {
        name,
        email,
        phone,
        ottCode: assignedOttKey.value.ottCode,
        status: "approved", // Assuming signup directly approves and assigns code
        claimedAt: new Date(),
        approvedAt: new Date(),
      }
      await claimsCollection.insertOne(newClaim)
    } catch (claimInsertError) {
      console.error(`Error inserting new claim for ${email}:`, claimInsertError)
      // If claim insertion fails, try to revert OTT key status
      await ottKeysCollection.findOneAndUpdate(
        { ottCode: assignedOttKey.value.ottCode },
        { $set: { status: "available", assignedTo: null, assignedAt: null } },
      )
      return NextResponse.json({ message: "Failed to complete registration. Please try again later." }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Registration successful! Your OTT Code has been assigned.",
        ottCode: assignedOttKey.value.ottCode,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Unexpected error in signup API:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred during signup. Please try again later." },
      { status: 500 },
    )
  }
}
