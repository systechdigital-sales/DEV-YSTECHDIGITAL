export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { IClaimResponse, ClaimResponse } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()

    // Sort by createdAt in descending order (-1)
    const claims = await db
      .collection<IClaimResponse>("claims")
      .find({})
      .sort({ createdAt: -1 }) // Add this line to sort in descending order
      .toArray()

    const formattedClaims: ClaimResponse[] = claims.map((claim) => ({
      ...claim,
      id: claim._id.toString(),
      createdAt: claim.createdAt ? claim.createdAt.toString() : "",
      updatedAt: claim.updatedAt ? claim.updatedAt.toString() : "",
    }))

    console.log(`Fetched ${formattedClaims.length} claims`)

    return NextResponse.json(formattedClaims)
  } catch (error: any) {
    console.error("Error fetching claims:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch claims" }, { status: 500 })
  }
}
