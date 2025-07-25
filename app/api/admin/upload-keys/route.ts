import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { getDatabase } from "@/lib/mongodb"
import type { IOTTKey } from "@/lib/models"

export async function POST(request: Request) {
  try {
    const db = await getDatabase()
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    const workbook = XLSX.read(data, { type: "array" })

    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const json = XLSX.utils.sheet_to_json(worksheet) as any[]

    let uploadedCount = 0
    const errors: string[] = []
    const keysToInsert: IOTTKey[] = []

    for (const row of json) {
      try {
        const newOTTKey: IOTTKey = {
          productSubCategory: row["Product Sub Category"] || "",
          product: row["Product"] || "",
          activationCode: row["Activation Code"] || "",
          status: "available", // Default status for new keys
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        if (!newOTTKey.productSubCategory || !newOTTKey.product || !newOTTKey.activationCode) {
          errors.push(`Row ${json.indexOf(row) + 2}: Missing required fields.`)
          continue
        }

        keysToInsert.push(newOTTKey)
      } catch (parseError: any) {
        errors.push(`Row ${json.indexOf(row) + 2}: ${parseError.message || "Parsing error"}`)
      }
    }

    if (keysToInsert.length > 0) {
      try {
        const result = await db.collection<IOTTKey>("ottkeys").insertMany(keysToInsert, { ordered: false })
        uploadedCount = result.insertedCount
      } catch (dbError: any) {
        if (dbError.code === 11000 && dbError.writeErrors) {
          dbError.writeErrors.forEach((err: any) => {
            const duplicateKey = err.err.errmsg.match(/dup key: { : "([^"]+)" }/)?.[1] || "unknown"
            errors.push(`Duplicate activation code: ${duplicateKey}`)
          })
          uploadedCount = keysToInsert.length - dbError.writeErrors.length
        } else {
          console.error("Error during bulk insert of OTT keys:", dbError)
          errors.push(`Database error during bulk insert: ${dbError.message || "Unknown error"}`)
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          count: uploadedCount,
          error: `Uploaded ${uploadedCount} records with errors in ${errors.length} rows.`,
          details: errors,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, count: uploadedCount }, { status: 200 })
  } catch (error: any) {
    console.error("Error processing keys upload:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
