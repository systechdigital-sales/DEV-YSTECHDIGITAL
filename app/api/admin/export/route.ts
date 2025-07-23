import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type || !["claims", "sales", "keys"].includes(type)) {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    let csvContent = ""
    let filename = ""

    switch (type) {
      case "claims":
        // Fetch claims data
        const claimsResponse = await fetch(`${request.nextUrl.origin}/api/admin/claims`)
        const claimsData = await claimsResponse.json()

        // Create CSV headers
        csvContent =
          "ID,First Name,Last Name,Email,Phone,Street Address,Address Line 2,City,State,Postal Code,Country,Purchase Type,Activation Code,Purchase Date,Claim Submission Date,Invoice Number,Seller Name,Payment Status,Payment ID,OTT Code Status,OTT Code,Created At,Bill File Name\n"

        // Add data rows
        claimsData.forEach((claim: any) => {
          csvContent += `"${claim.id}","${claim.firstName}","${claim.lastName}","${claim.email}","${claim.phone}","${claim.streetAddress}","${claim.addressLine2 || ""}","${claim.city}","${claim.state}","${claim.postalCode}","${claim.country}","${claim.purchaseType}","${claim.activationCode}","${claim.purchaseDate}","${claim.claimSubmissionDate}","${claim.invoiceNumber || ""}","${claim.sellerName || ""}","${claim.paymentStatus}","${claim.paymentId || ""}","${claim.ottCodeStatus}","${claim.ottCode || ""}","${claim.createdAt}","${claim.billFileName || ""}"\n`
        })
        filename = `ott_claims_export_${new Date().toISOString().split("T")[0]}.csv`
        break

      case "sales":
        // Fetch sales data
        const salesResponse = await fetch(`${request.nextUrl.origin}/api/admin/sales`)
        const salesData = await salesResponse.json()

        // Create CSV headers
        csvContent = "ID,Product Sub Category,Product,Activation Code/ Serial No / IMEI Number\n"

        // Add data rows
        salesData.forEach((sale: any) => {
          csvContent += `"${sale.id}","${sale.productSubCategory}","${sale.product}","${sale.activationCode}"\n`
        })
        filename = `sales_records_export_${new Date().toISOString().split("T")[0]}.csv`
        break

      case "keys":
        // Fetch keys data
        const keysResponse = await fetch(`${request.nextUrl.origin}/api/admin/keys`)
        const keysData = await keysResponse.json()

        // Create CSV headers
        csvContent = "ID,Product Sub Category,Product,Activation Code,Status,Assigned Email,Assigned Date\n"

        // Add data rows
        keysData.forEach((key: any) => {
          csvContent += `"${key.id}","${key.productSubCategory}","${key.product}","${key.activationCode}","${key.status}","${key.assignedEmail || ""}","${key.assignedDate || ""}"\n`
        })
        filename = `ott_keys_export_${new Date().toISOString().split("T")[0]}.csv`
        break

      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    // Create and return CSV file
    const blob = new Blob([csvContent], { type: "text/csv" })

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
