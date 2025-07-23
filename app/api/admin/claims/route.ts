import { NextResponse } from "next/server"

// Mock claims database
const mockClaimResponses = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+91-9876543210",
    country: "India",
    purchaseType: "hardware",
    activationCode: "HW123456789",
    purchaseDate: "2025-07-15",
    claimSubmissionDate: "2025-07-20",
    paymentStatus: "completed",
    ottCodeStatus: "sent",
    createdAt: "2025-07-20T10:30:00Z",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+91-9876543211",
    country: "India",
    purchaseType: "software",
    activationCode: "SW987654321",
    purchaseDate: "2025-07-18",
    claimSubmissionDate: "2025-07-22",
    paymentStatus: "completed",
    ottCodeStatus: "pending",
    createdAt: "2025-07-22T14:15:00Z",
  },
  {
    id: "3",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@example.com",
    phone: "+91-9876543212",
    country: "United States",
    purchaseType: "hardware",
    activationCode: "HW555666777",
    purchaseDate: "2025-07-10",
    claimSubmissionDate: "2025-07-23",
    paymentStatus: "pending",
    ottCodeStatus: "pending",
    createdAt: "2025-07-23T09:45:00Z",
  },
]

export async function GET() {
  return NextResponse.json(mockClaimResponses)
}
