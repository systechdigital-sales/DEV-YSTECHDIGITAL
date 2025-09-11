import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

// Helper function to normalize activation codes for better matching
const normalizeActivationCode = (code: string): string => {
  return code.toString().trim().toUpperCase().replace(/\s+/g, "")
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] 🤖 Starting manual claims processing...")

    // Connect to dev-envdatabase
    const db = await getDatabase()
    const claimsCollection = db.collection("claims")
    const salesCollection = db.collection("salesrecords")
    const keysCollection = db.collection("ottkeys")

    let processedCount = 0
    let successCount = 0
    let failureCount = 0
    const details: Array<{
      email: string
      claimId: string
      status: "success" | "failed"
      message: string
      ottCode?: string
      step?: string
    }> = []

    // STEP 1: Get paid claims with pending OTT status
    console.log("[v0] 💰 Finding paid claims with pending OTT status...")
    const paidClaims = await claimsCollection
      .find({
        paymentStatus: "paid",
        ottStatus: "pending",
      })
      .toArray()

    console.log(`[v0] 📋 Found ${paidClaims.length} paid claims with pending OTT status`)

    if (paidClaims.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No claims to process",
        results: {
          processed: 0,
          success: 0,
          failed: 0,
          details: [],
        },
      })
    }

    // STEP 2-6: Process each paid claim
    for (const claim of paidClaims) {
      try {
        processedCount++
        console.log(`[v0] 🔄 Processing claim: ${claim.claimId}`)
        console.log(`[v0] 📧 Customer: ${claim.email}`)
        console.log(`[v0] 🔑 Activation Code: ${claim.activationCode}`)

        // STEP 2: Find matching sales record
        const originalCode = claim.activationCode
        const normalizedSearchCode = normalizeActivationCode(originalCode)

        console.log(`[v0] 🔍 Searching for activation code: "${originalCode}"`)

        let salesRecord = null

        // Strategy 1: Exact match
        salesRecord = await salesCollection.findOne({
          activationCode: originalCode,
        })

        if (!salesRecord) {
          // Strategy 2: Case-insensitive match
          try {
            salesRecord = await salesCollection.findOne({
              activationCode: { $regex: originalCode, $options: "i" },
            })
          } catch (regexError) {
            console.log("[v0] Regex search failed, skipping case-insensitive match")
          }
        }

        if (!salesRecord) {
          // Strategy 3: Normalized match
          const allSalesRecords = await salesCollection.find({}).toArray()
          salesRecord =
            allSalesRecords.find((record) => normalizeActivationCode(record.activationCode) === normalizedSearchCode) ||
            null
        }

        if (!salesRecord) {
          console.error(`[v0] ❌ No sales record found for activation code: ${originalCode}`)

          details.push({
            email: claim.email,
            claimId: claim.claimId,
            status: "failed",
            message: "Invalid activation code - not found in sales records",
            step: "Code Verification",
          })

          failureCount++
          continue
        }

        console.log(`[v0] ✅ Found sales record: ${salesRecord.product || "Unknown product"}`)

        // STEP 3: Check if already claimed
        if (salesRecord.status === "claimed") {
          console.error(`[v0] ❌ Activation code already claimed by: ${salesRecord.claimedBy}`)

          details.push({
            email: claim.email,
            claimId: claim.claimId,
            status: "failed",
            message: `Activation code already claimed by: ${salesRecord.claimedBy}`,
            step: "Duplicate Check",
          })

          failureCount++
          continue
        }

        // STEP 4: Mark sales record as claimed (update claimedBy)
        await salesCollection.updateOne(
          { _id: salesRecord._id },
          {
            $set: {
              status: "claimed",
              claimedBy: claim.email,
              claimedDate: new Date(),
              updatedAt: new Date(),
            },
          },
        )

        console.log(`[v0] ✅ Sales record marked as claimed by: ${claim.email}`)

        // STEP 5: Find available OTT key from ottkeys collection
        console.log(`[v0] 🎯 Looking for available OTT key...`)

        const availableKey = await keysCollection.findOne({
          status: "Available",
        })

        if (!availableKey) {
          console.error(`[v0] ❌ No available OTT keys found`)

          // Rollback sales record status
          await salesCollection.updateOne(
            { _id: salesRecord._id },
            {
              $set: {
                status: "available",
                claimedBy: null,
                claimedDate: null,
                updatedAt: new Date(),
              },
            },
          )

          details.push({
            email: claim.email,
            claimId: claim.claimId,
            status: "failed",
            message: "No available OTT keys",
            step: "Key Assignment",
          })

          failureCount++
          continue
        }

        console.log(`[v0] 🎉 Found available OTT key: ${availableKey.activationCode}`)

        // STEP 6: Assign OTT key and update claim
        const ottCode = availableKey.activationCode

        // Mark OTT key as assigned
        await keysCollection.updateOne(
          { _id: availableKey._id },
          {
            $set: {
              status: "assigned",
              assignedEmail: claim.email,
              assignedDate: new Date(),
              updatedAt: new Date(),
            },
          },
        )

        // Update claim with success - store OTT code and change status to delivered
        await claimsCollection.updateOne(
          { _id: claim._id },
          {
            $set: {
              ottStatus: "delivered",
              ottCode: ottCode,
              platform: availableKey.product || "OTTplay",
              updatedAt: new Date(),
            },
          },
        )

        details.push({
          email: claim.email,
          claimId: claim.claimId,
          status: "success",
          message: "OTT code assigned and delivered successfully",
          ottCode: ottCode,
          step: "Completed",
        })

        console.log(`[v0] ✅ Successfully processed claim: ${claim.claimId}`)
        successCount++
      } catch (claimError) {
        console.error(`[v0] ❌ Error processing claim ${claim.claimId}:`, claimError)

        details.push({
          email: claim.email,
          claimId: claim.claimId,
          status: "failed",
          message: `Processing error: ${claimError.message}`,
          step: "Processing",
        })

        failureCount++
      }
    }

    console.log(`[v0] 🎯 Manual claims processing completed:`)
    console.log(`[v0]    📊 Processed: ${processedCount}`)
    console.log(`[v0]    ✅ Successful: ${successCount}`)
    console.log(`[v0]    ❌ Failed: ${failureCount}`)

    return NextResponse.json({
      success: true,
      message: "Manual claims processing completed",
      results: {
        processed: processedCount,
        success: successCount,
        failed: failureCount,
        details: details,
      },
    })
  } catch (error: any) {
    console.error("[v0] ❌ Manual claims processing failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Manual claims processing failed",
      },
      { status: 500 },
    )
  }
}
