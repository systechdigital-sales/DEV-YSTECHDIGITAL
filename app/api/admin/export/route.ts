import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import * as XLSX from "xlsx"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "claims"

    const db = await getDatabase()
    let data: any[] = []
    let filename = ""

    switch (type) {
      case "claims":
        data = await db.collection("claims").find({}).toArray()
        filename = "ott_claims.xlsx"
        break
      case "sales":
        data = await db.collection("sales").find({}).toArray()
        filename = "sales_records.xlsx"
        break
      case "keys":
        data = await db.collection("ott_keys").find({}).toArray()
        filename = "ott_keys.xlsx"
        break
      default:
        return NextResponse.json({ success: false, error: "Invalid export type" }, { status: 400 })
    }

    // Convert to Excel
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, type)

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ success: false, error: "Export failed" }, { status: 500 })
  }
}
