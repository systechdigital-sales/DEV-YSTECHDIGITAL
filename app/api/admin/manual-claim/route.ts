import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

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
    const { db } = await connectToDatabase()

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

    const claimData = {
      customerName,
      email,
      phone: phone || "",
      streetAddress: streetAddress || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      activationCode,
      paymentStatus,
      paymentId: paymentId || "",
      razorpayId: razorpayId || "",
      ottStatus: paymentStatus === "PAID" ? "PENDING" : "NOT_ASSIGNED",
      ottCode: "",
      platform: salesRecord.platform || "",
      claimDate: new Date(),
      processedBy: "ADMIN_MANUAL",
      isManualClaim: true,
    }

    // Insert claim
    const result = await db.collection("claims").insertOne(claimData)

    await db.collection("salesrecords").updateOne(
      { activationCode: activationCode },
      {
        $set: {
          isClaimed: true,
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
