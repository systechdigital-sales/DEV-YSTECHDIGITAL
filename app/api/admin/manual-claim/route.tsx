import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { customerName, email, phone, activationCode, adminPassword, paymentStatus, paymentId, razorpayId } =
      await request.json()

    // Validate admin password
    if (adminPassword !== "admin123") {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Check if activation code exists in salesrecords collection
    const salesRecord = await db.collection("salesrecords").findOne({
      activationCode: activationCode,
    })

    if (!salesRecord) {
      return NextResponse.json(
        {
          error: "Activation code not found in sales records",
        },
        { status: 404 },
      )
    }

    // Check if activation code is already claimed
    const existingClaim = await db.collection("claims").findOne({
      activationCode: activationCode,
    })

    if (existingClaim) {
      return NextResponse.json(
        {
          error: "Activation code has already been claimed",
        },
        { status: 400 },
      )
    }

    // Generate claim ID
    const claimId = `CLAIM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const claimData = {
      claimId,
      customerName,
      email,
      phone: phone || "",
      activationCode,
      paymentStatus,
      paymentId: paymentStatus === "PAID" ? paymentId : "",
      razorpayId: paymentStatus === "PAID" ? razorpayId : "",
      ottStatus: paymentStatus === "PAID" ? "PENDING" : "NOT_ASSIGNED", // Set OTT status to PENDING if PAID
      ottCode: "",
      platform: salesRecord.platform || "OTT Platform",
      createdAt: new Date(),
      processedAt: new Date(),
      source: "MANUAL_ADMIN",
    }

    // Insert claim
    const result = await db.collection("claims").insertOne(claimData)

    if (!result.insertedId) {
      return NextResponse.json({ error: "Failed to create claim" }, { status: 500 })
    }

    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/send-manual-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: "Claim Received - Processing Your Request",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Claim Received Successfully</h2>
              <p>Dear ${customerName},</p>
              <p>Your claim has been received and is being processed.</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>Claim Details:</strong><br>
                Claim ID: ${claimId}<br>
                Activation Code: ${activationCode}<br>
                Status: ${paymentStatus}<br>
                ${paymentStatus === "PAID" ? `Payment ID: ${paymentId}<br>Razorpay ID: ${razorpayId}<br>` : ""}
              </div>
              <p>You will receive your OTT code once processing is complete.</p>
              <p>Thank you for choosing SYSTECH DIGITAL!</p>
            </div>
          `,
        }),
      })
    } catch (emailError) {
      console.error("Failed to send email:", emailError)
      // Don't fail the claim creation if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Manual claim processed successfully",
      claimId,
      data: claimData,
    })
  } catch (error) {
    console.error("Manual claim error:", error)
    return NextResponse.json(
      {
        error: "Failed to process manual claim",
      },
      { status: 500 },
    )
  }
}
