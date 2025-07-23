import { NextResponse } from "next/server"

// Mock sales database
let mockSalesRecords = [
  {
    id: "1",
    productSubCategory: "Smartphone",
    product: "Galaxy S25",
    activationCode: "SM-S25-12345678",
  },
  {
    id: "2",
    productSubCategory: "Tablet",
    product: "iPad Pro 2025",
    activationCode: "IP-PRO-87654321",
  },
  {
    id: "3",
    productSubCategory: "Laptop",
    product: "MacBook Air M4",
    activationCode: "MBA-M4-11223344",
  },
  {
    id: "4",
    productSubCategory: "Smart TV",
    product: "Sony Bravia XR",
    activationCode: "SONY-XR-55667788",
  },
  {
    id: "5",
    productSubCategory: "Software",
    product: "Adobe Creative Cloud",
    activationCode: "ADOBE-CC-99887766",
  },
]

export async function GET() {
  return NextResponse.json(mockSalesRecords)
}

export async function POST(request: Request) {
  try {
    const newRecords = await request.json()

    if (!Array.isArray(newRecords)) {
      return NextResponse.json({ success: false, error: "Invalid data format" }, { status: 400 })
    }

    // Add IDs to new records
    const recordsWithIds = newRecords.map((record, index) => ({
      id: `new-${Date.now()}-${index}`,
      ...record,
    }))

    // In a real implementation, you would save to a database
    // For this mock, we'll just add to our array
    mockSalesRecords = [...mockSalesRecords, ...recordsWithIds]

    return NextResponse.json({ success: true, count: recordsWithIds.length })
  } catch (error) {
    console.error("Error saving sales records:", error)
    return NextResponse.json({ success: false, error: "Failed to save sales records" }, { status: 500 })
  }
}
