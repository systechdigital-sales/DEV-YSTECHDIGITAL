import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  try {
    // Mock Excel export - in production, use a library like xlsx
    const mockExcelData = `Type,Data,Export\n${type},Mock,Data\nFor,Excel,Export`

    const response = new NextResponse(mockExcelData)
    response.headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    response.headers.set("Content-Disposition", `attachment; filename="${type}_export.xlsx"`)

    return response
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
