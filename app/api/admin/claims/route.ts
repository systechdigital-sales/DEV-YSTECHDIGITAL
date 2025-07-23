import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ClaimResponse } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const claims = await db.collection<ClaimResponse>("claims").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      data: claims,
      count: claims.length,
    })
  } catch (error) {
    console.error("Error fetching claims:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch claims" }, { status: 500 })
  }
}
