import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ]

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls") &&
      !file.name.endsWith(".csv")
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Please upload Excel (.xlsx, .xls) or CSV file." },
        { status: 400 },
      )
    }

    // Read file content
    const bytes = await file.arrayBuffer()

    // Parse Excel/CSV file
    const workbook = XLSX.read(bytes, { type: "array" })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (data.length === 0) {
      return NextResponse.json({ success: false, error: "File contains no data" }, { status: 400 })
    }

    // Check if required columns exist
    const firstRow = data[0] as Record<string, any>
    const headers = Object.keys(firstRow).map((h) => h.toLowerCase())

    // Check for required columns (flexible matching)
    const hasProductSubCategory = headers.some(
      (h) => h.includes("product") && h.includes("sub") && h.includes("category"),
    )
    const hasProduct = headers.some((h) => h.includes("product") && !h.includes("sub"))
    const hasActivationCode = headers.some((h) => h.includes("activation") || h.includes("code"))

    if (!hasProductSubCategory || !hasProduct || !hasActivationCode) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file format. Please ensure columns: Product Sub Category, Product, Activation Code",
        },
        { status: 400 },
      )
    }

    // Map data to our format
    const keysData = data
      .map((row: Record<string, any>) => {
        // Find the actual column names from the file
        const productSubCategoryKey =
          Object.keys(row).find((k) => k.toLowerCase().includes("product") && k.toLowerCase().includes("sub")) || ""

        const productKey =
          Object.keys(row).find((k) => k.toLowerCase().includes("product") && !k.toLowerCase().includes("sub")) || ""

        const activationCodeKey =
          Object.keys(row).find((k) => k.toLowerCase().includes("activation") || k.toLowerCase().includes("code")) || ""

        return {
          productSubCategory: row[productSubCategoryKey] || "",
          product: row[productKey] || "",
          activationCode: row[activationCodeKey] || "",
          status: "available",
        }
      })
      .filter((item) => item.activationCode && item.product && item.productSubCategory)

    if (keysData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid data found after processing",
        },
        { status: 400 },
      )
    }

    // In a real implementation, save to database
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      count: keysData.length,
      message: `Successfully uploaded ${keysData.length} OTT keys`,
    })
  } catch (error) {
    console.error("Error uploading OTT keys file:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process file. Please ensure it's a valid Excel or CSV file.",
      },
      { status: 500 },
    )
  }
}
