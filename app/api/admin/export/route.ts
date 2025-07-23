import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { getDatabase } from "@/lib/mongodb"
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
    const headers: string[] = []

    switch (type) {
      case "claims":
        const claims = await db.collection<ClaimResponse>("claims").find({}).sort({ createdAt: -1 }).toArray()
        data = claims.map((claim) => ({
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
          "Bill File Name": claim.billFileName || "",
          "Claim Submission Date": claim.claimSubmissionDate,
          "Created At": claim.createdAt,
        }))
        filename = "ott_claim_responses"
        break

      case "sales":
        const sales = await db.collection<SalesRecord>("sales").find({}).sort({ createdAt: -1 }).toArray()
        data = sales.map((sale) => ({
          "Product Sub Category": sale.productSubCategory,
          Product: sale.product,
          "Activation Code/ Serial No / IMEI Number": sale.activationCode,
          "Created At": sale.createdAt || "",
        }))
        filename = "all_sales"
        break

      case "keys":
        const keys = await db.collection<OTTKey>("ott_keys").find({}).sort({ createdAt: -1 }).toArray()
        data = keys.map((key) => ({
          "Product Sub Category": key.productSubCategory,
          Product: key.product,
          "Activation Code": key.activationCode,
          Status: key.status,
          "Assigned Email": key.assignedEmail || "",
          "Assigned Date": key.assignedDate || "",
          "Created At": key.createdAt || "",
        }))
        filename = "ott_keys"
        break
    }

    if (data.length === 0) {
      return NextResponse.json({ error: "No data found to export" }, { status: 404 })
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, type.charAt(0).toUpperCase() + type.slice(1))

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // Set response headers for file download
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
