import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("=== OTT KEY FETCH REQUEST START ===")

    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    console.log("Received request for email:", email)

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    console.log("Normalized email:", normalizedEmail)

    // Connect to database
    let db
    try {
      ;({ db } = await connectToDatabase())
      console.log("Database connection established for ott-key route.")
    } catch (dbError) {
      console.error("Database connection error in ott-key route:", dbError)
      return NextResponse.json(
        { success: false, message: "Failed to connect to the database. Please try again later." },
        { status: 500 },
      )
    }

    // Search ONLY in the ottkeys collection for the logged-in user's email
    console.log("Searching in ottkeys collection for email:", normalizedEmail)

    // First, let's check what fields are available in the collection
    const sampleDoc = await db.collection("ottkeys").findOne({})
    console.log("Sample document from ottkeys collection:", sampleDoc)

    const ottKeysFromCollection = await db
      .collection("ottkeys")
      .find({
        $or: [
          { email: normalizedEmail },
          { email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
          { assignedEmail: normalizedEmail },
          { assignedEmail: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
          { customerEmail: normalizedEmail },
          { customerEmail: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
          { userEmail: normalizedEmail },
          { userEmail: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
          { Email: normalizedEmail },
          { Email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
          { "Assigned Email": normalizedEmail },
          {
            "Assigned Email": {
              $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
            },
          },
          { "Customer Email": normalizedEmail },
          {
            "Customer Email": {
              $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
            },
          },
        ],
      })
      .toArray()

    console.log(`Found ${ottKeysFromCollection.length} keys in ottkeys collection`)
    console.log("Raw OTT keys data found:", ottKeysFromCollection)

    if (ottKeysFromCollection.length === 0) {
      console.log("No OTT keys found for email:", normalizedEmail)
      return NextResponse.json(
        {
          success: false,
          message:
            "No OTT keys found for this email address in the ottkeys collection. Please contact support if you believe this is an error.",
        },
        { status: 404 },
      )
    }

    // Format all the response data from ottkeys collection
    const formattedData = ottKeysFromCollection.map((ottKeyData, index) => ({
      id: ottKeyData._id?.toString() || `key-${index}`,
      activationCode:
        ottKeyData.activationCode ||
        ottKeyData.ottCode ||
        ottKeyData.code ||
        ottKeyData.key ||
        ottKeyData["Activation Code"] ||
        ottKeyData["OTT Code"] ||
        ottKeyData["Code"] ||
        "N/A",
      product:
        ottKeyData.product ||
        ottKeyData.productName ||
        ottKeyData.platform ||
        ottKeyData.service ||
        ottKeyData["Product"] ||
        ottKeyData["Product Name"] ||
        ottKeyData["Platform"] ||
        "OTT Platform",
      productSubCategory:
        ottKeyData.productSubCategory ||
        ottKeyData.category ||
        ottKeyData.type ||
        ottKeyData.plan ||
        ottKeyData["Product Sub Category"] ||
        ottKeyData["Category"] ||
        ottKeyData["Type"] ||
        "Premium",
      status: ottKeyData.status || ottKeyData.keyStatus || ottKeyData["Status"] || "assigned",
      assignedDate:
        ottKeyData.assignedDate ||
        ottKeyData.createdAt ||
        ottKeyData.dateAssigned ||
        ottKeyData["Assigned Date"] ||
        ottKeyData["Created At"] ||
        new Date().toISOString(),
      assignedEmail:
        ottKeyData.assignedEmail ||
        ottKeyData.email ||
        ottKeyData.customerEmail ||
        ottKeyData.userEmail ||
        ottKeyData["Assigned Email"] ||
        ottKeyData["Email"] ||
        ottKeyData["Customer Email"] ||
        normalizedEmail,
      expiryDate:
        ottKeyData.expiryDate ||
        ottKeyData.validUntil ||
        ottKeyData["Expiry Date"] ||
        ottKeyData["Valid Until"] ||
        null,
      duration:
        ottKeyData.duration ||
        ottKeyData.validityPeriod ||
        ottKeyData["Duration"] ||
        ottKeyData["Validity Period"] ||
        null,
    }))

    console.log("Formatted OTT keys data:", formattedData)
    console.log("=== OTT KEY FETCH REQUEST SUCCESS ===")

    return NextResponse.json({
      success: true,
      message: `Found ${formattedData.length} OTT key(s) successfully from ottkeys collection`,
      data: formattedData,
      count: formattedData.length,
    })
  } catch (error) {
    console.error("An unexpected error occurred in ott-key route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while fetching OTT keys. Please try again later." },
      { status: 500 },
    )
  }
}
