import { NextResponse } from "next/server"

// Mock sales database
const mockSalesRecords = [
  {
    id: "1",
    count: 1,
    productCode: "HW123456789",
    codeStatus: "active",
    emailId: "john.doe@example.com",
  },
  {
    id: "2",
    count: 2,
    productCode: "SW987654321",
    codeStatus: "active",
    emailId: "jane.smith@example.com",
  },
  {
    id: "3",
    count: 3,
    productCode: "HW555666777",
    codeStatus: "inactive",
    emailId: "test@example.com",
  },
]

export async function GET() {
  return NextResponse.json(mockSalesRecords)
}
