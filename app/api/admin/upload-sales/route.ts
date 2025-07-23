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
      return NextResponse.json({ success: false, error: "File is empty" }, { status: 400 })
    }

    // Transform data to match our schema
    const salesRecords: SalesRecord[] = jsonData.map((row: any, index: number) => {
      // Flexible column mapping - try different possible column names
      const getColumnValue = (possibleNames: string[]) => {
        for (const name of possibleNames) {
          if (row[name] !== undefined && row[name] !== null && row[name] !== "") {
            return String(row[name]).trim()
          }
        }
        return ""
      }

      const productSubCategory = getColumnValue([
        "Product Sub Category",
        "ProductSubCategory",
        "product_sub_category",
        "Category",
        "Sub Category",
      ])

      const product = getColumnValue(["Product", "Product Name", "ProductName", "product_name", "Name"])

      const activationCode = getColumnValue([
        "Activation Code",
        "ActivationCode",
        "activation_code",
        "Code",
        "Serial",
        "Key",
      ])

      // Validate required fields
      if (!productSubCategory || !product || !activationCode) {
        throw new Error(`Row ${index + 1}: Missing required fields (Product Sub Category, Product, Activation Code)`)
      }

      return {
        id: `sales_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        productSubCategory,
        product,
        activationCode,
        createdAt: new Date().toISOString(),
      }
    })

    // Save to database
    const db = await getDatabase()

    // Clear existing sales data
    await db.collection<SalesRecord>("sales").deleteMany({})

    // Insert new data
    const result = await db.collection<SalesRecord>("sales").insertMany(salesRecords)

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${result.insertedCount} sales records`,
      count: result.insertedCount,
    })
  } catch (error) {
    console.error("Error uploading sales file:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload sales file",
      },
      { status: 500 },
    )
  }
}
