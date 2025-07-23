import { NextResponse } from "next/server"

// Mock sales database
const mockSalesRecords = [
  {
    id: "1",
    productSubCategory: "Antivirus Software",
    product: "SYSTECH Antivirus Pro",
    activationCode: "HW123456789",
  },
  {
    id: "2",
    productSubCategory: "Security Hardware",
    product: "SYSTECH Security Device",
    activationCode: "SW987654321",
  },
  {
    id: "3",
    productSubCategory: "Network Security",
    product: "SYSTECH Firewall",
    activationCode: "HW555666777",
  },
  {
    id: "4",
    productSubCategory: "Mobile Security",
    product: "SYSTECH Mobile Guard",
    activationCode: "MB111222333",
  },
  {
    id: "5",
    productSubCategory: "Cloud Security",
    product: "SYSTECH Cloud Shield",
    activationCode: "CS444555666",
  },
]

export async function GET() {
  return NextResponse.json(mockSalesRecords)
}
