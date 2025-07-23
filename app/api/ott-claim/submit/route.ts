import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// Mock database - in production, use a real database
const claimResponses: any[] = []

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form data
    const claimData = {
      id: Date.now().toString(),
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      streetAddress: formData.get("streetAddress") as string,
      addressLine2: formData.get("addressLine2") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      postalCode: formData.get("postalCode") as string,
      country: formData.get("country") as string,
      purchaseType: formData.get("purchaseType") as string,
      purchaseDate: formData.get("purchaseDate") as string,
      activationCode: formData.get("activationCode") as string,
      invoiceNumber: formData.get("invoiceNumber") as string,
      sellerName: formData.get("sellerName") as string,
      claimSubmissionDate: formData.get("claimSubmissionDate") as string,
      termsAccepted: formData.get("termsAccepted") === "true",
      paymentStatus: "pending",
      ottCodeStatus: "pending",
      createdAt: new Date().toISOString(),
    }

    // Handle file upload
    const billFile = formData.get("billFile") as File
    if (billFile) {
      const bytes = await billFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "uploads")
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Save file
      const fileName = `${claimData.id}_${billFile.name}`
      const filePath = join(uploadsDir, fileName)
      await writeFile(filePath, buffer)

      claimData.billFileName = fileName
    }

    // Store claim data (in production, save to database)
    claimResponses.push(claimData)

    return NextResponse.json({
      success: true,
      claimId: claimData.id,
      message: "Claim submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting claim:", error)
    return NextResponse.json({ error: "Failed to submit claim" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(claimResponses)
}
