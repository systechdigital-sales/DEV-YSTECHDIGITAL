import { NextResponse } from "next/server"

// Mock OTT keys database
const mockOTTKeys = [
  {
    id: "1",
    productSubCategory: "Premium Streaming",
    product: "Netflix Premium",
    activationCode: "OTT-NETFLIX-001",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
  },
  {
    id: "2",
    productSubCategory: "Premium Streaming",
    product: "Amazon Prime Video",
    activationCode: "OTT-PRIME-002",
    status: "used",
    assignedEmail: "john.doe@example.com",
    assignedDate: "2025-07-20T10:30:00Z",
  },
  {
    id: "3",
    productSubCategory: "Sports & Entertainment",
    product: "Disney+ Hotstar",
    activationCode: "OTT-HOTSTAR-003",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
  },
  {
    id: "4",
    productSubCategory: "Regional Content",
    product: "ZEE5 Premium",
    activationCode: "OTT-ZEE5-004",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
  },
  {
    id: "5",
    productSubCategory: "Entertainment",
    product: "Sony LIV Premium",
    activationCode: "OTT-SONY-005",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
  },
  {
    id: "6",
    productSubCategory: "Music & Entertainment",
    product: "Spotify Premium",
    activationCode: "OTT-SPOTIFY-006",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
  },
]

export async function GET() {
  return NextResponse.json(mockOTTKeys)
}

export async function POST(request: Request) {
  try {
    const keysData = await request.json()

    // Add new OTT keys
    const newKeys = keysData.map((key: any, index: number) => ({
      id: (mockOTTKeys.length + index + 1).toString(),
      productSubCategory: key.productSubCategory,
      product: key.product,
      activationCode: key.activationCode,
      status: "available",
      assignedEmail: null,
      assignedDate: null,
    }))

    mockOTTKeys.push(...newKeys)

    return NextResponse.json({
      success: true,
      count: newKeys.length,
      message: "OTT keys added successfully",
    })
  } catch (error) {
    console.error("Error adding OTT keys:", error)
    return NextResponse.json({ success: false, error: "Failed to add OTT keys" }, { status: 500 })
  }
}
