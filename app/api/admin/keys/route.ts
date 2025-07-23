import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { OTTKey } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const keys = await db.collection<OTTKey>("ottKeys").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ success: true, data: keys })
  } catch (error) {
    console.error("Error fetching OTT keys:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch OTT keys" }, { status: 500 })
  }
}
