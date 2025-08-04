import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ClaimResponse, ISalesRecord } from "@/lib/models"
import { sendClaimConfirmationEmail } from "@/lib/email"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const phoneNumber = formData.get("phoneNumber") as string
    const streetAddress = formData.get("streetAddress") as string
    const addressLine2 = formData.get("addressLine2") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const postalCode = formData.get("postalCode") as string
    const country = formData.get("country") as string
    const purchaseType = formData.get("purchaseType") as string
    const activationCode = formData.get("activationCode") as string
    const purchaseDate = formData.get("purchaseDate") as string
    const invoiceNumber = formData.get("invoiceNumber") as string
    const sellerName = formData.get("sellerName") as string
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

    // Start a session for transaction
    const session = db.client.startSession()
    session.startTransaction()

    try {
      // 1. Verify Activation Code and Status within the transaction
      const salesRecord = await salesRecordsCollection.findOne(
        { activationCode: activationCode.toUpperCase() },
        { session },
      )

      if (!salesRecord) {
        await session.abortTransaction()
        return NextResponse.json({ success: false, message: "Activation code not found." }, { status: 404 })
      }

      if (salesRecord.status === "claimed") {
        await session.abortTransaction()
        return NextResponse.json(
          { success: false, message: "This activation code has already been claimed." },
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

      // 2. Update SalesRecord status to 'claimed'
      const updateResult = await salesRecordsCollection.updateOne(
        { _id: salesRecord._id, status: "available" }, // Ensure we only update if still available
        { $set: { status: "claimed", claimedBy: email, claimedAt: new Date() } },
        { session },
      )

      if (updateResult.matchedCount === 0) {
        // This means another process claimed it between findOne and updateOne
        await session.abortTransaction()
        return NextResponse.json(
          { success: false, message: "Activation code was just claimed by another user. Please try again." },
          { status: 409 },
        )
      }

      // Handle bill file upload (if provided)
      let billFileUrl: string | null = null
      if (billFile) {
        // In a real application, you would upload this file to a cloud storage (e.g., Vercel Blob, S3)
        // For this example, we'll simulate a URL.
        // const blob = await put(billFile.name, billFile, { access: 'public' });
        // billFileUrl = blob.url;
        console.log(`Simulating file upload for: ${billFile.name}`)
        billFileUrl = `/uploads/${Date.now()}-${billFile.name}` // Placeholder URL
      }

      // 3. Create new ClaimResponse
      const newClaimResponse = {
        _id: new ObjectId().toHexString(), // Generate a new ObjectId for the claim
        firstName,
        lastName,
        email,
        phoneNumber,
        address: {
          streetAddress,
          addressLine2,
          city,
          state,
          postalCode,
          country,
        },
        purchaseDetails: {
          purchaseType,
          activationCode: activationCode.toUpperCase(),
          purchaseDate: new Date(purchaseDate),
          invoiceNumber: purchaseType === "hardware" ? invoiceNumber : undefined,
          sellerName: purchaseType === "hardware" ? sellerName : undefined,
          billFileUrl,
        },
        claimStatus: "Pending Payment", // Initial status
        submissionDate: new Date(),
        paymentStatus: "Pending",
        assignedOTTKey: null, // Will be assigned after payment and processing
      }

      const claimResponsesCollection = db.collection<ClaimResponse>("claimresponses")
      await claimResponsesCollection.insertOne(newClaimResponse, { session })

      // Commit the transaction
      await session.commitTransaction()

      // Send confirmation email (outside transaction, as it's not critical for data integrity)
      try {
        await sendClaimConfirmationEmail(email, {
          firstName,
          activationCode: activationCode.toUpperCase(),
          claimStatus: "Pending Payment",
          paymentLink: `${process.env.NEXT_PUBLIC_BASE_URL}/payment?claimId=${newClaimResponse._id}`, // Example payment link
        })
      } catch (emailError) {
        console.error("Failed to send claim confirmation email:", emailError)
        // Log error but don't block response
      }

      // Redirect to payment page with claim ID
      return NextResponse.json({
        success: true,
        message: "Claim submitted successfully. Proceed to payment.",
        redirectUrl: `/payment?claimId=${newClaimResponse._id}`,
      })
    } catch (transactionError) {
      await session.abortTransaction()
      console.error("Transaction failed:", transactionError)
      return NextResponse.json(
        { success: false, message: "Failed to submit claim due to a database error." },
        { status: 500 },
      )
    } finally {
      await session.endSession()
    }
  } catch (error: any) {
    console.error("Error in OTT claim submission:", error)
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 })
  }
}
