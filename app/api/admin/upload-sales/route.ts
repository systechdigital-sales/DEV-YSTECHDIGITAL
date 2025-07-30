import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ISalesRecord } from "@/lib/models"
import { parseExcel, parseCSV } from "@/lib/excelParser" // Import the parser functions

export async function POST(request: Request) {
  try {
    const db = await getDatabase()
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 })
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    let json: any[] = []

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (fileExtension === "xlsx" || fileExtension === "xls") {
      json = parseExcel(buffer)
    } else if (fileExtension === "csv") {
      json = parseCSV(buffer.toString("utf-8"))
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported file type. Please upload .xlsx, .xls, or .csv." },
        { status: 400 },
      )
    }

    if (!json || json.length === 0) {
      return NextResponse.json({ success: false, error: "No data found in the uploaded file." }, { status: 400 })
    }

    let uploadedCount = 0
    const errors: string[] = []
    const recordsToInsert: ISalesRecord[] = []

    const requiredHeaders = ["Product Sub Category", "Product", "Activation Code/ Serial No / IMEI Number"]

    // Check if all required headers are present in the first row (keys of the first object)
    const actualHeaders = Object.keys(json[0] || {})
    const missingHeaders = requiredHeaders.filter((header) => !actualHeaders.includes(header))

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required column headers.",
          details: missingHeaders.map((header) => `Missing column: '${header}'`),
        },
        { status: 400 },
      )
    }

    for (let i = 0; i < json.length; i++) {
      const row = json[i]
      const rowNumber = i + 2 // +2 because Excel rows are 1-indexed and header is row 1

      const missingFields: string[] = []
      const productSubCategory = row["Product Sub Category"]?.toString().trim() || ""
      const product = row["Product"]?.toString().trim() || ""
      const activationCode = row["Activation Code/ Serial No / IMEI Number"]?.toString().trim() || ""
      const status = row["Status"]?.toString().trim() || "available" // Optional, default to 'available'

      if (!productSubCategory) missingFields.push("'Product Sub Category'")
      if (!product) missingFields.push("'Product'")
      if (!activationCode) missingFields.push("'Activation Code/ Serial No / IMEI Number'")

      if (missingFields.length > 0) {
        errors.push(`Row ${rowNumber}: Missing required field(s): ${missingFields.join(", ")}.`)
        continue
      }

      const newSalesRecord: ISalesRecord = {
        productSubCategory,
        product,
        activationCode,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      recordsToInsert.push(newSalesRecord)
    }

    if (recordsToInsert.length > 0) {
      try {
        // Use insertMany with ordered: false to continue inserting even if some fail (e.g., duplicates)
        const result = await db.collection<ISalesRecord>("salesrecords").insertMany(recordsToInsert, { ordered: false })
        uploadedCount = result.insertedCount
      } catch (dbError: any) {
        if (dbError.code === 11000 && dbError.writeErrors) {
          // Handle duplicate key errors specifically
          dbError.writeErrors.forEach((err: any) => {
            const duplicateValue = err.err.errmsg.match(/dup key: { : "([^"]+)" }/)?.[1] || "unknown"
            errors.push(`Duplicate Activation Code/ Serial No / IMEI Number: '${duplicateValue}'.`)
          })
          uploadedCount = recordsToInsert.length - dbError.writeErrors.length
        } else {
          console.error("Error during bulk insert of sales records:", dbError)
          errors.push(`Database error during bulk insert: ${dbError.message || "Unknown error"}`)
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: uploadedCount > 0, // Partial success if some records were uploaded
          count: uploadedCount,
          message: `Uploaded ${uploadedCount} records with errors in ${errors.length} rows.`,
          details: errors,
        },
        { status: uploadedCount > 0 ? 200 : 500 }, // 200 for partial success, 500 for full failure
      )
    }

    return NextResponse.json(
      { success: true, count: uploadedCount, message: `Successfully uploaded ${uploadedCount} sales records.` },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error processing sales upload:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
