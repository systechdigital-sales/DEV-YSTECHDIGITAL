import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import * as XLSX from "xlsx"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'claims', 'sales', or 'keys'

    if (!type || !["claims", "sales", "keys"].includes(type)) {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    const db = await getDatabase()
    let data: any[] = []
    let filename = ""

    switch (type) {
      case "claims":
        data = await db.collection<ClaimResponse>("claims").find({}).toArray()
        filename = "ott_claims.xlsx"
        // Transform data for export
        data = data.map((claim) => ({
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
          "Bill File": claim.billFileName || "",
          "Payment Status": claim.paymentStatus,
          "Payment ID": claim.paymentId || "",
          "OTT Code Status": claim.ottCodeStatus,
          "OTT Code": claim.ottCode || "",
          "Created At": claim.createdAt,
          "Updated At": claim.updatedAt,
        }))
        break

      case "sales":
        data = await db.collection<SalesRecord>("sales").find({}).toArray()
        filename = "sales_records.xlsx"
        data = data.map((sale) => ({
          ID: sale.id,
          "Product Sub Category": sale.productSubCategory,
          Product: sale.product,
          "Activation Code": sale.activationCode,
          "Created At": sale.createdAt,
        }))
        break

      case "keys":
        data = await db.collection<OTTKey>("ott_keys").find({}).toArray()
        filename = "ott_keys.xlsx"
        data = data.map((key) => ({
          ID: key.id,
          "Product Sub Category": key.productSubCategory,
          Product: key.product,
          "Activation Code": key.activationCode,
          Status: key.status,
          "Assigned Email": key.assignedEmail || "",
          "Assigned Date": key.assignedDate || "",
          "Created At": key.createdAt,
        }))
        break
    }

    if (data.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 })
    }

    // Create Excel workbook
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, type.charAt(0).toUpperCase() + type.slice(1))

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
