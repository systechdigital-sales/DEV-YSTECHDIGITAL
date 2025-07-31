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

    let db
    try {
      ;({ db } = await connectToDatabase())
    } catch (dbError) {
      console.error("Database connection error in ott-key route:", dbError)
      return NextResponse.json(
        { success: false, message: "Failed to connect to the database. Please try again later." },
        { status: 500 },
      )
    }

    let ottKey
    try {
      // Modified: Added \s* to the regex to account for potential leading/trailing whitespace in the database
      ottKey = await db
        .collection("ottkeys")
        .findOne(
          { assignedEmail: { $regex: new RegExp(`^\\s*${normalizedEmail}\\s*$`, "i") } },
          { projection: { activationCode: 1, product: 1, productSubCategory: 1, status: 1, assignedDate: 1, _id: 0 } },
        )
      console.log(`OTT key lookup for email '${normalizedEmail}' completed. Found:`, !!ottKey)
    } catch (queryError) {
      console.error("Error querying ottkeys collection for customer:", queryError)
      return NextResponse.json(
        { success: false, message: "Failed to retrieve OTT key information. Please try again later." },
        { status: 500 },
      )
    }

    if (!ottKey) {
      return NextResponse.json({ success: false, message: "No OTT key found for this email address." }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: ottKey })
  } catch (error) {
    console.error("An unexpected error occurred in ott-key route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    )
  }
}
