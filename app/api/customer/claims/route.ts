import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Collection } from "mongodb"
import type { IClaimResponse } from "@/models/ClaimResponse"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ message: "Email parameter is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    let db
    try {
      const { db: connectedDb } = await getDatabase()
      db = connectedDb
    } catch (dbError) {
      console.error("Error connecting to database for customer claims:", dbError)
      return NextResponse.json({ message: "Database connection failed. Please try again later." }, { status: 500 })
    }

    const claimsCollection: Collection<IClaimResponse> = db.collection("claimresponses")
    let claim: IClaimResponse | null = null
    try {
      claim = await claimsCollection.findOne({ email: normalizedEmail })
      console.log(`Fetched claim for email ${normalizedEmail}:`, !!claim)
    } catch (queryError) {
      console.error(`Error querying claims for ${normalizedEmail}:`, queryError)
      return NextResponse.json(
        { message: "Failed to retrieve your claim data. Please try again later." },
        { status: 500 },
      )
    }

    if (!claim) {
      return NextResponse.json({ message: "No claim found for this email." }, { status: 404 })
    }

    return NextResponse.json({ claim }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in customer claims API:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred while fetching claims. Please try again later." },
      { status: 500 },
    )
  }
}
