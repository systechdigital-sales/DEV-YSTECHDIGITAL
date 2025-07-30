import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { OTTKey } from "@/lib/models"
import { parseExcel, parseCSV } from "@/lib/excelParser" // Assuming this utility exists or will be created
import type { Collection } from "mongodb"

// Helper to normalize column names for robust matching
const normalizeHeader = (header: string) => header.toLowerCase().replace(/[^a-z0-9]/g, "")

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let records: any[] = []
    const fileType = file.name.split(".").pop()?.toLowerCase()

    if (fileType === "xlsx" || fileType === "xls") {
      records = parseExcel(buffer)
    } else if (fileType === "csv") {
      records = parseCSV(buffer.toString())
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported file type. Please upload .xlsx, .xls, or .csv." },
        { status: 400 },
      )
    }

    if (!records || records.length === 0) {
      return NextResponse.json(
        { success: false, error: "No data found in the file or file is empty." },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const ottKeysCollection: Collection<OTTKey> = db.collection("ottkeys")

    const requiredHeaders = {
      productsubcategory: "Product Sub Category",
      product: "Product",
      activationcode: "Activation Code",
    }

    const errors: string[] = []
    const validKeys: OTTKey[] = []
    const existingActivationCodes = new Set(
      (await ottKeysCollection.find({}, { projection: { activationCode: 1 } }).toArray()).map((k) => k.activationCode),
    )

    // Validate headers
    const fileHeaders = Object.keys(records[0] || {}).map(normalizeHeader)
    const missingHeaders = Object.keys(requiredHeaders).filter((rh) => !fileHeaders.includes(rh))

    if (missingHeaders.length > 0) {
      const missingHeaderNames = missingHeaders.map((mh) => requiredHeaders[mh as keyof typeof requiredHeaders])
      errors.push(
        `Missing required column(s) in the file: ${missingHeaderNames.join(", ")}. Please ensure column headers match exactly.`,
      )
      return NextResponse.json({ success: false, error: "Invalid file format.", details: errors }, { status: 400 })
    }

    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      const rowNum = i + 2 // +1 for 0-indexed array, +1 for header row

      const productSubCategory = record["Product Sub Category"] || record["productSubCategory"]
      const product = record["Product"] || record["product"]
      const activationCode = record["Activation Code"] || record["activationCode"]
      const status = record["Status"] || record["status"] || "available" // Default status

      const rowErrors: string[] = []
      if (!productSubCategory) rowErrors.push("'Product Sub Category'")
      if (!product) rowErrors.push("'Product'")
      if (!activationCode) rowErrors.push("'Activation Code'")

      if (rowErrors.length > 0) {
        errors.push(`Row ${rowNum}: Missing required field(s): ${rowErrors.join(", ")}.`)
        continue
      }

      if (existingActivationCodes.has(activationCode)) {
        errors.push(`Row ${rowNum}: Duplicate Activation Code '${activationCode}' already exists.`)
        continue
      }

      validKeys.push({
        productSubCategory,
        product,
        activationCode,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as OTTKey) // Cast to OTTKey, _id will be added by MongoDB
    }

    if (validKeys.length > 0) {
      await ottKeysCollection.insertMany(validKeys)
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: validKeys.length > 0, // Partial success if some keys were uploaded
          message:
            validKeys.length > 0
              ? `Successfully uploaded ${validKeys.length} keys with some errors.`
              : "No keys uploaded due to errors.",
          count: validKeys.length,
          details: errors,
        },
        { status: validKeys.length > 0 ? 200 : 400 },
      )
    }

    return NextResponse.json(
      { success: true, message: `Successfully uploaded ${validKeys.length} OTT keys.`, count: validKeys.length },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error in upload-keys API:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred." },
      { status: 500 },
    )
  }
}
