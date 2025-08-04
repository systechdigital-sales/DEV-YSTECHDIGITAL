import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import type { IClaimResponse, ISalesRecord } from "@/lib/models"
import { ObjectId } from "mongodb" // Import ObjectId

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
      activationCode: (formData.get("activationCode") as string).toUpperCase(), // Ensure uppercase
      purchaseDate: formData.get("purchaseDate") as string,
      claimSubmissionDate: new Date().toISOString(),
      invoiceNumber: (formData.get("invoiceNumber") as string) || undefined,
      sellerName: (formData.get("sellerName") as string) || undefined,
      paymentStatus: "pending",
      ottCodeStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Claim data prepared:", {
      email: claimData.email,
      phone: claimData.phone,
      activationCode: claimData.activationCode,
    })

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
    if (!emailRegex.test(claimData.email!)) {
      console.error("Invalid email format:", claimData.email)
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 })
    }

    // Postal Code validation (ensure it's numeric and 6 digits)
    const postalCodeRegex = /^\d{6}$/
    if (!postalCodeRegex.test(claimData.postalCode!)) {
      console.error("Invalid postal code format:", claimData.postalCode)
      return NextResponse.json(
        { success: false, error: "Invalid postal code. Must be a 6-digit number." },
        { status: 400 },
      )
    }

    // Connect to database
    console.log("Connecting to database...")
    const db = await getDatabase()
    console.log("Database connected")

    const claimsCollection = db.collection<IClaimResponse>("claims")
    const salesRecordsCollection = db.collection<ISalesRecord>("salesrecords")

    // --- Activation Code Validation and Update ---
    console.log(`Verifying activation code ${claimData.activationCode} in sales records...`)
    const salesRecord = await salesRecordsCollection.findOne({ activationCode: claimData.activationCode })

    if (!salesRecord) {
      console.warn(`Activation code ${claimData.activationCode} not found in sales records.`)
      return NextResponse.json(
        { success: false, message: "Activation code not found. Please check and try again." },
        { status: 400 },
      )
    }

    if (salesRecord.status === "claimed") {
      console.warn(`Activation code ${claimData.activationCode} is already claimed by ${salesRecord.claimedBy}.`)
      return NextResponse.json(
        { success: false, message: "This activation code has already been claimed by another user." },
        { status: 400 },
      )
    }

    // Check if a *paid* claim already exists for this email and activation code
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
    const claimId = new ObjectId().toHexString() // Use ObjectId for _id
    claimData._id = claimId as any

    // Start a session for transaction to ensure atomicity
    const session = db.client.startSession()
    session.startTransaction()

    try {
      // Update SalesRecord status to 'claimed' and link to the new claim
      const updateSalesResult = await salesRecordsCollection.updateOne(
        { _id: salesRecord._id, status: "available" }, // Ensure it's still available
        {
          $set: {
            status: "claimed",
            claimedBy: claimData.email,
            claimedDate: new Date(),
            assignedToClaimId: new ObjectId(claimId), // Link to the new claim's ObjectId
          },
        },
        { session },
      )

      if (updateSalesResult.matchedCount === 0) {
        await session.abortTransaction()
        console.error("Race condition: Activation code was claimed by another process.")
        return NextResponse.json(
          { success: false, message: "Activation code was just claimed. Please try again." },
          { status: 409 }, // Conflict
        )
      }

      // Insert claim into database
      const insertClaimResult = await claimsCollection.insertOne(claimData as IClaimResponse, { session })

      if (!insertClaimResult.insertedId) {
        await session.abortTransaction()
        console.error("Failed to insert claim after sales record update.")
        return NextResponse.json({ success: false, error: "Failed to save claim data" }, { status: 500 })
      }

      await session.commitTransaction()
      console.log("Claim and SalesRecord updated successfully in transaction.")

      // Send confirmation email with all submitted data
      try {
        console.log("Sending claim submission confirmation email...")
        await sendEmail({
          to: claimData.email!,
          subject: "Your OTT Claim Submission Confirmation - SYSTECH DIGITAL",
          template: "claim_submission_confirmation",
          data: { claimData: claimData as IClaimResponse }, // Pass the entire claimData object
        })
        console.log("Claim submission confirmation email sent successfully")
      } catch (emailError) {
        console.error("Failed to send claim submission confirmation email:", emailError)
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
        )}&customerEmail=${encodeURIComponent(claimData.email!)}&customerPhone=${encodeURIComponent(claimData.phone!)}`,
      })
    } catch (transactionError) {
      await session.abortTransaction()
      console.error("Transaction failed:", transactionError)
      return NextResponse.json(
        { success: false, message: "Failed to process claim due to a database error. Please try again." },
        { status: 500 },
      )
    } finally {
      await session.endSession()
    }
  } catch (error: any) {
    console.error("Error submitting claim (outside transaction):", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit claim",
      },
      { status: 500 },
    )
  }
}
