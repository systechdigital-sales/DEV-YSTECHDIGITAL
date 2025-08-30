import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ISalesRecord } from "@/lib/models"
import { parseExcel, parseCSV } from "@/lib/excelParser"

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

    const stats = {
      totalInFile: json.length,
      duplicatesInFile: 0,
      existingInDatabase: 0,
      successfullyUploaded: 0,
      errors: [] as string[],
    }

    const recordsToInsert: ISalesRecord[] = []
    const requiredHeaders = ["Product Sub Category", "Product", "Activation Code/ Serial No / IMEI Number"]

    // Check if all required headers are present
    const actualHeaders = Object.keys(json[0] || {})
    const missingHeaders = requiredHeaders.filter((header) => !actualHeaders.includes(header))

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required column headers.",
          stats,
          details: missingHeaders.map((header) => `Missing column: '${header}'`),
        },
        { status: 400 },
      )
    }

    const existingActivationCodes = new Set(
      (
        await db
          .collection<ISalesRecord>("salesrecords")
          .find({}, { projection: { activationCode: 1 } })
          .toArray()
      ).map((record) => record.activationCode.toUpperCase()),
    )

    const fileActivationCodes = new Set<string>()

    for (let i = 0; i < json.length; i++) {
      const row = json[i]
      const rowNumber = i + 2

      const missingFields: string[] = []
      const productSubCategory = row["Product Sub Category"]?.toString().trim() || ""
      const product = row["Product"]?.toString().trim() || ""
      let activationCode = row["Activation Code/ Serial No / IMEI Number"]?.toString().trim() || ""
      const status = row["Status"]?.toString().trim() || "available"

      if (!productSubCategory) missingFields.push("'Product Sub Category'")
      if (!product) missingFields.push("'Product'")
      if (!activationCode) missingFields.push("'Activation Code/ Serial No / IMEI Number'")

      if (missingFields.length > 0) {
        stats.errors.push(`Row ${rowNumber}: Missing required field(s): ${missingFields.join(", ")}.`)
        continue
      }

      activationCode = activationCode.toUpperCase().trim()

      if (fileActivationCodes.has(activationCode)) {
        stats.duplicatesInFile++
        stats.errors.push(`Row ${rowNumber}: Duplicate Activation Code '${activationCode}' found within the file.`)
        continue
      }

      if (existingActivationCodes.has(activationCode)) {
        stats.existingInDatabase++
        stats.errors.push(`Row ${rowNumber}: Activation Code '${activationCode}' already exists in database.`)
        continue
      }

      fileActivationCodes.add(activationCode)

      const newSalesRecord: ISalesRecord = {
        productSubCategory,
        product,
        activationCode, // Now uppercase
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      recordsToInsert.push(newSalesRecord)
    }

    if (recordsToInsert.length > 0) {
      try {
        const result = await db.collection<ISalesRecord>("salesrecords").insertMany(recordsToInsert, { ordered: false })
        stats.successfullyUploaded = result.insertedCount
      } catch (dbError: any) {
        console.error("Error during bulk insert of sales records:", dbError)
        stats.errors.push(`Database error during bulk insert: ${dbError.message || "Unknown error"}`)
      }
    }

    const message =
      `File has ${stats.totalInFile} records. ` +
      `${stats.duplicatesInFile > 0 ? `File has ${stats.duplicatesInFile} duplicate entries. ` : ""}` +
      `${stats.existingInDatabase > 0 ? `Database already has ${stats.existingInDatabase} existing records. ` : ""}` +
      `Successfully uploaded ${stats.successfullyUploaded} new records.`

    return NextResponse.json(
      {
        success: stats.successfullyUploaded > 0,
        message,
        stats,
        count: stats.successfullyUploaded,
        details: stats.errors.length > 0 ? stats.errors : undefined,
      },
      {
        status: stats.successfullyUploaded > 0 ? 200 : 400,
      },
    )
  } catch (error: any) {
    console.error("Error processing sales upload:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
