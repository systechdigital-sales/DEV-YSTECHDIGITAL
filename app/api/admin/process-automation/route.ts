import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()

    // Get all paid claims that haven't been processed yet
    const pendingClaims = await db
      .collection<ClaimResponse>("claims")
      .find({
        paymentStatus: "completed",
        ottCodeStatus: { $in: ["pending", "payment_verified"] },
      })
      .toArray()

    if (pendingClaims.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending claims to process",
        processed: 0,
        results: [],
      })
    }

    const results = []

    for (const claim of pendingClaims) {
      try {
        // Check if activation code exists in sales
        const salesRecord = await db.collection<SalesRecord>("sales").findOne({ activationCode: claim.activationCode })

        if (!salesRecord) {
          // Activation code not found in sales
          await db.collection<ClaimResponse>("claims").updateOne(
            { id: claim.id },
            {
              $set: {
                ottCodeStatus: "not_found",
                updatedAt: new Date().toISOString(),
              },
            },
          )

          // Send failure email
          await sendEmail(claim.email, "OTT Claim Processing Issue - SYSTECH DIGITAL", "automation_failed", {
            ...claim,
            ottCodeStatus: "not_found",
          })

          results.push({
            claimId: claim.id,
            email: claim.email,
            status: "failed",
            reason: "Activation code not found in sales database",
          })
          continue
        }

        // Find available OTT key for the same product
        const availableKey = await db.collection<OTTKey>("ott_keys").findOne({
          productSubCategory: salesRecord.productSubCategory,
          product: salesRecord.product,
          status: "available",
        })

        if (!availableKey) {
          // No available OTT key
          await db.collection<ClaimResponse>("claims").updateOne(
            { id: claim.id },
            {
              $set: {
                ottCodeStatus: "no_key_available",
                updatedAt: new Date().toISOString(),
              },
            },
          )

          // Send failure email
          await sendEmail(claim.email, "OTT Claim Processing Issue - SYSTECH DIGITAL", "automation_failed", {
            ...claim,
            ottCodeStatus: "no_key_available",
          })

          results.push({
            claimId: claim.id,
            email: claim.email,
            status: "failed",
            reason: "No available OTT key for this product",
          })
          continue
        }

        // Check if this activation code was already claimed
        const existingClaim = await db.collection<ClaimResponse>("claims").findOne({
          activationCode: claim.activationCode,
          ottCodeStatus: "sent",
          id: { $ne: claim.id },
        })

        if (existingClaim) {
          // Already claimed
          await db.collection<ClaimResponse>("claims").updateOne(
            { id: claim.id },
            {
              $set: {
                ottCodeStatus: "already_claimed",
                updatedAt: new Date().toISOString(),
              },
            },
          )

          // Send failure email
          await sendEmail(claim.email, "OTT Claim Processing Issue - SYSTECH DIGITAL", "automation_failed", {
            ...claim,
            ottCodeStatus: "already_claimed",
          })

          results.push({
            claimId: claim.id,
            email: claim.email,
            status: "failed",
            reason: "Activation code already claimed",
          })
          continue
        }

        // Success - assign OTT key
        const currentDate = new Date().toISOString()

        // Update claim with OTT code
        await db.collection<ClaimResponse>("claims").updateOne(
          { id: claim.id },
          {
            $set: {
              ottCodeStatus: "sent",
              ottCode: availableKey.activationCode,
              updatedAt: currentDate,
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
              assignedDate: currentDate,
            },
          },
        )

        // Send success email with OTT key
        await sendEmail(claim.email, "OTT Key Delivered Successfully - SYSTECH DIGITAL", "automation_success", {
          ...claim,
          ottCode: availableKey.activationCode,
        })

        results.push({
          claimId: claim.id,
          email: claim.email,
          status: "success",
          ottCode: availableKey.activationCode,
          reason: "OTT key assigned successfully",
        })
      } catch (error) {
        console.error(`Error processing claim ${claim.id}:`, error)
        results.push({
          claimId: claim.id,
          email: claim.email,
          status: "error",
          reason: `Processing error: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      }
    }

    const successCount = results.filter((r) => r.status === "success").length
    const failureCount = results.filter((r) => r.status === "failed").length
    const errorCount = results.filter((r) => r.status === "error").length

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} claims: ${successCount} successful, ${failureCount} failed, ${errorCount} errors`,
      processed: results.length,
      successful: successCount,
      failed: failureCount,
      errors: errorCount,
      results,
    })
  } catch (error) {
    console.error("Error processing automation:", error)
    return NextResponse.json({ success: false, error: "Failed to process automation" }, { status: 500 })
  }
}
