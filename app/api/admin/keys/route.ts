import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { OTTKey } from "@/lib/models"
import { getFallbackOTTKeys, withFallback } from "@/lib/fallback-data"

export async function GET() {
  try {
    const keys = await withFallback(
      async () => {
        const db = await getDatabase()
        return db.collection<OTTKey>("ottKeys").find({}).sort({ createdAt: -1 }).toArray()
      },
      getFallbackOTTKeys(),
      "Error fetching OTT keys"
    )

    return NextResponse.json({ success: true, data: keys })
  } catch (error) {
    console.error("Error fetching OTT keys:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch OTT keys" }, { status: 500 })
  }
}
