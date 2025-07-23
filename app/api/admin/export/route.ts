import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import * as XLSX from "xlsx"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "claims"

    const db = await getDatabase()
    let data: any[] = []
    let filename = ""

    switch (type) {
      case "claims":
        data = await db.collection<ClaimResponse>("claims").find({}).sort({ createdAt: -1 }).toArray()
        filename = "ott_claims.xlsx"
        break
      case "sales":
        data = await db.collection<SalesRecord>("sales").find({}).sort({ createdAt: -1 }).toArray()
        filename = "sales_records.xlsx"
        break
      case "keys":
        data = await db.collection<OTTKey>("ottKeys").find({}).sort({ createdAt: -1 }).toArray()
        filename = "ott_keys.xlsx"
        break
      default:
        return NextResponse.json({ success: false, error: "Invalid export type" }, { status: 400 })
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, type.charAt(0).toUpperCase() + type.slice(1))

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ success: false, error: "Failed to export data" }, { status: 500 })
  }
}
