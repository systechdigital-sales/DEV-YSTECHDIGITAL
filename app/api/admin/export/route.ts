import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type || !["claims", "sales", "keys"].includes(type)) {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Fetch data from your database based on the type
    // 2. Use a library like 'xlsx' to create Excel files
    // 3. Return the file as a blob

    // Mock Excel file creation
    const mockExcelData = `${type.toUpperCase()} Export Data\nGenerated on: ${new Date().toISOString()}\n\nThis is mock data for ${type} export.`

    const blob = new Blob([mockExcelData], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${type}_export_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
