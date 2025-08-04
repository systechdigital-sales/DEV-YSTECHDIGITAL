import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ClaimResponse, ISalesRecord } from "@/lib/models"
import { sendEmail } from "@/lib/email" // Assuming sendEmail is the correct function
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    console.log("OTT Claim submission started")

    const formData = await request.formData()
    console.log("Form data received")

    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const phoneNumber = formData.get("phoneNumber") as string
    const streetAddress = formData.get("streetAddress") as string
    const addressLine2 = (formData.get("addressLine2") as string) || undefined
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const postalCode = formData.get("postalCode") as string
    const country = formData.get("country") as string
    const purchaseType = formData.get("purchaseType") as string
    const activationCode = (formData.get("activationCode") as string).toUpperCase() // Ensure uppercase
    const purchaseDate = formData.get("purchaseDate") as string
    const invoiceNumber = (formData.get("invoiceNumber") as string) || undefined
    const sellerName = (formData.get("sellerName") as string) || undefined
    const billFile = formData.get("billFile") as File | null // This will be a File object or null
    const agreeToTerms = formData.get("agreeToTerms") === "true"

    // Basic validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !streetAddress ||
      !city ||
      !state ||
      !postalCode ||
      !purchaseType ||
      !activationCode ||
      !purchaseDate ||
      !agreeToTerms
    ) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email address format." }, { status: 400 })
    }

    // Phone validation (10-digit Indian mobile number)
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 },
      )
    }

    // Postal Code validation (6-digit number)
    const postalCodeRegex = /^\d{6}$/
    if (!postalCodeRegex.test(postalCode)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid 6-digit postal code." },
        { status: 400 },
      )
    }

    // Conditional validation for hardware purchase
    if (purchaseType === "hardware") {
      if (!invoiceNumber) {
        return NextResponse.json(
          { success: false, message: "Invoice Number is required for Hardware Purchase." },
          { status: 400 },
        )
      }
      if (!sellerName) {
        return NextResponse.json(
          { success: false, message: "Seller Name is required for Hardware Purchase." },
          { status: 400 },
        )
      }
    }

    const db = await getDatabase()
    const salesRecordsCollection = db.collection<ISalesRecord>("salesrecords")
    const claimsCollection = db.collection<ClaimResponse>("claims") // Use 'claims' as per previous context

    // Start a session for transaction
    const session = db.client.startSession()
    session.startTransaction()

    try {
      // 1. Verify Activation Code and Status within the transaction
      const salesRecord = await salesRecordsCollection.findOne({ activationCode: activationCode }, { session })

      if (!salesRecord) {
        await session.abortTransaction()
        return NextResponse.json({ success: false, message: "Activation code not found." }, { status: 404 })
      }

      if (salesRecord.status === "claimed") {
        await session.abortTransaction()
        return NextResponse.json(
          { success: false, message: "This activation code has already been claimed by someone else." },
          { status: 409 },
        )
      }

      if (salesRecord.status !== "available") {
        await session.abortTransaction()
        return NextResponse.json(
          { success: false, message: "Activation code is not available for claim." },
          { status: 409 },
        )
      }

      // Check if a *paid* claim already exists for this email and activation code
      const existingPaidClaim = await claimsCollection.findOne(
        {
          email: email,
          activationCode: activationCode,
          paymentStatus: "paid", // Only block if payment was successful
        },
        { session },
      )

      if (existingPaidClaim) {
        await session.abortTransaction()
        return NextResponse.json(
          {
            success: false,
            error: "duplicate_claim",
            message: "You have already submitted a successful claim for this activation code.",
          },
          { status: 400 },
        )
      }

      // Handle bill file upload (if provided)
      let billFileUrl: string | null = null
      if (billFile && billFile.size > 0) {
        // In a real application, you would upload this file to a cloud storage (e.g., Vercel Blob, S3)
        // For this example, we'll simulate a URL.
        // const blob = await put(billFile.name, billFile, { access: 'public' });
        // billFileUrl = blob.url;
        console.log(`Simulating file upload for: ${billFile.name}`)
        billFileUrl = `/uploads/${Date.now()}-${billFile.name}` // Placeholder URL
      }

      // Generate unique claim ID
      const claimId = new ObjectId().toHexString() // Use ObjectId for _id

      // 2. Create new ClaimResponse
      const newClaimResponse: ClaimResponse = {
        _id: claimId,
        firstName,
        lastName,
        email,
        phoneNumber,
        streetAddress,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        purchaseType,
        activationCode,
        purchaseDate,
        invoiceNumber,
        sellerName,
        billFileName: billFile ? billFile.name : undefined, // Store original file name
        billFileUrl, // Store the URL if uploaded
        claimSubmissionDate: new Date().toISOString(),
        paymentStatus: "pending",
        ottCodeStatus: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const insertClaimResult = await claimsCollection.insertOne(newClaimResponse, { session })

      if (!insertClaimResult.insertedId) {
        await session.abortTransaction()
        console.error("Failed to insert claim after sales record update.")
        return NextResponse.json({ success: false, error: "Failed to save claim data" }, { status: 500 })
      }

      // 3. Update SalesRecord status to 'claimed' and link to the new claim
      const updateSalesResult = await salesRecordsCollection.updateOne(
        { _id: salesRecord._id, status: "available" }, // Ensure it's still available
        {
          $set: {
            status: "claimed",
            claimedBy: email,
            claimedDate: new Date(),
            assignedToClaimId: new ObjectId(claimId), // Link to the new claim's ObjectId
          },
        },
        { session },
      )

      if (updateSalesResult.matchedCount === 0) {
        // This means another process claimed it between findOne and updateOne
        await session.abortTransaction()
        return NextResponse.json(
          { success: false, message: "Activation code was just claimed by another user. Please try again." },
          { status: 409 }, // Conflict
        )
      }

      // Commit the transaction
      await session.commitTransaction()
      console.log("Claim and SalesRecord updated successfully in transaction.")

      // Send confirmation email (outside transaction, as it's not critical for data integrity)
      try {
        console.log("Sending claim submission confirmation email...")
        // Assuming sendEmail function takes an object with 'to', 'subject', 'template', 'data'
        await sendEmail({
          to: email,
          subject: "Your OTT Claim Submission Confirmation - SYSTECH DIGITAL",
          template: "claim_submission_confirmation",
          data: { claimData: newClaimResponse }, // Pass the entire claimData object
        })
        console.log("Claim submission confirmation email sent successfully")
      } catch (emailError) {
        console.error("Failed to send claim submission confirmation email:", emailError)
        // Don't fail the request if email fails
      }

      console.log("OTT Claim submission completed successfully")
      // Ensure customerName is always a string, even if parts are undefined
      const customerFullName = `${firstName || ""} ${lastName || ""}`.trim()

      return NextResponse.json({
        success: true,
        claimId: claimId,
        message: "Claim submitted successfully",
        redirectUrl: `/payment?claimId=${claimId}&customerName=${encodeURIComponent(
          customerFullName,
        )}&customerEmail=${encodeURIComponent(email)}&customerPhone=${encodeURIComponent(phoneNumber)}`,
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
    console.error("Error in OTT claim submission (outside transaction):", error)
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 })
  }
}
