import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import type { IClaimResponse, ISalesRecord, IOTTKey } from "@/lib/models"

// Helper function to normalize activation codes for better matching
const normalizeActivationCode = (code: string): string => {
  return code.toString().trim().toUpperCase().replace(/\s+/g, "")
}

// Helper function to determine platform from product name
const getPlatformFromProduct = (product: string): string => {
  const productLower = product.toLowerCase()

  // Map common product names to platforms
  const platformMapping: Record<string, string> = {
    ottplay: "OTTplay",
    "ott play": "OTTplay",
    netflix: "Netflix",
    "amazon prime": "Amazon Prime Video",
    "prime video": "Amazon Prime Video",
    disney: "Disney+ Hotstar",
    hotstar: "Disney+ Hotstar",
    zee5: "ZEE5",
    sonyliv: "SonyLIV",
    voot: "Voot",
    "alt balaji": "ALTBalaji",
    "mx player": "MX Player",
    "jio cinema": "JioCinema",
    "eros now": "Eros Now",
    hungama: "Hungama Play",
    shemaroo: "ShemarooMe",
    lionsgate: "Lionsgate Play",
    fancode: "FanCode",
    "sun nxt": "Sun NXT",
  }

  // Check for exact matches first
  for (const [key, platform] of Object.entries(platformMapping)) {
    if (productLower.includes(key)) {
      return platform
    }
  }

  // Default to OTTplay if no specific platform found
  return "OTTplay"
}

