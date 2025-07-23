import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ClaimResponse } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form data
    const claimData: Partial<ClaimResponse> = {
      id: `claim_${Date.now()}`,
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
      purchaseType: formData.get("purchaseType") as string,
      activationCode: formData.get("activationCode") as string,
      purchaseDate: formData.get("purchaseDate") as string,
      invoiceNumber: (formData.get("invoiceNumber") as string) || "",
      sellerName: (formData.get("sellerName") as string) || "",
      paymentStatus: "pending",
      ottCodeStatus: "pending",
      claimSubmissionDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    }

    // Handle file upload
    const billFile = formData.get("billFile") as File
    if (billFile) {
      // In a real implementation, you would upload to cloud storage
      // For now, just store the filename
      claimData.billFileName = `${claimData.id}_${billFile.name}`
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
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Save to database
    const db = await getDatabase()
    const result = await db.collection<ClaimResponse>("claims").insertOne(claimData as ClaimResponse)

    return NextResponse.json({
      success: true,
      claimId: claimData.id,
      message: "Claim submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting claim:", error)
    return NextResponse.json({ success: false, error: "Failed to submit claim" }, { status: 500 })
  }
}
