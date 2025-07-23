import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form fields
    const claimData = {
      id: Date.now().toString(),
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      streetAddress: formData.get("streetAddress") as string,
      addressLine2: formData.get("addressLine2") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      postalCode: formData.get("postalCode") as string,
      country: formData.get("country") as string,
      purchaseType: formData.get("purchaseType") as string,
      activationCode: formData.get("activationCode") as string,
      purchaseDate: formData.get("purchaseDate") as string,
      claimSubmissionDate: formData.get("claimSubmissionDate") as string,
      invoiceNumber: formData.get("invoiceNumber") as string,
      sellerName: formData.get("sellerName") as string,
      termsAccepted: formData.get("termsAccepted") === "true",
      paymentStatus: "pending",
      ottCodeStatus: "pending",
      createdAt: new Date().toISOString(),
    }

    // Handle file upload
    const billFile = formData.get("billFile") as File
    if (billFile) {
      // In a real implementation, you would save the file to cloud storage
      console.log("Bill file uploaded:", billFile.name, billFile.size)
    }

    // In a real implementation, you would save this to a database
    console.log("OTT Claim submitted:", claimData)

    // Return success with claim ID for payment processing
    return NextResponse.json({
      success: true,
      claimId: claimData.id,
      message: "Claim submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting OTT claim:", error)
    return NextResponse.json({ success: false, error: "Failed to submit claim" }, { status: 500 })
  }
}
