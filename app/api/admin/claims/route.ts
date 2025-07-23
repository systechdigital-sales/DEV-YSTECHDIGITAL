import { NextResponse } from "next/server"

// Mock database - in production, use a real database
const mockClaimResponses = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    country: "India",
    purchaseType: "hardware",
    activationCode: "HW123456789",
    purchaseDate: "15-Jan-2025",
    claimSubmissionDate: "20-Jan-2025",
    paymentStatus: "completed",
    ottCodeStatus: "sent",
    createdAt: "2025-01-20T10:30:00Z",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+91 9876543211",
    country: "India",
    purchaseType: "software",
    activationCode: "SW987654321",
    purchaseDate: "18-Jan-2025",
    claimSubmissionDate: "22-Jan-2025",
    paymentStatus: "completed",
    ottCodeStatus: "pending",
    createdAt: "2025-01-22T14:15:00Z",
  },
]

export async function GET() {
  return NextResponse.json(mockClaimResponses)
}
