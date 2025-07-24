import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const db = await getDatabase()
    const claims = await db.collection("claims").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      claims: claims,
    })
  } catch (error) {
    console.error("Error fetching claims:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch claims" }, { status: 500 })
  }
}
