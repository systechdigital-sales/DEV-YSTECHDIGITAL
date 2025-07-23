import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { SalesRecord } from "@/lib/models"

// Mock sales database
const mockSalesRecords = [
  {
    id: "1",
    productSubCategory: "Smartphone",
    product: "Galaxy S25",
    activationCode: "SM-S25-12345678",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    productSubCategory: "Tablet",
    product: "iPad Pro 2025",
    activationCode: "IP-PRO-87654321",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    productSubCategory: "Laptop",
    product: "MacBook Air M4",
    activationCode: "MBA-M4-11223344",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    productSubCategory: "Smart TV",
    product: "Sony Bravia XR",
    activationCode: "SONY-XR-55667788",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    productSubCategory: "Software",
    product: "Adobe Creative Cloud",
    activationCode: "ADOBE-CC-99887766",
    createdAt: new Date().toISOString(),
  },
]

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

    if (!Array.isArray(salesData)) {
      return NextResponse.json({ success: false, error: "Invalid data format" }, { status: 400 })
    }

    // Add IDs and timestamps to new records
    const recordsWithIds: SalesRecord[] = salesData.map((record, index) => ({
      id: `sale_${Date.now()}_${index}`,
      productSubCategory: record.productSubCategory,
      product: record.product,
      activationCode: record.activationCode,
      createdAt: new Date().toISOString(),
    }))

    // Insert all records
    const result = await db.collection<SalesRecord>("sales").insertMany(recordsWithIds)

    return NextResponse.json({
      success: true,
      count: result.insertedCount,
      message: `Successfully saved ${result.insertedCount} sales records`,
    })
  } catch (error) {
    console.error("Error saving sales records:", error)
    return NextResponse.json({ success: false, error: "Failed to save sales records" }, { status: 500 })
  }
}
