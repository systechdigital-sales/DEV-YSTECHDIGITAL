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

    // Check in the ottkeys collection for the email in "Assigned To" field
    const ottKey = await db.collection("ottkeys").findOne({
      "Assigned To": { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    })

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
        activationCode: ottKey["Activation Code"] || ottKey.activationCode,
        product: ottKey.Product || ottKey.product || "OTTplay Power Play Pack",
        assignedTo: ottKey["Assigned To"] || ottKey.assignedTo,
        assignedDate: ottKey["Assigned Date"] || ottKey.assignedDate,
        status: ottKey.Status || ottKey.status || "assigned",
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
