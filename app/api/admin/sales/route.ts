import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { SalesRecord } from "@/lib/models"
import { getFallbackSales, withFallback } from "@/lib/fallback-data"

export async function GET() {
  try {
    const sales = await withFallback(
      async () => {
        const db = await getDatabase()
        return db.collection<SalesRecord>("sales").find({}).sort({ createdAt: -1 }).toArray()
      },
      getFallbackSales(),
      "Error fetching sales"
    )

    return NextResponse.json({ success: true, data: sales })
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch sales" }, { status: 500 })
  }
}
