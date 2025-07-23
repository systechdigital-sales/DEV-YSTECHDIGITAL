import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import * as XLSX from "xlsx"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type) {
      return NextResponse.json({ error: "Export type is required" }, { status: 400 })
    }

    const db = await getDatabase()
    let data: any[] = []
    let filename = ""

    switch (type) {
      case "claims":
        const claims = await db.collection<ClaimResponse>("claims").find({}).sort({ createdAt: -1 }).toArray()

        data = claims.map((claim) => ({
          "Claim ID": claim.id,
          "First Name": claim.firstName,
          "Last Name": claim.lastName,
          Email: claim.email,
          Phone: claim.phone,
          "Street Address": claim.streetAddress,
          "Address Line 2": claim.addressLine2 || "",
          City: claim.city,
          State: claim.state,
          "Postal Code": claim.postalCode,
          Country: claim.country,
          "Purchase Type": claim.purchaseType,
          "Activation Code": claim.activationCode,
          "Purchase Date": claim.purchaseDate,
          "Invoice Number": claim.invoiceNumber || "",
          "Seller Name": claim.sellerName || "",
          "Payment Status": claim.paymentStatus,
          "Payment ID": claim.paymentId || "",
          "OTT Code Status": claim.ottCodeStatus,
          "OTT Code": claim.ottCode || "",
          "Bill File": claim.billFileName || "",
          "Created At": claim.createdAt,
          "Updated At": claim.updatedAt,
        }))
        filename = "ott_claims_export"
        break

      case "sales":
        const sales = await db.collection<SalesRecord>("sales").find({}).sort({ createdAt: -1 }).toArray()

        data = sales.map((sale) => ({
          ID: sale.id,
          "Product Sub Category": sale.productSubCategory,
          Product: sale.product,
          "Activation Code/ Serial No / IMEI Number": sale.activationCode,
          "Created At": sale.createdAt,
        }))
        filename = "sales_records_export"
        break

      case "keys":
        const keys = await db.collection<OTTKey>("ott_keys").find({}).sort({ createdAt: -1 }).toArray()

        data = keys.map((key) => ({
          ID: key.id,
          "Product Sub Category": key.productSubCategory,
          Product: key.product,
          "Activation Code": key.activationCode,
          Status: key.status,
          "Assigned Email": key.assignedEmail || "",
          "Assigned Date": key.assignedDate || "",
          "Created At": key.createdAt,
        }))
        filename = "ott_keys_export"
        break

      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    if (data.length === 0) {
      return NextResponse.json({ error: "No data found to export" }, { status: 404 })
    }

    // Create Excel workbook
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // Set headers for file download
    const headers = new Headers()
    headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}_${new Date().toISOString().split("T")[0]}.xlsx"`,
    )

    return new NextResponse(excelBuffer, { headers })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
