export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ISalesRecord, SalesRecord } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const sales = await db.collection<ISalesRecord>("salesrecords").find({}).toArray()

    const formattedSales: SalesRecord[] = sales.map((sale) => ({
      ...sale,
      id: sale._id?.toString() || "",
      _id: sale._id?.toString() || "",
      createdAt: sale.createdAt ? sale.createdAt.toISOString() : undefined,
      updatedAt: sale.updatedAt ? sale.updatedAt.toISOString() : undefined,
      claimedDate: sale.claimedDate ? sale.claimedDate.toISOString() : undefined,
    }))

    console.log(`Fetched ${formattedSales.length} sales records from systech_ott_platform`)

    return NextResponse.json(formattedSales)
  } catch (error: any) {
    console.error("Error fetching sales records:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch sales records" }, { status: 500 })
  }
}
