import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import * as XLSX from "xlsx"
import type { OTTKey } from "@/lib/models"

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
    const ottKeys: OTTKey[] = []

    for (const row of data as any[]) {
      // Flexible column mapping
      const platform = row["Platform"] || row["platform"] || row["OTT Platform"] || "Netflix"
      const keyCode = row["Key Code"] || row["Code"] || row["key_code"] || row["Key"] || ""

      if (keyCode) {
        const ottKey: OTTKey = {
          id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          platform,
          keyCode,
          status: "available",
          createdAt: new Date().toISOString(),
        }
        ottKeys.push(ottKey)
      }
    }

    if (ottKeys.length > 0) {
      await db.collection<OTTKey>("ottKeys").insertMany(ottKeys)
      console.log(`Inserted ${ottKeys.length} OTT keys`)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${ottKeys.length} OTT keys`,
      count: ottKeys.length,
    })
  } catch (error) {
    console.error("Error uploading OTT keys:", error)
    return NextResponse.json({ success: false, error: "Failed to upload OTT keys" }, { status: 500 })
  }
}
