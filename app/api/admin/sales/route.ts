import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { SalesRecord } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const sales = await db.collection<SalesRecord>("sales").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(sales)
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const salesData = await request.json()
    const db = await getDatabase()

    // If it's an array, insert many; if single object, insert one
    if (Array.isArray(salesData)) {
      const result = await db.collection<SalesRecord>("sales").insertMany(salesData)
      return NextResponse.json({ success: true, count: result.insertedCount })
    } else {
      const result = await db.collection<SalesRecord>("sales").insertOne({
        ...salesData,
        createdAt: new Date().toISOString(),
      })
      return NextResponse.json({ success: true, id: result.insertedId })
    }
  } catch (error) {
    console.error("Error saving sales:", error)
    return NextResponse.json({ error: "Failed to save sales" }, { status: 500 })
  }
}
