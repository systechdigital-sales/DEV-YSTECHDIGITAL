import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import * as XLSX from "xlsx"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Read file buffer
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (data.length === 0) {
      return NextResponse.json({ success: false, error: "No data found in file" }, { status: 400 })
    }

    // Transform data to match our schema
    const ottKeys = data.map((row: any, index: number) => ({
      id: `key_${Date.now()}_${index}`,
      productSubCategory: row["Product Sub Category"] || "",
      product: row["Product"] || "",
      activationCode: row["Activation Code"] || "",
      status: "available",
      createdAt: new Date().toISOString(),
    }))

    // Save to database
    const db = await getDatabase()

    // Clear existing OTT keys
    await db.collection("ottKeys").deleteMany({})

    // Insert new keys
    const result = await db.collection("ottKeys").insertMany(ottKeys)

    return NextResponse.json({
      success: true,
      count: result.insertedCount,
      message: "OTT keys uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading OTT keys:", error)
    return NextResponse.json({ success: false, error: "Failed to upload OTT keys" }, { status: 500 })
  }
}
