import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { SalesRecord } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const sales = await db.collection<SalesRecord>("sales").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ success: true, data: sales })
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch sales" }, { status: 500 })
  }
}
