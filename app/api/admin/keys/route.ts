import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { OTTKey } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const keys = await db.collection<OTTKey>("ott_keys").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(keys)
  } catch (error) {
    console.error("Error fetching OTT keys:", error)
    return NextResponse.json({ error: "Failed to fetch OTT keys" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const keysData = await request.json()
    const db = await getDatabase()

    // If it's an array, insert many; if single object, insert one
    if (Array.isArray(keysData)) {
      const result = await db.collection<OTTKey>("ott_keys").insertMany(keysData)
      return NextResponse.json({ success: true, count: result.insertedCount })
    } else {
      const result = await db.collection<OTTKey>("ott_keys").insertOne({
        ...keysData,
        createdAt: new Date().toISOString(),
      })
      return NextResponse.json({ success: true, id: result.insertedId })
    }
  } catch (error) {
    console.error("Error saving OTT keys:", error)
    return NextResponse.json({ error: "Failed to save OTT keys" }, { status: 500 })
  }
}
