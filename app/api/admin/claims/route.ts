import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ClaimResponse } from "@/lib/models"
import { getFallbackClaims, withFallback } from "@/lib/fallback-data"

export async function GET() {
  try {
    const claims = await withFallback(
      async () => {
        const db = await getDatabase()
        return db.collection<ClaimResponse>("claims").find({}).sort({ createdAt: -1 }).toArray()
      },
      getFallbackClaims(),
      "Error fetching claims"
    )

    return NextResponse.json({ success: true, data: claims })
  } catch (error) {
    console.error("Error fetching claims:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch claims" }, { status: 500 })
  }
}
