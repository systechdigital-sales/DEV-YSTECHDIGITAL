import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const db = await getDatabase()
    const keys = await db.collection("ottKeys").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      keys: keys,
    })
  } catch (error) {
    console.error("Error fetching OTT keys:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch OTT keys" }, { status: 500 })
  }
}
