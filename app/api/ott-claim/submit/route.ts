import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import type { ClaimResponse } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    console.log("OTT Claim submission started")

    const formData = await request.formData()
    console.log("Form data received")

    // Extract form fields
    const claimData: ClaimResponse = {
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
      paymentStatus: "pending",
      ottCodeStatus: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("Claim data prepared:", { id: claimData.id, email: claimData.email })

    // Handle file upload
    const billFile = formData.get("billFile") as File
    if (billFile && billFile.size > 0) {
      claimData.billFileName = `${claimData.id}_${billFile.name}`
      console.log("File uploaded:", claimData.billFileName)
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
      if (!claimData[field as keyof ClaimResponse]) {
        console.error(`Missing required field: ${field}`)
        return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 })
      }
    }

    // Additional validation for hardware purchases
    if (claimData.purchaseType === "hardware") {
      if (!claimData.invoiceNumber || !claimData.sellerName) {
        console.error("Missing hardware purchase fields")
        return NextResponse.json(
          { success: false, error: "Invoice number and seller name are required for hardware purchases" },
          { status: 400 },
        )
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(claimData.email)) {
      console.error("Invalid email format:", claimData.email)
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 })
    }

    // Save to database
    console.log("Connecting to database...")
    const db = await getDatabase()
    console.log("Database connected, inserting claim...")

    const result = await db.collection<ClaimResponse>("claims").insertOne(claimData)
    console.log("Claim inserted:", result.insertedId)

    if (!result.insertedId) {
      console.error("Failed to insert claim")
      return NextResponse.json({ success: false, error: "Failed to save claim data" }, { status: 500 })
    }

    // Send confirmation email
    try {
      console.log("Sending confirmation email...")
      await sendEmail(
        claimData.email,
        "OTT Claim Submitted Successfully - SYSTECH DIGITAL",
        "claim_submitted",
        claimData,
      )
      console.log("Confirmation email sent successfully")
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError)
      // Don't fail the request if email fails
    }

    console.log("OTT Claim submission completed successfully")
    return NextResponse.json({
      success: true,
      message: "Claim submitted successfully",
      claimId: claimData.id,
      redirectUrl: `/payment?claimId=${claimData.id}&amount=99&customerName=${encodeURIComponent(
        `${claimData.firstName} ${claimData.lastName}`,
      )}&customerEmail=${encodeURIComponent(claimData.email)}&customerPhone=${encodeURIComponent(claimData.phone)}`,
    })
  } catch (error) {
    console.error("Error submitting claim:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
