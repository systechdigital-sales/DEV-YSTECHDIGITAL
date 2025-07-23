import { NextResponse } from "next/server"

// Mock OTT keys database
const mockOTTKeys = [
  {
    id: "1",
    productSubCategory: "Antivirus Software",
    product: "SYSTECH Antivirus Pro",
    activationCode: "OTT-NETFLIX-001",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
  },
  {
    id: "2",
    productSubCategory: "Security Hardware",
    product: "SYSTECH Security Device",
    activationCode: "OTT-PRIME-002",
    status: "used",
    assignedEmail: "john.doe@example.com",
    assignedDate: "2025-07-20T10:30:00Z",
  },
  {
    id: "3",
    productSubCategory: "Network Security",
    product: "SYSTECH Firewall",
    activationCode: "OTT-HOTSTAR-003",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
  },
  {
    id: "4",
    productSubCategory: "Mobile Security",
    product: "SYSTECH Mobile Guard",
    activationCode: "OTT-ZEE5-004",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
  },
  {
    id: "5",
    productSubCategory: "Cloud Security",
    product: "SYSTECH Cloud Shield",
    activationCode: "OTT-SONY-005",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
  },
]

export async function GET() {
  return NextResponse.json(mockOTTKeys)
}
