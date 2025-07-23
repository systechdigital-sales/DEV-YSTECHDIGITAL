import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ClaimResponse } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const claims = await db.collection<ClaimResponse>("claims").find({}).sort({ createdAt: -1 }).toArray()

    // Convert MongoDB _id to string and ensure id field exists
    const formattedClaims = claims.map((claim) => ({
      ...claim,
      id: claim.id || claim._id?.toString() || "",
      _id: undefined,
    }))

    return NextResponse.json(formattedClaims)
  } catch (error) {
    console.error("Error fetching claims:", error)
    return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const claimData = await request.json()
    const db = await getDatabase()

    const newClaim: ClaimResponse = {
      id: `claim_${Date.now()}`,
      ...claimData,
      createdAt: new Date().toISOString(),
    }

    const result = await db.collection<ClaimResponse>("claims").insertOne(newClaim)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      message: "Claim saved successfully",
    })
  } catch (error) {
    console.error("Error saving claim:", error)
    return NextResponse.json({ success: false, error: "Failed to save claim" }, { status: 500 })
  }
}
