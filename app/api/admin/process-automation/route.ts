import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import type { IClaimResponse, ISalesRecord, IOTTKey } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    console.log("Automation process started")
    const db = await getDatabase()

    // Get all paid claims that haven't been processed
    const pendingClaims = await db
      .collection<IClaimResponse>("claims")
      .find({
        paymentStatus: "paid",
        ottCodeStatus: "pending", // Only process claims that are still pending
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
        console.log(`Processing claim: ${claim._id?.toString()}`)
        results.processed++

        // 1. Check if activation code exists in sales records
        const salesRecord = await db.collection<ISalesRecord>("salesrecords").findOne({
          activationCode: claim.activationCode,
        })
        console.log(`Found sales record for activation code ${claim.activationCode}:`, salesRecord)

        if (!salesRecord) {
          console.log(`Activation code not found in sales: ${claim.activationCode}`)
          await db.collection<IClaimResponse>("claims").updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "activation_code_not_found", // Specific status for clarity
                updatedAt: new Date(),
              },
            },
          )

          const emailResult = await sendEmail(claim.email, "OTT Claim Under Review - Please Wait - SYSTECH DIGITAL", "automation_failed", {
            ...claim,
            id: claim._id?.toString() || "",
            createdAt: claim.createdAt?.toISOString() || "",
            ottCodeStatus: "activation_code_not_found",
          })

          if (emailResult.success === false) {
            console.warn(`Email sending failed for claim ${claim._id?.toString()} with status activation_code_not_found`)
          }
          results.failed++
          results.details.push({
            claimId: claim._id?.toString(),
            status: "failed",
            reason: "Activation code not found in sales records",
          })
          continue // Move to the next claim
        }

        // 2. Check if sales record is already claimed
        if (salesRecord.status === "claimed") {
          console.log(`Activation code already claimed: ${claim.activationCode}`)
          await db.collection<IClaimResponse>("claims").updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "already_claimed", // Specific status for clarity
                updatedAt: new Date(),
              },
            },
          )
          const emailResult = await sendEmail(
            claim.email,
            "OTT Code Already Claimed - Contact Support - SYSTECH DIGITAL",
            "automation_failed",
            {
              ...claim,
              id: claim._id?.toString() || "",
              createdAt: claim.createdAt?.toISOString() || "",
              ottCodeStatus: "already_claimed",
            },
          )

          if (emailResult.success === false) {
            console.warn(`Email sending failed for claim ${claim._id?.toString()} with status already_claimed`)
          }
          results.failed++
          results.details.push({
            claimId: claim._id?.toString(),
            status: "failed",
            reason: "Activation code already claimed",
          })
          continue // Move to the next claim
        }

        console.log(`Processing sales record for activation code ${claim.activationCode}:`, salesRecord)
        // 3. Get an available OTT key
        const availableKeyResult = await db.collection<IOTTKey>("ottkeys").findOneAndUpdate(
          {
            status: "available",
          },
          {
            $set: {
              status: "assigned",
              assignedEmail: claim.email,
              assignedDate: new Date(),
              assignedTo: claim._id, // Link to the claim's ObjectId
              updatedAt: new Date(),
            },
          },
          { returnDocument: "after" } // Return the updated document
        )

        console.log(`Available OTT key found:`, availableKeyResult.value)

        // Check if a key was found and assigned
        if (!availableKeyResult.value || !availableKeyResult.value) {
          console.log("No available OTT keys")
          await db.collection<IClaimResponse>("claims").updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "no_key_available", // Specific status for clarity
                updatedAt: new Date(),
              },
            },
          )
          const createdAt =
              claim.createdAt instanceof Date
                  ? claim.createdAt.toISOString()
                  : typeof claim.createdAt === "string"
                      ? claim.createdAt
                      : ""
          const emailResult = await sendEmail(claim.email, "OTT Claim Under Review - Please Wait - SYSTECH DIGITAL", "automation_failed", {
            ...claim,
            id: claim._id?.toString() || "",
            createdAt: createdAt,
            ottCodeStatus: "no_key_available",
          })

          if (emailResult.success === false) {
            console.warn(`Email sending failed for claim ${claim._id?.toString()} with status no_key_available`)
          }
          results.failed++
          results.details.push({
            claimId: claim._id?.toString(),
            status: "failed",
            reason: "No available OTT keys",
          })
          continue // Move to the next claim
        }

        // If we reach here, availableKeyResult.value is guaranteed to be non-null
        const assignedOTTKey: IOTTKey = availableKeyResult.value // Explicitly type and assign here

        // 4. Update claim with OTT code and status
        await db.collection<IClaimResponse>("claims").updateOne(
          { _id: claim._id },
          {
            $set: {
              ottCodeStatus: "delivered", // Using 'delivered' as per previous code, implies 'sent'
              ottCode: assignedOTTKey.activationCode,
              updatedAt: new Date(),
            },
          },
        )

        // 5. Mark sales record as claimed
        await db.collection<ISalesRecord>("salesrecords").updateOne(
          { _id: salesRecord._id },
          {
            $set: {
              status: "claimed",
              updatedAt: new Date(),
            },
          },
        )

        // 6. Send success email
        const emailResult = await sendEmail(claim.email, "OTT Key Delivered Successfully - SYSTECH DIGITAL", "automation_success", {
          ...claim,
          id: claim._id?.toString() || "",
          createdAt: claim.createdAt?.toISOString() || "",
          ottCode: assignedOTTKey.activationCode,
          platform: salesRecord.product, // Add platform information for the email template
        })

        if (emailResult.success === false) {
          console.warn(`Email sending failed for claim ${claim._id?.toString()}, but claim was processed successfully`)
        }

        results.success++
        results.details.push({
          claimId: claim._id?.toString(),
          status: "success",
          ottCode: assignedOTTKey.activationCode,
        })
        console.log(`Successfully processed claim: ${claim._id?.toString()}`)
      } catch (claimError) {
        console.error(`Error processing claim ${claim._id?.toString()}:`, claimError)
        results.failed++
        results.details.push({
          claimId: claim._id?.toString(),
          status: "error",
          reason: claimError instanceof Error ? claimError.message : "Unknown error",
        })
      }
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
