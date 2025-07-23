import { NextResponse } from "next/server"

// Mock sales database
const mockSalesRecords = [
  {
    id: "1",
    productSubCategory: "Antivirus Software",
    product: "SYSTECH Antivirus Pro 2025",
    activationCode: "SW987654321",
  },
  {
    id: "2",
    productSubCategory: "Security Hardware",
    product: "SYSTECH Security Device Model X1",
    activationCode: "HW123456789",
  },
  {
    id: "3",
    productSubCategory: "Network Security",
    product: "SYSTECH Firewall Enterprise",
    activationCode: "HW555666777",
  },
  {
    id: "4",
    productSubCategory: "Mobile Security",
    product: "SYSTECH Mobile Guard Premium",
    activationCode: "SW111222333",
  },
  {
    id: "5",
    productSubCategory: "Cloud Security",
    product: "SYSTECH Cloud Shield Business",
    activationCode: "SW444555666",
  },
]

export async function GET() {
  return NextResponse.json(mockSalesRecords)
}

export async function POST(request: Request) {
  try {
    const salesData = await request.json()

    // Add new sales records
    const newRecords = salesData.map((record: any, index: number) => ({
      id: (mockSalesRecords.length + index + 1).toString(),
      productSubCategory: record.productSubCategory,
      product: record.product,
      activationCode: record.activationCode,
    }))

    mockSalesRecords.push(...newRecords)

    return NextResponse.json({
      success: true,
      count: newRecords.length,
      message: "Sales records added successfully",
    })
  } catch (error) {
    console.error("Error adding sales records:", error)
    return NextResponse.json({ success: false, error: "Failed to add sales records" }, { status: 500 })
  }
}
