import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import type { ClaimResponse } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form fields
    const claimData = {
      id: `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      streetAddress: formData.get("streetAddress") as string,
      addressLine2: (formData.get("addressLine2") as string) || "",
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      postalCode: formData.get("postalCode") as string,
      country: formData.get("country") as string,
      purchaseType: formData.get("purchaseType") as "hardware" | "software",
      activationCode: formData.get("activationCode") as string,
      purchaseDate: formData.get("purchaseDate") as string,
      invoiceNumber: (formData.get("invoiceNumber") as string) || "",
      sellerName: (formData.get("sellerName") as string) || "",
      paymentStatus: "pending" as const,
      ottCodeStatus: "pending" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Handle file upload
    const billFile = formData.get("billFile") as File
    let billFileName = ""

    if (billFile && billFile.size > 0) {
      // In a real implementation, you would upload this to cloud storage
      // For now, we'll just store the filename
      billFileName = `${claimData.id}_${billFile.name}`
      claimData.billFileName = billFileName
    }

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "country",
      "purchaseType",
      "activationCode",
      "purchaseDate",
    ]

    for (const field of requiredFields) {
      if (!claimData[field as keyof typeof claimData]) {
        return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 })
      }
    }

    // Additional validation for hardware purchases
    if (claimData.purchaseType === "hardware") {
      if (!claimData.invoiceNumber || !claimData.sellerName) {
        return NextResponse.json(
          { success: false, error: "Invoice number and seller name are required for hardware purchases" },
          { status: 400 },
        )
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(claimData.email)) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 })
    }

    // Save to database
    const db = await getDatabase()
    const result = await db.collection<ClaimResponse>("claims").insertOne(claimData)

    if (!result.insertedId) {
      return NextResponse.json({ success: false, error: "Failed to save claim data" }, { status: 500 })
    }

    // Send confirmation email
    try {
      await sendEmail(
        claimData.email,
        "OTT Claim Submitted Successfully - SYSTECH DIGITAL",
        "claim_submitted",
        claimData,
      )
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Claim submitted successfully",
      claimId: claimData.id,
    })
  } catch (error) {
    console.error("Error submitting claim:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
