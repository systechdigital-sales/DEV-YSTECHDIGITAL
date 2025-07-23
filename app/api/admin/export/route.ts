import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type || !["claims", "sales", "keys"].includes(type)) {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    let data: any[] = []
    let filename = ""

    switch (type) {
      case "claims":
        // Fetch claims data
        const claimsResponse = await fetch(`${request.nextUrl.origin}/api/admin/claims`)
        const claimsData = await claimsResponse.json()

        // Format data for Excel
        data = claimsData.map((claim: any) => ({
          ID: claim.id,
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
          "Claim Submission Date": claim.claimSubmissionDate,
          "Invoice Number": claim.invoiceNumber || "",
          "Seller Name": claim.sellerName || "",
          "Payment Status": claim.paymentStatus,
          "Payment ID": claim.paymentId || "",
          "OTT Code Status": claim.ottCodeStatus,
          "OTT Code": claim.ottCode || "",
          "Created At": claim.createdAt,
          "Bill File Name": claim.billFileName || "",
        }))

        filename = `ott_claims_export_${new Date().toISOString().split("T")[0]}.xlsx`
        break

      case "sales":
        // Fetch sales data
        const salesResponse = await fetch(`${request.nextUrl.origin}/api/admin/sales`)
        const salesData = await salesResponse.json()

        // Format data for Excel
        data = salesData.map((sale: any) => ({
          ID: sale.id,
          "Product Sub Category": sale.productSubCategory,
          Product: sale.product,
          "Activation Code/ Serial No / IMEI Number": sale.activationCode,
        }))

        filename = `sales_records_export_${new Date().toISOString().split("T")[0]}.xlsx`
        break

      case "keys":
        // Fetch keys data
        const keysResponse = await fetch(`${request.nextUrl.origin}/api/admin/keys`)
        const keysData = await keysResponse.json()

        // Format data for Excel
        data = keysData.map((key: any) => ({
          ID: key.id,
          "Product Sub Category": key.productSubCategory,
          Product: key.product,
          "Activation Code": key.activationCode,
          Status: key.status,
          "Assigned Email": key.assignedEmail || "",
          "Assigned Date": key.assignedDate || "",
        }))

        filename = `ott_keys_export_${new Date().toISOString().split("T")[0]}.xlsx`
        break

      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    // Create Excel workbook
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

    // Create and return Excel file
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    return new NextResponse(blob, {
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
