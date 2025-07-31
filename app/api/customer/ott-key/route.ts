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

    const { db } = await connectToDatabase()

    // Find the OTT key where "Assigned To" matches the provided email
    const ottKey = await db.collection("ottkeys").findOne({
      "Assigned To": { $regex: new RegExp(`^${normalizedEmail}$`, "i") }, // Case-insensitive match
    })

    if (!ottKey) {
      return NextResponse.json({ success: false, message: "No OTT key found for this email." }, { status: 404 })
    }

    // Return only the necessary information (Activation Code)
    return NextResponse.json({
      success: true,
      activationCode: ottKey["Activation Code"], // Assuming this is the correct field name
      assignedTo: ottKey["Assigned To"],
      assignedDate: ottKey["Assigned Date"] ? new Date(ottKey["Assigned Date"]).toLocaleDateString() : "N/A",
      status: ottKey["Status"] || "Assigned", // Default to 'Assigned' if status is not explicitly set
    })
  } catch (error) {
    console.error("Error fetching OTT key:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch OTT key. Please try again later." },
      { status: 500 },
    )
  }
}
