import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import * as XLSX from "xlsx"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type || !["claims", "sales", "keys"].includes(type)) {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
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
          "Claim Submission Date": claim.claimSubmissionDate,
          "Created At": new Date(claim.createdAt).toLocaleString(),
          "Bill File": claim.billFileName || "",
        }))
        filename = "ott_claims_export"
        break

      case "sales":
        const sales = await db.collection<SalesRecord>("sales").find({}).sort({ createdAt: -1 }).toArray()
        data = sales.map((sale) => ({
          "Product Sub Category": sale.productSubCategory,
          Product: sale.product,
          "Activation Code/ Serial No / IMEI Number": sale.activationCode,
          "Created At": sale.createdAt ? new Date(sale.createdAt).toLocaleString() : "",
        }))
        filename = "sales_export"
        break

      case "keys":
        const keys = await db.collection<OTTKey>("ott_keys").find({}).sort({ createdAt: -1 }).toArray()
        data = keys.map((key) => ({
          "Product Sub Category": key.productSubCategory,
          Product: key.product,
          "Activation Code": key.activationCode,
          Status: key.status,
          "Assigned Email": key.assignedEmail || "",
          "Assigned Date": key.assignedDate ? new Date(key.assignedDate).toLocaleString() : "",
          "Created At": key.createdAt ? new Date(key.createdAt).toLocaleString() : "",
        }))
        filename = "ott_keys_export"
        break
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

    // Create response with proper headers
    const response = new NextResponse(excelBuffer)
    response.headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}_${new Date().toISOString().split("T")[0]}.xlsx"`,
    )

    return response
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
