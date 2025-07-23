import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import type { ClaimResponse, SalesRecord, OTTKey } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    console.log("Automation process started")

    const db = await getDatabase()

    // Get all paid claims that haven't been processed
    const pendingClaims = await db
      .collection<ClaimResponse>("claims")
      .find({
        paymentStatus: "completed",
        ottCodeStatus: "pending",
      })
      .toArray()

    console.log(`Found ${pendingClaims.length} pending claims to process`)

    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      details: [] as any[],
    }

    for (const claim of pendingClaims) {
      try {
        console.log(`Processing claim: ${claim.id}`)

        // Check if activation code exists in sales records
        const salesRecord = await db.collection<SalesRecord>("sales").findOne({
          activationCode: claim.activationCode,
        })

        if (!salesRecord) {
          console.log(`Activation code not found in sales: ${claim.activationCode}`)

          // Update claim status to failed
          await db.collection<ClaimResponse>("claims").updateOne(
            { id: claim.id },
            {
              $set: {
                ottCodeStatus: "failed",
                updatedAt: new Date().toISOString(),
              },
            },
          )

          // Send wait email (48 hours)
          await sendEmail(
            claim.email,
            "OTT Claim Under Review - Please Wait - SYSTECH DIGITAL",
            "automation_failed",
            claim,
          )

          results.failed++
          results.details.push({
            claimId: claim.id,
            status: "failed",
            reason: "Activation code not found in sales records",
          })
          continue
        }

        // Check if already claimed
        if (salesRecord.status === "claimed") {
          console.log(`Activation code already claimed: ${claim.activationCode}`)

          await db.collection<ClaimResponse>("claims").updateOne(
            { id: claim.id },
            {
              $set: {
                ottCodeStatus: "failed",
                updatedAt: new Date().toISOString(),
              },
            },
          )

          await sendEmail(
            claim.email,
            "OTT Code Already Claimed - Contact Support - SYSTECH DIGITAL",
            "automation_failed",
            {
              ...claim,
              ottCodeStatus: "already_claimed",
            },
          )

          results.failed++
          results.details.push({
            claimId: claim.id,
            status: "failed",
            reason: "Activation code already claimed",
          })
          continue
        }

        // Get available OTT key
        const availableKey = await db.collection<OTTKey>("ottKeys").findOne({
          status: "available",
        })

        if (!availableKey) {
          console.log("No available OTT keys")

          await db.collection<ClaimResponse>("claims").updateOne(
            { id: claim.id },
            {
              $set: {
                ottCodeStatus: "failed",
                updatedAt: new Date().toISOString(),
              },
            },
          )

          results.failed++
          results.details.push({
            claimId: claim.id,
            status: "failed",
            reason: "No available OTT keys",
          })
          continue
        }

        // Assign OTT key to claim
        await db.collection<OTTKey>("ottKeys").updateOne(
          { id: availableKey.id },
          {
            $set: {
              status: "assigned",
              assignedTo: claim.id,
              assignedDate: new Date().toISOString(),
            },
          },
        )

        // Update claim with OTT code
        await db.collection<ClaimResponse>("claims").updateOne(
          { id: claim.id },
          {
            $set: {
              ottCodeStatus: "delivered",
              ottCode: availableKey.keyCode,
              updatedAt: new Date().toISOString(),
            },
          },
        )

        // Mark sales record as claimed
        await db.collection<SalesRecord>("sales").updateOne(
          { id: salesRecord.id },
          {
            $set: {
              status: "claimed",
            },
          },
        )

        // Send success email with OTT code
        await sendEmail(claim.email, "OTT Key Delivered Successfully - SYSTECH DIGITAL", "automation_success", {
          ...claim,
          ottCode: availableKey.keyCode,
        })

        results.success++
        results.details.push({
          claimId: claim.id,
          status: "success",
          ottCode: availableKey.keyCode,
        })

        console.log(`Successfully processed claim: ${claim.id}`)
      } catch (claimError) {
        console.error(`Error processing claim ${claim.id}:`, claimError)
        results.failed++
        results.details.push({
          claimId: claim.id,
          status: "error",
          reason: claimError instanceof Error ? claimError.message : "Unknown error",
        })
      }

      results.processed++
    }

    console.log("Automation process completed:", results)

    return NextResponse.json({
      success: true,
      message: "Automation process completed",
      results,
    })
  } catch (error) {
    console.error("Automation process error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Automation process failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
