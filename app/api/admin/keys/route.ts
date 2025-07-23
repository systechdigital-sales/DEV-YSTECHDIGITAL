import { NextResponse } from "next/server"

// Mock OTT keys database
let mockOTTKeys = [
  {
    id: "1",
    productSubCategory: "Streaming",
    product: "Netflix",
    activationCode: "NFLX-PREM-12345",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
  },
  {
    id: "2",
    productSubCategory: "Streaming",
    product: "Amazon Prime",
    activationCode: "AMZN-PRIME-67890",
    status: "assigned",
    assignedEmail: "john.doe@example.com",
    assignedDate: "2025-07-20T10:35:00Z",
  },
  {
    id: "3",
    productSubCategory: "Streaming",
    product: "Disney+",
    activationCode: "DSNY-PLUS-54321",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
  },
  {
    id: "4",
    productSubCategory: "Music",
    product: "Spotify Premium",
    activationCode: "SPTFY-PREM-98765",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
  },
  {
    id: "5",
    productSubCategory: "Gaming",
    product: "Xbox Game Pass",
    activationCode: "XBOX-PASS-13579",
    status: "assigned",
    assignedEmail: "jane.smith@example.com",
    assignedDate: "2025-07-22T14:20:00Z",
  },
]

export async function GET() {
  return NextResponse.json(mockOTTKeys)
}

export async function POST(request: Request) {
  try {
    const newKeys = await request.json()

    if (!Array.isArray(newKeys)) {
      return NextResponse.json({ success: false, error: "Invalid data format" }, { status: 400 })
    }

    // Add IDs and default status to new keys
    const keysWithIds = newKeys.map((key, index) => ({
      id: `new-${Date.now()}-${index}`,
      ...key,
      status: key.status || "available",
      assignedEmail: key.assignedEmail || null,
      assignedDate: key.assignedDate || null,
    }))

    // In a real implementation, you would save to a database
    // For this mock, we'll just add to our array
    mockOTTKeys = [...mockOTTKeys, ...keysWithIds]

    return NextResponse.json({ success: true, count: keysWithIds.length })
  } catch (error) {
    console.error("Error saving OTT keys:", error)
    return NextResponse.json({ success: false, error: "Failed to save OTT keys" }, { status: 500 })
  }
}
