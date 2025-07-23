import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail, emailTemplates } from "@/lib/email"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"

export async function POST() {
  try {
    const db = await getDatabase()

    // Get all pending claims with completed payments
    const pendingClaims = await db
      .collection<ClaimResponse>("claims")
      .find({
        paymentStatus: "completed",
        ottCodeStatus: { $in: ["pending", "payment_verified"] },
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
      const fullName = `${claim.firstName} ${claim.lastName}`

      try {
        // Check if activation code exists in sales records
        const salesRecord = salesRecords.find((sale) => sale.activationCode === claim.activationCode)

        if (!salesRecord) {
          // Send wait email - activation code not found
          waitEmails++

          const emailTemplate = emailTemplates.waitEmail(fullName, claim.activationCode)
          await sendEmail({
            to: claim.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          })

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

          const emailTemplate = emailTemplates.alreadyClaimed(fullName, claim.activationCode)
          await sendEmail({
            to: claim.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          })

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

          // Send OTT code email
          const emailTemplate = emailTemplates.ottCodeSent(fullName, availableKey.activationCode, availableKey.product)
          await sendEmail({
            to: claim.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          })

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

          const emailTemplate = emailTemplates.waitEmail(fullName, claim.activationCode)
          await sendEmail({
            to: claim.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          })

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
      } catch (emailError) {
        console.error(`Error processing claim ${claim.id}:`, emailError)
        // Continue with next claim even if one fails
      }
    }

    console.log("Automation completed:", {
      processed,
      ottCodesSent,
      waitEmails,
      alreadyClaimed,
    })

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
