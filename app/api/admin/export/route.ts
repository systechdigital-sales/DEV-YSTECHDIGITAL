// import { type NextRequest, NextResponse } from "next/server"
// import { getDatabase } from "@/lib/mongodb"
// import * as XLSX from "xlsx"

// // Force dynamic rendering
// export const dynamic = "force-dynamic"

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const type = searchParams.get("type") || "claims"

//     const db = await getDatabase()
//     let data: any[] = []
//     let filename = ""

//     switch (type) {
//       case "claims":
//         data = await db.collection("claims").find({}).toArray()
//         filename = "ott_claims.xlsx"
//         break
//       case "sales":
//         data = await db.collection("sales").find({}).toArray()
//         filename = "sales_records.xlsx"
//         break
//       case "keys":
//         data = await db.collection("ott_keys").find({}).toArray()
//         filename = "ott_keys.xlsx"
//         break
//       default:
//         return NextResponse.json({ success: false, error: "Invalid export type" }, { status: 400 })
//     }

//     // Convert to Excel
//     const worksheet = XLSX.utils.json_to_sheet(data)
//     const workbook = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(workbook, worksheet, type)

//     // Generate buffer
//     const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

//     return new NextResponse(buffer, {
//       headers: {
//         "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         "Content-Disposition": `attachment; filename="${filename}"`,
//       },
//     })
//   } catch (error) {
//     console.error("Export error:", error)
//     return NextResponse.json({ success: false, error: "Export failed" }, { status: 500 })
//   }
// }

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

  try {
    const db = await getDatabase()

    if (type === "claims") {
      data = await db.collection<IClaimResponse>("claims").find({}).toArray() // Changed collection name
      fileName = "claims_export"
      headers = [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "streetAddress",
        "addressLine2",
        "city",
        "state",
        "postalCode",
        "country",
        "purchaseType",
        "activationCode",
        "purchaseDate",
        "claimSubmissionDate",
        "invoiceNumber",
        "sellerName",
        "paymentStatus",
        "paymentId",
        "ottCodeStatus",
        "ottCode",
        "createdAt",
        "billFileName",
      ]
    } else if (type === "sales") {
      data = await db.collection<ISalesRecord>("salesrecords").find({}).toArray()
      fileName = "sales_export"
      headers = ["id", "productSubCategory", "product", "activationCode", "status", "createdAt"]
    } else if (type === "keys") {
      data = await db.collection<IOTTKey>("ottkeys").find({}).toArray()
      fileName = "ott_keys_export"
      headers = [
        "id",
        "productSubCategory",
        "product",
        "activationCode",
        "status",
        "assignedEmail",
        "assignedDate",
        "createdAt",
      ]
    } else {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    // Format data for export: convert _id to id string and Date objects to ISO strings
    const formattedData = data.map((doc) => {
      const newDoc: { [key: string]: any } = { ...doc, id: doc._id.toString() }
      delete newDoc._id // Remove the MongoDB ObjectId

      // Convert Date objects to ISO strings for consistency
      if (newDoc.createdAt instanceof Date) newDoc.createdAt = newDoc.createdAt.toISOString()
      if (newDoc.updatedAt instanceof Date) newDoc.updatedAt = newDoc.updatedAt.toISOString()
      if (newDoc.assignedDate instanceof Date) newDoc.assignedDate = newDoc.assignedDate.toISOString()

      return newDoc
    })

    // If data is empty, create a worksheet with just headers
    const worksheet =
      formattedData.length > 0 ? XLSX.utils.json_to_sheet(formattedData) : XLSX.utils.aoa_to_sheet([headers])

    // If data is empty, ensure headers are explicitly set (redundant if using aoa_to_sheet with headers, but good for clarity)
    if (formattedData.length === 0 && headers.length > 0) {
      XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" })
    }

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
