import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import * as XLSX from "xlsx"
import type { SalesRecord } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Read Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    console.log("Excel data parsed:", data.length, "rows")

    const db = await getDatabase()
    const salesRecords: SalesRecord[] = []

    for (const row of data as any[]) {
      // Flexible column mapping
      const customerName = row["Customer Name"] || row["Name"] || row["customer_name"] || ""
      const email = row["Email"] || row["email"] || row["Email Address"] || ""
      const phone = row["Phone"] || row["phone"] || row["Phone Number"] || ""
      const activationCode = row["Activation Code"] || row["Code"] || row["activation_code"] || ""
      const purchaseDate = row["Purchase Date"] || row["Date"] || row["purchase_date"] || ""
      const productType = row["Product Type"] || row["Product"] || row["product_type"] || "OTT Subscription"
      const amount = Number.parseFloat(row["Amount"] || row["amount"] || "0")

      if (customerName && email && activationCode) {
        const salesRecord: SalesRecord = {
          id: `sales_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customerName,
          email,
          phone,
          activationCode,
          purchaseDate,
          productType,
          amount,
          status: "active",
          createdAt: new Date().toISOString(),
        }
        salesRecords.push(salesRecord)
      }
    }

    if (salesRecords.length > 0) {
      await db.collection<SalesRecord>("sales").insertMany(salesRecords)
      console.log(`Inserted ${salesRecords.length} sales records`)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${salesRecords.length} sales records`,
      count: salesRecords.length,
    })
  } catch (error) {
    console.error("Error uploading sales data:", error)
    return NextResponse.json({ success: false, error: "Failed to upload sales data" }, { status: 500 })
  }
}
