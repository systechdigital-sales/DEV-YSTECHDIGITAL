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

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ]

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Please upload Excel (.xlsx, .xls) or CSV files only." },
        { status: 400 },
      )
    }

    // Read file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse Excel/CSV file
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    if (jsonData.length === 0) {
      return NextResponse.json({ success: false, error: "File is empty or has no data" }, { status: 400 })
    }

    // Map and validate data
    const salesRecords: SalesRecord[] = []
    const errors: string[] = []

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any
      const rowNum = i + 2 // Excel row number (accounting for header)

      // Find column values with flexible matching
      const productSubCategory =
        row["Product Sub Category"] ||
        row["product sub category"] ||
        row["ProductSubCategory"] ||
        row["Category"] ||
        row["category"] ||
        ""

      const product =
        row["Product"] || row["product"] || row["Product Name"] || row["product name"] || row["ProductName"] || ""

      const activationCode =
        row["Activation Code/ Serial No / IMEI Number"] ||
        row["Activation Code"] ||
        row["activation code"] ||
        row["Serial No"] ||
        row["serial no"] ||
        row["IMEI Number"] ||
        row["imei number"] ||
        row["Code"] ||
        row["code"] ||
        ""

      // Validate required fields
      if (!productSubCategory || !product || !activationCode) {
        errors.push(`Row ${rowNum}: Missing required fields. Need Product Sub Category, Product, and Activation Code.`)
        continue
      }

      salesRecords.push({
        id: `sales_${Date.now()}_${i}`,
        productSubCategory: String(productSubCategory).trim(),
        product: String(product).trim(),
        activationCode: String(activationCode).trim(),
        createdAt: new Date().toISOString(),
      })
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Data validation failed",
          details: errors,
        },
        { status: 400 },
      )
    }

    if (salesRecords.length === 0) {
      return NextResponse.json({ success: false, error: "No valid records found in the file" }, { status: 400 })
    }

    // Save to database
    const db = await getDatabase()

    // Clear existing sales records (optional - remove if you want to append)
    await db.collection<SalesRecord>("sales").deleteMany({})

    // Insert new records
    const result = await db.collection<SalesRecord>("sales").insertMany(salesRecords)

    console.log(`Uploaded ${result.insertedCount} sales records`)

    return NextResponse.json({
      success: true,
      count: result.insertedCount,
      message: `Successfully uploaded ${result.insertedCount} sales records`,
    })
  } catch (error) {
    console.error("Error uploading sales data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
