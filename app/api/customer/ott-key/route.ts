import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ success: false, message: "Email parameter is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Connect to the specific database and collection
    const { db } = await connectToDatabase()

    // Check in the ottkeys collection for the email
    const ottKey = await db.collection("ottkeys").findOne({ assignedEmail: normalizedEmail })

    if (!ottKey) {
      return NextResponse.json({
        success: false,
        message: "No OTT key found for this email address",
      })
    }

    return NextResponse.json({
      success: true,
      ottKey: {
        id: ottKey._id.toString(),
        activationCode: ottKey.activationCode,
        product: ottKey.product,
        productSubCategory: ottKey.productSubCategory,
        status: ottKey.status,
        assignedEmail: ottKey.assignedEmail,
        assignedDate: ottKey.assignedDate,
      },
    })
  } catch (error) {
    console.error("Error fetching OTT key:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch OTT key. Please try again later." },
      { status: 500 },
    )
  }
}
