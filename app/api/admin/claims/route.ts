import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ClaimResponse } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const claims = await db.collection<ClaimResponse>("claims").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(claims)
  } catch (error) {
    console.error("Error fetching claims:", error)
    return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const claimData = await request.json()
    const db = await getDatabase()

    const result = await db.collection<ClaimResponse>("claims").insertOne({
      ...claimData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error saving claim:", error)
    return NextResponse.json({ error: "Failed to save claim" }, { status: 500 })
  }
}