export async function POST(request: NextRequest) {
  try {
    console.log("🤖 Starting automation process...")

    // Connect to systech_ott_platform database
    const db = await getDatabase("systech_ott_platform")
    const claimsCollection = db.collection<IClaimResponse>("claims")
    const salesCollection = db.collection<ISalesRecord>("salesrecords")
    const keysCollection = db.collection<IOTTKey>("ottkeys")

    // Get all paid claims that haven't been processed yet
    const unprocessedClaims = await claimsCollection
      .find({
        paymentStatus: "paid",
        ottCodeStatus: { $in: ["pending", "failed"] },
      })
      .toArray()

    console.log(`📋 Found ${unprocessedClaims.length} unprocessed paid claims`)

    if (unprocessedClaims.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No unprocessed claims found",
        processed: 0,
      })
    }

    let successCount = 0
    let failureCount = 0

    for (const claim of unprocessedClaims) {
      try {
        console.log(`\n🔄 Processing claim: ${claim._id}`)
        console.log(`📧 Customer: ${claim.email}`)
        console.log(`🔑 Activation Code: ${claim.activationCode}`)

        // Step 1: Find matching sales record with enhanced matching
        const originalCode = claim.activationCode
        const normalizedSearchCode = normalizeActivationCode(originalCode)

        console.log(`🔍 Searching for activation code:`)
        console.log(`   Original: "${originalCode}"`)
        console.log(`   Normalized: "${normalizedSearchCode}"`)

        let salesRecord: ISalesRecord | null = null

        // Strategy 1: Exact match
        salesRecord = await salesCollection.findOne({
          activationCode: originalCode,
        })

        if (!salesRecord) {
          // Strategy 2: Case-insensitive match
          console.log(`🔍 Trying case-insensitive match...`)
          salesRecord = await salesCollection.findOne({
            activationCode: { $regex: new RegExp(`^${originalCode}$`, "i") },
          })
        }

        if (!salesRecord) {
          // Strategy 3: Normalized match (remove spaces, uppercase)
          console.log(`🔍 Trying normalized match...`)
          const allSalesRecords = await salesCollection.find({}).toArray()

          salesRecord =
            allSalesRecords.find((record) => normalizeActivationCode(record.activationCode) === normalizedSearchCode) ||
            null
        }

        if (!salesRecord) {
          // Strategy 4: Partial match (contains)
          console.log(`🔍 Trying partial match...`)
          salesRecord = await salesCollection.findOne({
            activationCode: { $regex: normalizedSearchCode, $options: "i" },
          })
        }

        if (!salesRecord) {
          console.error(`❌ No sales record found for activation code: ${originalCode}`)

          // Show some sample records for debugging
          const sampleRecords = await salesCollection.find({}).limit(5).toArray()
          console.log(`📊 Sample sales records for debugging:`)
          sampleRecords.forEach((record, index) => {
            console.log(`   ${index + 1}. "${record.activationCode}" (${record.product})`)
          })

          // Update claim status and send failure email
          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "failed",
                failureReason: "Invalid activation code - not found in sales records",
                updatedAt: new Date(),
                debugInfo: {
                  searchedCode: originalCode,
                  normalizedCode: normalizedSearchCode,
                  searchStrategies: ["exact", "case-insensitive", "normalized", "partial"],
                  sampleCodes: sampleRecords.map((r) => r.activationCode),
                },
              },
            },
          )

          // Send failure email to customer
          await sendFailureEmail(claim, "invalid_code", "Invalid activation code - not found in sales records")

          failureCount++
          continue
        }

        console.log(`✅ Found sales record: ${salesRecord.product} (${salesRecord.productSubCategory})`)

        // Check if already claimed
        if (salesRecord.status === "claimed") {
          console.error(`❌ Activation code already claimed by: ${salesRecord.claimedBy}`)

          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "failed",
                failureReason: "Activation code already claimed",
                updatedAt: new Date(),
              },
            },
          )

          await sendFailureEmail(claim, "duplicate_claim", "This activation code has already been claimed")

          failureCount++
          continue
        }

        // Step 2: Find available OTT key for the platform
        const platform = getPlatformFromProduct(salesRecord.product)
        console.log(`🎯 Looking for ${platform} OTT key...`)

        const availableKey = await keysCollection.findOne({
          status: "available",
          $or: [
            { product: { $regex: platform, $options: "i" } },
            { productSubCategory: { $regex: platform, $options: "i" } },
          ],
        })

        if (!availableKey) {
          console.error(`❌ No available OTT keys for platform: ${platform}`)

          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "failed",
                failureReason: `No available OTT keys for ${platform}`,
                updatedAt: new Date(),
              },
            },
          )

          await sendFailureEmail(claim, "no_keys", `No available OTT keys for ${platform}`)

          failureCount++
          continue
        }

        console.log(`🎉 Found available OTT key: ${availableKey.activationCode}`)

        // Step 3: Update all records atomically
        const session = db.client?.startSession()

        try {
          await session?.withTransaction(async () => {
            // Mark sales record as claimed
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

            // Mark OTT key as assigned
            await keysCollection.updateOne(
              { _id: availableKey._id },
              {
                $set: {
                  status: "assigned",
                  assignedEmail: claim.email,
                  assignedDate: new Date(),
                  assignedTo: claim._id,
                  updatedAt: new Date(),
                },
              },
            )

            // Update claim with success
            await claimsCollection.updateOne(
              { _id: claim._id },
              {
                $set: {
                  ottCodeStatus: "delivered",
                  ottCode: availableKey.activationCode,
                  platform: platform,
                  updatedAt: new Date(),
                },
              },
            )
          })

          // Send success email with OTT code
          await sendSuccessEmail(claim, availableKey.activationCode, platform)

          console.log(`✅ Successfully processed claim: ${claim._id}`)
          successCount++
        } catch (transactionError) {
          console.error(`❌ Transaction failed for claim ${claim._id}:`, transactionError)

          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "failed",
                failureReason: "Database transaction failed",
                updatedAt: new Date(),
              },
            },
          )

          await sendFailureEmail(claim, "technical_error", "Database transaction failed")
          failureCount++
        } finally {
          await session?.endSession()
        }
      } catch (claimError) {
        console.error(`❌ Error processing claim ${claim._id}:`, claimError)

        await claimsCollection.updateOne(
          { _id: claim._id },
          {
            $set: {
              ottCodeStatus: "failed",
              failureReason: `Processing error: ${claimError.message}`,
              updatedAt: new Date(),
            },
          },
        )

        await sendFailureEmail(claim, "technical_error", `Processing error: ${claimError.message}`)
        failureCount++
      }
    }

    console.log(`\n🎯 Automation completed:`)
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Failed: ${failureCount}`)
    console.log(`   📊 Total processed: ${successCount + failureCount}`)

    return NextResponse.json({
      success: true,
      message: "Automation process completed",
      processed: successCount + failureCount,
      successful: successCount,
      failed: failureCount,
    })
  } catch (error: any) {
    console.error("❌ Automation process failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Automation process failed",
      },
      { status: 500 },
    )
  }
}

// Helper function to send success email
async function sendSuccessEmail(claim: IClaimResponse, ottCode: string, platform: string) {
  try {
    const customerName = `${claim.firstName} ${claim.lastName}`

    await sendEmail(
      claim.email,
      `🎉 Your ${platform} OTT Code is Ready! - SYSTECH DIGITAL`,
      "ott_success",
      claim,
      {
        to: claim.email,
        subject: `🎉 Your ${platform} OTT Code is Ready! - SYSTECH DIGITAL`,
        template: "ott_success",
        data: {
          customerName,
          ottCode,
          platform,
          claimId: claim._id,
          activationCode: claim.activationCode,
          email: claim.email,
          phone: claim.phone,
        },
      },
      {
        template: "ott_success",
        data: {
          customerName,
          ottCode,
          platform,
          claimId: claim._id,
          activationCode: claim.activationCode,
          email: claim.email,
          phone: claim.phone,
        },
        to: "",
        subject: "",
      },
    )

    console.log(`📧 Success email sent to: ${claim.email}`)
  } catch (emailError) {
    console.error(`❌ Failed to send success email to ${claim.email}:`, emailError)
  }
}

// Helper function to send failure email
async function sendFailureEmail(claim: IClaimResponse, failureType: string, reason: string) {
  try {
    const customerName = `${claim.firstName} ${claim.lastName}`

    let subject = ""
    let template = ""

    switch (failureType) {
      case "invalid_code":
        subject = "⚠️ Issue with Your OTT Code Claim - SYSTECH DIGITAL"
        template = "ott_failure_invalid_code"
        break
      case "duplicate_claim":
        subject = "⚠️ Duplicate Claim Detected - SYSTECH DIGITAL"
        template = "ott_failure_duplicate"
        break
      case "no_keys":
        subject = "⏳ OTT Code Temporarily Unavailable - SYSTECH DIGITAL"
        template = "ott_failure_no_keys"
        break
      case "technical_error":
        subject = "🔧 Technical Issue with Your OTT Code Claim - SYSTECH DIGITAL"
        template = "ott_failure_technical"
        break
      default:
        subject = "⚠️ Issue with Your OTT Code Claim - SYSTECH DIGITAL"
        template = "ott_failure_generic"
    }

    await sendEmail(
      claim.email,
      subject,
      template,
      claim,
      {
        to: claim.email,
        subject: subject,
        template: template,
        data: {
          customerName,
          reason,
          claimId: claim._id,
          activationCode: claim.activationCode,
          email: claim.email,
          phone: claim.phone,
          supportEmail: "support@systechdigital.in",
          supportPhone: "+91-9876543210",
        },
      },
      {
        template: template,
        data: {
          customerName,
          reason,
          claimId: claim._id,
          activationCode: claim.activationCode,
          email: claim.email,
          phone: claim.phone,
          supportEmail: "support@systechdigital.in",
          supportPhone: "+91-9876543210",
        },
        to: "",
        subject: "",
      },
    )

    console.log(`📧 Failure email sent to: ${claim.email}`)
  } catch (emailError) {
    console.error(`❌ Failed to send failure email to ${claim.email}:`, emailError)
  }
}
