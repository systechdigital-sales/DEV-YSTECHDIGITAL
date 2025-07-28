export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { IOTTKey, OTTKey } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const keys = await db.collection<IOTTKey>("ottkeys").find({}).toArray()

    const formattedKeys: OTTKey[] = keys.map((key) => ({
      ...key,
      id: key._id.toString(),
      createdAt: key.createdAt ? key.createdAt.toISOString() : undefined,
      updatedAt: key.updatedAt ? key.updatedAt.toISOString() : undefined,
      assignedDate: key.assignedDate ? key.assignedDate.toISOString() : undefined,
    }))

    return NextResponse.json(formattedKeys)
  } catch (error: any) {
    console.error("Error fetching OTT keys:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch OTT keys" }, { status: 500 })
  }
}
