import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Collection } from "mongodb"
import type { IOTTKey } from "@/models/OTTKey"

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
      console.error("Error connecting to database for OTT key:", dbError)
      return NextResponse.json({ message: "Database connection failed. Please try again later." }, { status: 500 })
    }

    const ottKeysCollection: Collection<IOTTKey> = db.collection("ottkeys")
    let ottKey: IOTTKey | null = null
    try {
      ottKey = await ottKeysCollection.findOne({ assignedTo: normalizedEmail })
      console.log(`Fetched OTT key for email ${normalizedEmail}:`, !!ottKey)
    } catch (queryError) {
      console.error(`Error querying OTT key for ${normalizedEmail}:`, queryError)
      return NextResponse.json({ message: "Failed to retrieve your OTT key. Please try again later." }, { status: 500 })
    }

    if (!ottKey) {
      return NextResponse.json({ message: "No OTT key found for this email." }, { status: 404 })
    }

    return NextResponse.json({ ottKey }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in customer OTT key API:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred while fetching OTT key. Please try again later." },
      { status: 500 },
    )
  }
}
