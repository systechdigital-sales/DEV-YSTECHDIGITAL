import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { getDatabase } from "@/lib/mongodb"
import type { IClaimResponse, ISalesRecord, IOTTKey } from "@/lib/models"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  let data: any[] = []
  let fileName = "export"
  let headers: string[] = []
  let formattedData: any[] = []

  try {
    const db = await getDatabase()

    if (type === "claims") {
      data = await db.collection<IClaimResponse>("claims").find({}).toArray()
      fileName = "claims_export"
      headers = [
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Street Address",
        "Address Line 2",
        "City",
        "State",
        "Postal Code",
        "Country",
        "Purchase Type",
        "Activation Code",
        "Purchase Date",
        "Claim Submission Date", // Maps to createdAt
        "Invoice Number",
        "Seller Name",
        "Payment Status",
        "Payment ID",
        "Razorpay Order ID",
        "OTT Code Status",
        "OTT Code",
        "Bill File Name",
      ]
      formattedData = data.map((doc) => [
        doc._id.toString(),
        doc.firstName,
        doc.lastName,
        doc.email,
        doc.phone,
        doc.streetAddress,
        doc.addressLine2,
        doc.city,
        doc.state,
        doc.postalCode,
        doc.country,
        doc.purchaseType,
        doc.activationCode,
        doc.purchaseDate,
        doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt, // Use createdAt for submission date
        doc.invoiceNumber,
        doc.sellerName,
        doc.paymentStatus,
        doc.paymentId,
        doc.razorpayOrderId,
        doc.ottCodeStatus,
        doc.ottCode,
        doc.billFileName,
      ])
    } else if (type === "sales") {
      data = await db.collection<ISalesRecord>("salesrecords").find({}).toArray()
      fileName = "sales_export"
      headers = ["ID", "Product Sub Category", "Product", "Activation Code", "Status", "Created At"]
      formattedData = data.map((doc) => [
        doc._id.toString(),
        doc.productSubCategory,
        doc.product,
        doc.activationCode,
        doc.status,
        doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
      ])
    } else if (type === "keys") {
      data = await db.collection<IOTTKey>("ottkeys").find({}).toArray()
      fileName = "ott_keys_export"
      headers = [
        "ID",
        "Product Sub Category",
        "Product",
        "Activation Code",
        "Status",
        "Assigned Email",
        "Assigned Date",
        "Created At",
      ]
      formattedData = data.map((doc) => [
        doc._id.toString(),
        doc.productSubCategory,
        doc.product,
        doc.activationCode,
        doc.status,
        doc.assignedEmail,
        doc.assignedDate instanceof Date ? doc.assignedDate.toISOString() : doc.assignedDate,
        doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
      ])
    } else {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    // Prepare data for XLSX.utils.aoa_to_sheet
    const exportData = [headers, ...formattedData]

    const worksheet = XLSX.utils.aoa_to_sheet(exportData)

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const responseHeaders = new Headers()
    responseHeaders.append("Content-Disposition", `attachment; filename="${fileName}.xlsx"`)
    responseHeaders.append("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

    return new NextResponse(blob, { headers: responseHeaders })
  } catch (error: any) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: error.message || "Failed to export data" }, { status: 500 })
  }
}
