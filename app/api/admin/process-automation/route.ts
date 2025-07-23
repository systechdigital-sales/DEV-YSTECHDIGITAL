import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"

export async function POST() {
  try {
    const db = await getDatabase()

    // Get all paid claims that haven't been processed yet
    const pendingClaims = await db
      .collection<ClaimResponse>("claims")
      .find({
        paymentStatus: "completed",
        ottCodeStatus: "pending",
      })
      .toArray()

    if (pendingClaims.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending claims to process",
        processed: 0,
        ottCodesSent: 0,
        waitEmails: 0,
        alreadyClaimed: 0,
      })
    }

    // Get all sales records and OTT keys
    const salesRecords = await db.collection<SalesRecord>("sales").find({}).toArray()
    const ottKeys = await db.collection<OTTKey>("ott_keys").find({}).toArray()

    let processed = 0
    let ottCodesSent = 0
    let waitEmails = 0
    let alreadyClaimed = 0

    for (const claim of pendingClaims) {
      processed++

      // Check if activation code exists in sales records
      const salesRecord = salesRecords.find(
        (record) => record.activationCode.toLowerCase() === claim.activationCode.toLowerCase(),
      )

      if (!salesRecord) {
        // Activation code not found in sales - send wait email
        try {
          await sendEmail(
            claim.email,
            "OTT Claim Under Verification - Please Wait 48 Hours - SYSTECH DIGITAL",
            "wait_48_hours",
            claim,
          )

          // Update claim status
          await db.collection<ClaimResponse>("claims").updateOne(
            { id: claim.id },
            {
              $set: {
                ottCodeStatus: "not_found",
                updatedAt: new Date().toISOString(),
              },
            },
          )

          waitEmails++
        } catch (emailError) {
          console.error(`Failed to send wait email to ${claim.email}:`, emailError)
        }
        continue
      }

      // Check if there's an available OTT key for this product
      const availableKey = ottKeys.find(
        (key) =>
          key.status === "available" &&
          key.productSubCategory.toLowerCase() === salesRecord.productSubCategory.toLowerCase(),
      )

      if (!availableKey) {
        // No OTT key available - send wait email
        try {
          await sendEmail(
            claim.email,
            "OTT Code Processing - Please Wait 48 Hours - SYSTECH DIGITAL",
            "wait_48_hours",
            claim,
          )

          await db.collection<ClaimResponse>("claims").updateOne(
            { id: claim.id },
            {
              $set: {
                ottCodeStatus: "not_found",
                updatedAt: new Date().toISOString(),
              },
            },
          )

          waitEmails++
        } catch (emailError) {
          console.error(`Failed to send wait email to ${claim.email}:`, emailError)
        }
        continue
      }

      // Check if this activation code was already used for OTT claim
      const existingClaim = await db.collection<ClaimResponse>("claims").findOne({
        activationCode: claim.activationCode,
        ottCodeStatus: "sent",
        id: { $ne: claim.id },
      })

      if (existingClaim) {
        // Already claimed - send already claimed email
        try {
          await sendEmail(
            claim.email,
            "OTT Code Already Claimed - Contact Support - SYSTECH DIGITAL",
            "already_claimed",
            claim,
          )

          await db.collection<ClaimResponse>("claims").updateOne(
            { id: claim.id },
            {
              $set: {
                ottCodeStatus: "already_claimed",
                updatedAt: new Date().toISOString(),
              },
            },
          )

          alreadyClaimed++
        } catch (emailError) {
          console.error(`Failed to send already claimed email to ${claim.email}:`, emailError)
        }
        continue
      }

      // All checks passed - assign OTT code and send success email
      try {
        // Update claim with OTT code
        await db.collection<ClaimResponse>("claims").updateOne(
          { id: claim.id },
          {
            $set: {
              ottCodeStatus: "sent",
              ottCode: availableKey.activationCode,
              updatedAt: new Date().toISOString(),
            },
          },
        )

        // Mark OTT key as assigned
        await db.collection<OTTKey>("ott_keys").updateOne(
          { id: availableKey.id },
          {
            $set: {
              status: "assigned",
              assignedEmail: claim.email,
              assignedDate: new Date().toISOString(),
            },
          },
        )

        // Send success email with OTT code
        await sendEmail(claim.email, "Your OTT Code is Ready! - SYSTECH DIGITAL", "ott_code_sent", {
          ...claim,
          ottCode: availableKey.activationCode,
        })

        ottCodesSent++
      } catch (error) {
        console.error(`Failed to process claim ${claim.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Automation completed successfully",
      processed,
      ottCodesSent,
      waitEmails,
      alreadyClaimed,
    })
  } catch (error) {
    console.error("Error processing automation:", error)
    return NextResponse.json({ success: false, error: "Automation processing failed" }, { status: 500 })
  }
}
