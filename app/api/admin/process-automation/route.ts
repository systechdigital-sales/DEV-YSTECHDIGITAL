import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"

export async function POST() {
  try {
    const db = await getDatabase()

    // Get all pending claims with completed payments
    const pendingClaims = await db
      .collection<ClaimResponse>("claims")
      .find({
        paymentStatus: "completed",
        ottCodeStatus: { $in: ["pending", "not_sent"] },
      })
      .toArray()

    // Get all sales records
    const salesRecords = await db.collection<SalesRecord>("sales").find({}).toArray()

    // Get available OTT keys
    const availableKeys = await db.collection<OTTKey>("ott_keys").find({ status: "available" }).toArray()

    let processed = 0
    let ottCodesSent = 0
    let waitEmails = 0
    let alreadyClaimed = 0

    for (const claim of pendingClaims) {
      processed++

      // Check if activation code exists in sales records
      const salesRecord = salesRecords.find((sale) => sale.activationCode === claim.activationCode)

      if (!salesRecord) {
        // Send wait email - activation code not found
        waitEmails++
        await db.collection<ClaimResponse>("claims").updateOne(
          { _id: claim._id },
          {
            $set: {
              ottCodeStatus: "wait_email_sent",
              lastProcessed: new Date().toISOString(),
            },
          },
        )
        continue
      }

      // Check if this activation code was already used
      const existingClaim = await db.collection<ClaimResponse>("claims").findOne({
        activationCode: claim.activationCode,
        ottCodeStatus: "sent",
        _id: { $ne: claim._id },
      })

      if (existingClaim) {
        // Already claimed
        alreadyClaimed++
        await db.collection<ClaimResponse>("claims").updateOne(
          { _id: claim._id },
          {
            $set: {
              ottCodeStatus: "already_claimed",
              lastProcessed: new Date().toISOString(),
            },
          },
        )
        continue
      }

      // Find an available OTT key
      const availableKey = availableKeys.find((key) => key.status === "available")

      if (availableKey) {
        // Assign OTT key to user
        ottCodesSent++

        // Update claim with OTT code
        await db.collection<ClaimResponse>("claims").updateOne(
          { _id: claim._id },
          {
            $set: {
              ottCodeStatus: "sent",
              ottCode: availableKey.activationCode,
              lastProcessed: new Date().toISOString(),
            },
          },
        )

        // Mark OTT key as used
        await db.collection<OTTKey>("ott_keys").updateOne(
          { _id: availableKey._id },
          {
            $set: {
              status: "assigned",
              assignedEmail: claim.email,
              assignedDate: new Date().toISOString(),
            },
          },
        )

        // Remove from available keys array
        const keyIndex = availableKeys.findIndex((k) => k._id === availableKey._id)
        if (keyIndex > -1) {
          availableKeys.splice(keyIndex, 1)
        }
      } else {
        // No OTT keys available - send wait email
        waitEmails++
        await db.collection<ClaimResponse>("claims").updateOne(
          { _id: claim._id },
          {
            $set: {
              ottCodeStatus: "no_keys_available",
              lastProcessed: new Date().toISOString(),
            },
          },
        )
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      ottCodesSent,
      waitEmails,
      alreadyClaimed,
      message: "Automation completed successfully",
    })
  } catch (error) {
    console.error("Error processing automation:", error)
    return NextResponse.json({ success: false, error: "Failed to process automation" }, { status: 500 })
  }
}
