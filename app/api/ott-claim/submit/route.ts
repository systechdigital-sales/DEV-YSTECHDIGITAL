import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import type { IClaimResponse } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    console.log("OTT Claim submission started")

    const formData = await request.formData()
    console.log("Form data received")

    const claimData: Partial<IClaimResponse> = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phoneNumber") as string, // Corrected to match frontend
      streetAddress: formData.get("streetAddress") as string,
      addressLine2: (formData.get("addressLine2") as string) || undefined,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      postalCode: formData.get("postalCode") as string,
      country: formData.get("country") as string,
      purchaseType: formData.get("purchaseType") as string,
      activationCode: formData.get("activationCode") as string,
      purchaseDate: formData.get("purchaseDate") as string,
      claimSubmissionDate: new Date().toISOString(),
      invoiceNumber: (formData.get("invoiceNumber") as string) || undefined,
      sellerName: (formData.get("sellerName") as string) || undefined,
      paymentStatus: "pending",
      ottCodeStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Claim data prepared:", { email: claimData.email, phone: claimData.phone })

    // Handle file upload
    const billFile = formData.get("billFile") as File
    if (billFile && billFile.size > 0) {
      claimData.billFileName = `${claimData.activationCode}_${billFile.name}`
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
      if (!claimData[field as keyof Partial<IClaimResponse>]) {
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
    if (!emailRegex.test(claimData.email ?? "")) {
      console.error("Invalid email format:", claimData.email)
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 })
    }

    // Connect to database
    console.log("Connecting to database...")
    const db = await getDatabase()
    console.log("Database connected")

    // Check if a *paid* claim already exists for this email and activation code
    const claimsCollection = db.collection<IClaimResponse>("claims")
    const existingPaidClaim = await claimsCollection.findOne({
      email: claimData.email,
      activationCode: claimData.activationCode,
      paymentStatus: "paid", // Only block if payment was successful
    })

    if (existingPaidClaim) {
      console.warn("Duplicate paid claim detected:", {
        email: claimData.email,
        activationCode: claimData.activationCode,
      })
      return NextResponse.json(
        {
          success: false,
          error: "duplicate_claim",
          message: "You have already submitted a successful claim for this activation code.",
        },
        { status: 400 },
      )
    }

    // Generate unique claim ID
    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    claimData._id = claimId as any

    // Insert claim into database
    const result = await claimsCollection.insertOne(claimData as IClaimResponse)

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
        {
          to: claimData.email ?? "",
          subject: "OTT Claim Submitted Successfully - SYSTECH DIGITAL",
          template: "custom",
          data: claimData,
        },
        {
          template: "custom",
          data: claimData,
          to: "",
          subject: ""
        }
      )
      console.log("Confirmation email sent successfully")
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError)
      // Don't fail the request if email fails
    }

    console.log("OTT Claim submission completed successfully")
    // Ensure customerName is always a string, even if parts are undefined
    const customerFullName = `${claimData.firstName || ""} ${claimData.lastName || ""}`.trim()

    return NextResponse.json({
      success: true,
      claimId: claimId,
      message: "Claim submitted successfully",
      redirectUrl: `/payment?claimId=${claimId}&amount=99&customerName=${encodeURIComponent(
        customerFullName,
      )}&customerEmail=${encodeURIComponent(claimData.email ?? "")}&customerPhone=${encodeURIComponent(claimData.phone ?? "")}`,
    })
  } catch (error: any) {
    console.error("Error submitting claim:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit claim",
      },
      { status: 500 },
    )
  }
}
