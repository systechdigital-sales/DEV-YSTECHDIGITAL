import { NextResponse } from "next/server"

// Mock OTT keys database
const mockOTTKeys = [
  {
    id: "1",
    productSubCategory: "Premium",
    product: "OTTplay Annual",
    activationCode: "OTT123456789",
    status: "available",
  },
  {
    id: "2",
    productSubCategory: "Premium",
    product: "OTTplay Annual",
    activationCode: "OTT987654321",
    status: "used",
    assignedEmail: "john.doe@example.com",
    assignedDate: "2025-01-20T10:30:00Z",
  },
  {
    id: "3",
    productSubCategory: "Premium",
    product: "OTTplay Annual",
    activationCode: "OTT555666777",
    status: "available",
  },
]

export async function GET() {
  return NextResponse.json(mockOTTKeys)
}
