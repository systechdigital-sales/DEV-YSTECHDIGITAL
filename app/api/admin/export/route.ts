import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import * as XLSX from "xlsx"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type || !["claims", "sales", "keys"].includes(type)) {
      return NextResponse.json({ success: false, error: "Invalid export type" }, { status: 400 })
    }

    const db = await getDatabase()
    let data: any[] = []
    let filename = ""

    switch (type) {
      case "claims":
        data = await db.collection("claims").find({}).toArray()
        filename = "ott_claims_export.xlsx"
        break
      case "sales":
        data = await db.collection("sales").find({}).toArray()
        filename = "sales_records_export.xlsx"
        break
      case "keys":
        data = await db.collection("ottKeys").find({}).toArray()
        filename = "ott_keys_export.xlsx"
        break
    }

    if (data.length === 0) {
      return NextResponse.json({ success: false, error: "No data found" }, { status: 404 })
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, type.charAt(0).toUpperCase() + type.slice(1))

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // Return file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ success: false, error: "Export failed" }, { status: 500 })
  }
}
