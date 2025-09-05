import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const claimId = searchParams.get("claimId")

    console.log("Bytewise Consulting LLP Manual claim API - Received claimId:", claimId)

    if (!claimId) {
      console.log("Bytewise Consulting LLP Manual claim API - No claimId provided")
      return NextResponse.json({ error: "Claim ID is required" }, { status: 400 })
    }

    console.log("Bytewise Consulting LLP Manual claim API - Connecting to database...")
    const db = await getDatabase()
    console.log("Bytewise Consulting LLP Manual claim API - Database name:", db.databaseName)

    const claimsCollection = db.collection("claims")

    console.log("Bytewise Consulting LLP Manual claim API - Testing database connection...")
    const connectionTest = await claimsCollection.findOne({}, { projection: { _id: 1 } })
    console.log("Bytewise Consulting LLP Manual claim API - Database connection test:", connectionTest ? "SUCCESS" : "FAILED")

    console.log("Bytewise Consulting LLP Manual claim API - Searching for claim with exact claimId:", claimId)

    // Try exact match first
    let claim = await claimsCollection.findOne({ claimId: claimId })
    console.log("Bytewise Consulting LLP Manual claim API - Exact match result:", claim ? `Found: ${claim.claimId}` : "Not found")

    // If not found, try case-insensitive search
    if (!claim) {
      console.log("Bytewise Consulting LLP Manual claim API - Trying case-insensitive search...")
      claim = await claimsCollection.findOne({
        claimId: { $regex: new RegExp(`^${claimId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      })
      console.log("Bytewise Consulting LLP Manual claim API - Case-insensitive result:", claim ? `Found: ${claim.claimId}` : "Not found")
    }

    // If still not found, try partial match
    if (!claim) {
      console.log("Bytewise Consulting LLP Manual claim API - Trying partial match search...")
      claim = await claimsCollection.findOne({
        claimId: { $regex: claimId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
      })
      console.log("Bytewise Consulting LLP Manual claim API - Partial match result:", claim ? `Found: ${claim.claimId}` : "Not found")
    }

    if (!claim) {
      console.log("Bytewise Consulting LLP Manual claim API - Trying search by email, phone, or activation code...")
      const alternativeSearch = await claimsCollection.findOne({
        $or: [
          { email: { $regex: claimId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
          { phone: { $regex: claimId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
          { phoneNumber: { $regex: claimId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
          { activationCode: { $regex: claimId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        ],
      })
      console.log(
        "Bytewise Consulting LLP Manual claim API - Alternative search result:",
        alternativeSearch ? `Found: ${alternativeSearch.claimId}` : "Not found",
      )
      if (alternativeSearch) {
        claim = alternativeSearch
      }
    }

    const totalClaims = await claimsCollection.countDocuments()
    console.log("Bytewise Consulting LLP Manual claim API - Total claims in database:", totalClaims)

    const sampleClaims = await claimsCollection
      .find({}, { projection: { claimId: 1, email: 1, phoneNumber: 1, activationCode: 1, createdAt: 1 } })
      .limit(5)
      .toArray()
    console.log("Bytewise Consulting LLP Manual claim API - Sample claims for debugging:", sampleClaims)

    if (!claim) {
      console.log("Bytewise Consulting LLP Manual claim API - Claim not found after all search attempts")
      return NextResponse.json(
        {
          error: "Claim not found",
          debug: {
            searchedId: claimId,
            totalClaims,
            sampleClaims: sampleClaims,
            databaseName: db.databaseName,
            collectionName: "claims",
            searchStrategies: [
              "Exact match",
              "Case-insensitive match",
              "Partial match",
              "Email/Phone/ActivationCode search",
            ],
          },
        },
        { status: 404 },
      )
    }

    console.log("Bytewise Consulting LLP Manual claim API - Found claim:", claim.claimId)
    console.log("Bytewise Consulting LLP Manual claim API - Processing claim data...")
    // Convert ObjectId to string for frontend
    const claimData = {
      ...claim,
      _id: claim._id.toString(),
      createdAt: claim.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: claim.updatedAt?.toISOString() || "",
      claimSubmissionDate: claim.claimSubmissionDate || claim.createdAt?.toISOString() || new Date().toISOString(),
      // Ensure all fields have default values
      firstName: claim.firstName || "",
      lastName: claim.lastName || "",
      email: claim.email || "",
      phone: claim.phone || claim.phoneNumber || "",
      phoneNumber: claim.phoneNumber || claim.phone || "",
      streetAddress: claim.streetAddress || "",
      addressLine2: claim.addressLine2 || "",
      city: claim.city || "",
      state: claim.state || "",
      postalCode: claim.postalCode || claim.pincode || "",
      country: claim.country || "India",
      purchaseType: claim.purchaseType || "",
      activationCode: claim.activationCode || "",
      purchaseDate: claim.purchaseDate || "",
      invoiceNumber: claim.invoiceNumber || "",
      sellerName: claim.sellerName || "",
      paymentStatus: claim.paymentStatus || "pending",
      paymentId: claim.paymentId || "",
      razorpayOrderId: claim.razorpayOrderId || "",
      amount: claim.amount || 0,
      ottStatus: claim.ottStatus || claim.ottCodeStatus || "pending",
      ottCode: claim.ottCode || "",
      platform: claim.platform || "",
      automationProcessed: claim.automationProcessed || false,
      emailSent: claim.emailSent || "",
      failureReason: claim.failureReason || "",
      billFileName: claim.billFileName || "",
    }

    console.log("Bytewise Consulting LLP Manual claim API - Returning processed claim data")
    return NextResponse.json({ claim: claimData })
  } catch (error: any) {
    console.error("Bytewise Consulting LLP Manual claim API - Error fetching claim:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch claim",
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const claimData = await request.json()

    if (!claimData._id) {
      return NextResponse.json({ error: "Claim ID is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const claimsCollection = db.collection("claims")

    // Prepare update data
    const updateData = {
      ...claimData,
      updatedAt: new Date(),
      // Remove _id from update data
      _id: undefined,
    }

    // Remove undefined _id
    delete updateData._id

    // Convert string _id to ObjectId for query
    const objectId = new ObjectId(claimData._id)

    // Update the claim
    const result = await claimsCollection.updateOne({ _id: objectId }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Claim updated successfully",
      modifiedCount: result.modifiedCount,
    })
  } catch (error: any) {
    console.error("Error updating claim:", error)
    return NextResponse.json({ error: error.message || "Failed to update claim" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      email,
      phone,
      streetAddress,
      city,
      state,
      pincode,
      activationCode,
      paymentStatus,
      paymentId,
      razorpayId,
      adminPassword,
    } = body

    // Validate admin password
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 })
    }

    // Connect to database
    const db = await getDatabase()

    const salesRecord = await db.collection("salesrecords").findOne({
      activationCode: activationCode,
    })

    if (!salesRecord) {
      return NextResponse.json({ error: "Activation code not found in sales records" }, { status: 400 })
    }

    // Check if activation code is already claimed
    const existingClaim = await db.collection("claims").findOne({
      activationCode: activationCode,
    })

    if (existingClaim) {
      return NextResponse.json({ error: "Activation code has already been claimed" }, { status: 400 })
    }

    // Generate unique claim ID
    const claimId = `CLAIM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const claimData = {
      claimId,
      firstName: customerName?.split(" ")[0] || "",
      lastName: customerName?.split(" ").slice(1).join(" ") || "",
      email,
      phone: phone || "",
      phoneNumber: phone || "",
      streetAddress: streetAddress || "",
      city: city || "",
      state: state || "",
      postalCode: pincode || "",
      country: "India",
      activationCode,
      paymentStatus: paymentStatus?.toLowerCase() || "pending",
      paymentId: paymentId || "",
      razorpayOrderId: razorpayId || "",
      ottStatus: paymentStatus === "PAID" ? "pending" : "pending",
      ottCode: "",
      platform: salesRecord.platform || "",
      createdAt: new Date(),
      claimSubmissionDate: new Date().toISOString(),
      processedBy: "ADMIN_MANUAL",
      isManualClaim: true,
      automationProcessed: false,
      emailSent: "",
    }

    // Insert claim
    const result = await db.collection("claims").insertOne(claimData)

    await db.collection("salesrecords").updateOne(
      { activationCode: activationCode },
      {
        $set: {
          status: "claimed",
          claimedDate: new Date(),
          claimedBy: email,
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: `Manual claim processed successfully! ${paymentStatus === "PAID" ? "OTT status set to PENDING." : "Payment required to assign OTT code."}`,
      claimId: result.insertedId,
    })
  } catch (error) {
    console.error("Manual claim error:", error)
    return NextResponse.json({ error: "Failed to process manual claim" }, { status: 500 })
  }
}
