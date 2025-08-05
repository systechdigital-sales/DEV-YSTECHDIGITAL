import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { getDatabase } from "@/lib/mongodb"
import type { IClaimResponse, ISalesRecord, IOTTKey } from "@/lib/models"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  try {
    const db = await getDatabase()
    let data: any[] = []
    let fileName = "export"
    let headers: string[] = []
    let formattedData: any[] = []

    if (type === "claims" || !type) {
      // Export claims data
      const claimsData = await db.collection<IClaimResponse>("claims").find({}).toArray()

      if (type === "claims") {
        data = claimsData
        fileName = "claims_export"
        headers = [
          "ID",
          "Claim ID",
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
          "Claim Submission Date",
          "Invoice Number",
          "Seller Name",
          "Payment Status",
          "Payment ID",
          "Razorpay Order ID",
          "OTT Code Status",
          "OTT Code",
          "Bill File Name",
          "Created At",
        ]
        formattedData = data.map((doc) => [
          doc._id?.toString() || "",
          doc.claimId || "",
          doc.firstName || "",
          doc.lastName || "",
          doc.email || "",
          doc.phone || doc.phoneNumber || "",
          doc.streetAddress || doc.address || "",
          doc.addressLine2 || "",
          doc.city || "",
          doc.state || "",
          doc.postalCode || doc.pincode || "",
          doc.country || "",
          doc.purchaseType || "",
          doc.activationCode || "",
          doc.purchaseDate || "",
          doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt || "",
          doc.invoiceNumber || "",
          doc.sellerName || "",
          doc.paymentStatus || "",
          doc.paymentId || "",
          doc.razorpayOrderId || "",
          doc.ottCodeStatus || doc.ottStatus || "",
          doc.ottCode || "",
          doc.billFileName || "",
          doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt || "",
        ])
      }
    }

    if (type === "sales" || !type) {
      const salesData = await db.collection<ISalesRecord>("salesrecords").find({}).toArray()

      if (type === "sales") {
        data = salesData
        fileName = "sales_export"
        headers = [
          "ID",
          "Product Sub Category",
          "Product",
          "Activation Code",
          "Status",
          "Claimed By",
          "Created At",
          "Updated At",
        ]
        formattedData = data.map((doc) => [
          doc._id?.toString() || "",
          doc.productSubCategory || "",
          doc.product || "",
          doc.activationCode || "",
          doc.status || "",
          doc.claimedBy || "",
          doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt || "",
          doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt || "",
        ])
      }
    }

    if (type === "keys" || !type) {
      const keysData = await db.collection<IOTTKey>("ottkeys").find({}).toArray()

      if (type === "keys") {
        data = keysData
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
          "Updated At",
        ]
        formattedData = data.map((doc) => [
          doc._id?.toString() || "",
          doc.productSubCategory || "",
          doc.product || "",
          doc.activationCode || "",
          doc.status || "",
          doc.assignedEmail || "",
          doc.assignedDate instanceof Date ? doc.assignedDate.toISOString() : doc.assignedDate || "",
          doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt || "",
          doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt || "",
        ])
      }
    }

    // If no specific type, export all data in separate sheets
    if (!type) {
      const [claimsData, salesData, keysData] = await Promise.all([
        db.collection<IClaimResponse>("claims").find({}).toArray(),
        db.collection<ISalesRecord>("salesrecords").find({}).toArray(),
        db.collection<IOTTKey>("ottkeys").find({}).toArray(),
      ])

      const workbook = XLSX.utils.book_new()

      // Claims sheet
      const claimsHeaders = [
        "ID",
        "Claim ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Address",
        "City",
        "State",
        "Pincode",
        "Activation Code",
        "Payment Status",
        "OTT Status",
        "OTT Code",
        "Created At",
      ]
      const claimsFormatted = claimsData.map((doc) => [
        doc._id?.toString() || "",
        doc.claimId || "",
        doc.firstName || "",
        doc.lastName || "",
        doc.email || "",
        doc.phone || doc.phoneNumber || "",
        doc.address || doc.streetAddress || "",
        doc.city || "",
        doc.state || "",
        doc.pincode || doc.postalCode || "",
        doc.activationCode || "",
        doc.paymentStatus || "",
        doc.ottCodeStatus || doc.ottStatus || "",
        doc.ottCode || "",
        doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt || "",
      ])
      const claimsSheet = XLSX.utils.aoa_to_sheet([claimsHeaders, ...claimsFormatted])
      XLSX.utils.book_append_sheet(workbook, claimsSheet, "Claims")

      // Sales sheet
      const salesHeaders = ["ID", "Product Sub Category", "Product", "Activation Code", "Status", "Created At"]
      const salesFormatted = salesData.map((doc) => [
        doc._id?.toString() || "",
        doc.productSubCategory || "",
        doc.product || "",
        doc.activationCode || "",
        doc.status || "",
        doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt || "",
      ])
      const salesSheet = XLSX.utils.aoa_to_sheet([salesHeaders, ...salesFormatted])
      XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales")

      // Keys sheet
      const keysHeaders = [
        "ID",
        "Product Sub Category",
        "Product",
        "Activation Code",
        "Status",
        "Assigned Email",
        "Created At",
      ]
      const keysFormatted = keysData.map((doc) => [
        doc._id?.toString() || "",
        doc.productSubCategory || "",
        doc.product || "",
        doc.activationCode || "",
        doc.status || "",
        doc.assignedEmail || "",
        doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt || "",
      ])
      const keysSheet = XLSX.utils.aoa_to_sheet([keysHeaders, ...keysFormatted])
      XLSX.utils.book_append_sheet(workbook, keysSheet, "OTT Keys")

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const responseHeaders = new Headers()
      responseHeaders.append("Content-Disposition", `attachment; filename="systech_ott_platform_complete_export.xlsx"`)
      responseHeaders.append("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

      return new NextResponse(blob, { headers: responseHeaders })
    }

    // Single type export
    if (formattedData.length === 0) {
      return NextResponse.json({ error: "No data found to export" }, { status: 404 })
    }

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
    return NextResponse.json(
      {
        error: error.message || "Failed to export data",
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
