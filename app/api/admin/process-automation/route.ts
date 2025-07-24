import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

export async function POST(request) {
  try {
    const db = await getDatabase()

    // Get all paid claims that haven't been processed yet
    const pendingClaims = await db
      .collection("claims")
      .find({
        paymentStatus: "completed",
        ottCodeStatus: "pending",
      })
      .toArray()

    let processed = 0
    let ottCodesSent = 0
    let waitEmails = 0
    let alreadyClaimed = 0

    for (const claim of pendingClaims) {
      try {
        // Check if activation code exists in sales records
        const salesRecord = await db.collection("sales").findOne({
          activationCode: claim.activationCode,
        })

        if (!salesRecord) {
          // Send wait email - activation code not found
          await sendEmail(
            claim.email,
            "OTT Claim Processing - Please Wait",
            "automation_wait",
            claim
          )
          waitEmails++
          processed++
          continue
        }

        // Find available OTT key matching the product
        const availableKey = await db.collection("ottKeys").findOne({
          product: salesRecord.product,
          status: "available",
        })

        if (!availableKey) {
          // Send wait email - no available keys
          await sendEmail(
            claim.email,
            "OTT Claim Processing - Please Wait",
            "automation_wait",
            claim
          )
          waitEmails++
          processed++
          continue
        }

        // Assign the key to the customer
        await db.collection("ottKeys").updateOne(
          { id: availableKey.id },
          {
            $set: {
              status: "assigned",
              assignedEmail: claim.email,
              assignedDate: new Date().toISOString(),
            },
          }
        )

        // Update claim with OTT code
        await db.collection("claims").updateOne(
          { id: claim.id },
          {
            $set: {
              ottCodeStatus: "sent",
              ottCode: availableKey.activationCode,
              updatedAt: new Date().toISOString(),
            },
          }
        )

        // Send success email with OTT code
        await sendEmail(
          claim.email,
          "Your OTT Platform Access Code - SYSTECH DIGITAL",
          "automation_success",
          {
            ...claim,
            ottCode: availableKey.activationCode,
            platform: availableKey.product,
          }
        )

        ottCodesSent++
        processed++
      } catch (error) {
        console.error(`Error processing claim ${claim.id}:`, error)
        // continue with next claim
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      ottCodesSent,
      waitEmails,
      alreadyClaimed,
      message: "Automation process completed successfully",
    })
  } catch (error) {
    console.error("Error in automation process:", error)
    return NextResponse.json(
      { success: false, error: "Automation process failed" },
      { status: 500 }
    )
  }
}
