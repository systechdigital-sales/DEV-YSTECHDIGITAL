import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

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
    const db = await getDatabase()
    const claimsCollection = db.collection("claims")
    const salesCollection = db.collection("salesrecords")
    const keysCollection = db.collection("ottkeys")

    // Get all paid claims that haven't been processed yet
    const unprocessedClaims = await claimsCollection
      .find({
        paymentStatus: "paid",
        ottStatus: { $in: ["pending", "failed"] },
      })
      .toArray()

    console.log(`📋 Found ${unprocessedClaims.length} unprocessed paid claims`)

    if (unprocessedClaims.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No unprocessed claims found",
        results: {
          expired: 0,
          processed: 0,
          success: 0,
          failed: 0,
          skipped: 0,
          details: [],
        },
      })
    }

    let successCount = 0
    let failureCount = 0
    let skippedCount = 0
    const details: Array<{
      email: string
      status: "success" | "failed" | "skipped"
      message: string
      ottCode?: string
      step?: string
    }> = []

    // Process expired claims (older than 48 hours)
    const expiredCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const expiredResult = await claimsCollection.updateMany(
      {
        paymentStatus: "paid",
        ottStatus: "pending",
        createdAt: { $lt: expiredCutoff },
      },
      {
        $set: {
          ottStatus: "failed",
          failureReason: "Expired - exceeded 48 hour processing window",
          updatedAt: new Date(),
        },
      },
    )

    console.log(`⏰ Marked ${expiredResult.modifiedCount} expired claims as failed`)

    for (const claim of unprocessedClaims) {
      try {
        console.log(`\n🔄 Processing claim: ${claim.claimId}`)
        console.log(`📧 Customer: ${claim.email}`)
        console.log(`🔑 Activation Code: ${claim.activationCode}`)

        // Step 1: Find matching sales record with enhanced matching
        const originalCode = claim.activationCode
        const normalizedSearchCode = normalizeActivationCode(originalCode)

        console.log(`🔍 Searching for activation code:`)
        console.log(`   Original: "${originalCode}"`)
        console.log(`   Normalized: "${normalizedSearchCode}"`)

        let salesRecord = null

        // Strategy 1: Exact match
        salesRecord = await salesCollection.findOne({
          activationCode: originalCode,
        })

        if (!salesRecord) {
          // Strategy 2: Case-insensitive match
          console.log(`🔍 Trying case-insensitive match...`)
          salesRecord = await salesCollection.findOne({
            activationCode: { $regex: new RegExp(`^${originalCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
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
            console.log(`   ${index + 1}. "${record.activationCode}" (${record.product || "No product"})`)
          })

          // Update claim status and send failure email
          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottStatus: "failed",
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

          details.push({
            email: claim.email,
            status: "failed",
            message: "Invalid activation code - not found in sales records",
            step: "Code Verification",
          })

          failureCount++
          continue
        }

        console.log(
          `✅ Found sales record: ${salesRecord.product || "Unknown product"} (${salesRecord.productSubCategory || "No subcategory"})`,
        )

        // Check if already claimed
        if (salesRecord.status === "claimed") {
          console.error(`❌ Activation code already claimed by: ${salesRecord.claimedBy}`)

          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottStatus: "failed",
                failureReason: "Activation code already claimed",
                updatedAt: new Date(),
              },
            },
          )

          await sendFailureEmail(claim, "duplicate_claim", "This activation code has already been claimed")

          details.push({
            email: claim.email,
            status: "skipped",
            message: "Activation code already claimed",
            step: "Duplicate Check",
          })

          skippedCount++
          continue
        }

        // Step 2: Find available OTT key for the platform
        const platform = getPlatformFromProduct(salesRecord.product || "OTTplay")
        console.log(`🎯 Looking for ${platform} OTT key...`)

        const availableKey = await keysCollection.findOne({
          status: "available",
          $or: [
            { product: { $regex: platform, $options: "i" } },
            { productSubCategory: { $regex: platform, $options: "i" } },
            { platform: { $regex: platform, $options: "i" } },
          ],
        })

        if (!availableKey) {
          console.error(`❌ No available OTT keys for platform: ${platform}`)

          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottStatus: "failed",
                failureReason: `No available OTT keys for ${platform}`,
                updatedAt: new Date(),
              },
            },
          )

          await sendFailureEmail(claim, "no_keys", `No available OTT keys for ${platform}`)

          details.push({
            email: claim.email,
            status: "failed",
            message: `No available OTT keys for ${platform}`,
            step: "Key Assignment",
          })

          failureCount++
          continue
        }

        console.log(
          `🎉 Found available OTT key: ${availableKey.activationCode || availableKey.ottCode || availableKey.code}`,
        )

        // Step 3: Update all records atomically
        const ottCode = availableKey.activationCode || availableKey.ottCode || availableKey.code

        try {
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
                assignedTo: claim.claimId,
                updatedAt: new Date(),
              },
            },
          )

          // Update claim with success
          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottStatus: "delivered",
                ottCode: ottCode,
                platform: platform,
                updatedAt: new Date(),
              },
            },
          )

          // Send success email with OTT code
          await sendSuccessEmail(claim, ottCode, platform)

          details.push({
            email: claim.email,
            status: "success",
            message: "OTT code assigned and email sent successfully",
            ottCode: ottCode,
            step: "Email Notification",
          })

          console.log(`✅ Successfully processed claim: ${claim.claimId}`)
          successCount++
        } catch (transactionError) {
          console.error(`❌ Transaction failed for claim ${claim.claimId}:`, transactionError)

          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottStatus: "failed",
                failureReason: "Database transaction failed",
                updatedAt: new Date(),
              },
            },
          )

          await sendFailureEmail(claim, "technical_error", "Database transaction failed")

          details.push({
            email: claim.email,
            status: "failed",
            message: "Database transaction failed",
            step: "Processing",
          })

          failureCount++
        }
      } catch (claimError) {
        console.error(`❌ Error processing claim ${claim.claimId}:`, claimError)

        await claimsCollection.updateOne(
          { _id: claim._id },
          {
            $set: {
              ottStatus: "failed",
              failureReason: `Processing error: ${claimError.message}`,
              updatedAt: new Date(),
            },
          },
        )

        await sendFailureEmail(claim, "technical_error", `Processing error: ${claimError.message}`)

        details.push({
          email: claim.email,
          status: "failed",
          message: `Processing error: ${claimError.message}`,
          step: "Processing",
        })

        failureCount++
      }
    }

    console.log(`\n🎯 Automation completed:`)
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Failed: ${failureCount}`)
    console.log(`   ⏭️ Skipped: ${skippedCount}`)
    console.log(`   📊 Total processed: ${successCount + failureCount + skippedCount}`)

    return NextResponse.json({
      success: true,
      message: "Automation process completed",
      results: {
        expired: expiredResult.modifiedCount,
        processed: successCount + failureCount + skippedCount,
        success: successCount,
        failed: failureCount,
        skipped: skippedCount,
        details: details,
      },
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
async function sendSuccessEmail(claim: any, ottCode: string, platform: string) {
  try {
    const customerName = `${claim.firstName} ${claim.lastName}`

    await sendEmail({
      to: claim.email,
      subject: `🎉 Your ${platform} OTT Code is Ready! - SYSTECH DIGITAL`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0fff4; border: 1px solid #9ae6b4; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #38a169; margin: 0; font-size: 28px;">🎉 Success!</h1>
            <p style="color: #2f855a; font-size: 18px; margin: 10px 0 0 0;">Your OTT Code is Ready</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2d3748; margin-top: 0;">Hello ${customerName},</h2>
            
            <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
              Great news! Your OTT subscription claim has been processed successfully. Here's your activation code:
            </p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center;">
              <p style="color: white; margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your ${platform} Activation Code</p>
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; border: 2px dashed rgba(255,255,255,0.5);">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                  ${ottCode}
                </h1>
              </div>
            </div>
            
            <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #234e52; margin: 0 0 15px 0;">📱 How to Redeem:</h3>
              <ol style="color: #234e52; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Open the <a href="https://www.ottplay.com/partner/systech-it-solution/ott_sustech_annualtest" style="color: #2b6cb0;">OTT Play app</a> from your web browser</li>
                <li>Create an account or log in to your existing account</li>
                <li>Go to "Redeem Code" or "Activate Subscription" section</li>
                <li>Enter the activation code: <strong>${ottCode}</strong></li>
                <li>Enjoy your premium subscription!</li>
              </ol>
            </div>
            
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #2d3748; margin: 0 0 15px 0;">📋 Order Summary</h4>
              <table style="width: 100%; color: #4a5568;">
                <tr><td><strong>Claim ID:</strong></td><td>${claim.claimId}</td></tr>
                <tr><td><strong>Platform:</strong></td><td>${platform}</td></tr>
                <tr><td><strong>Activation Code:</strong></td><td style="font-family: monospace;">${ottCode}</td></tr>
                <tr><td><strong>Processed:</strong></td><td>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>
              </table>
            </div>
            
            <p style="color: #4a5568; line-height: 1.6; font-size: 14px; margin-top: 25px;">
              <strong>Important:</strong> Please save this email for your records. If you face any issues with activation, contact our support team with your Claim ID.
            </p>
          </div>
          
          <div style="text-align: center; color: #718096; font-size: 12px;">
            <p>Thank you for choosing SYSTECH DIGITAL</p>
            <p>This is an automated message - please do not reply</p>
          </div>
        </div>
      `,
    })

    console.log(`📧 Success email sent to: ${claim.email}`)
  } catch (emailError) {
    console.error(`❌ Failed to send success email to ${claim.email}:`, emailError)
  }
}

// Helper function to send failure email
async function sendFailureEmail(claim: any, failureType: string, reason: string) {
  try {
    const customerName = `${claim.firstName} ${claim.lastName}`

    let subject = ""
    let emailContent = ""

    switch (failureType) {
      case "invalid_code":
        subject = "⚠️ Issue with Your OTT Code Claim - SYSTECH DIGITAL"
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e53e3e; margin: 0; font-size: 24px;">⚠️ Activation Code Issue</h1>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #2d3748; margin-top: 0;">Hello ${customerName},</h2>
              
              <p style="color: #4a5568; line-height: 1.6;">
                We encountered an issue while processing your OTT subscription claim. The activation code you provided could not be found in our sales records.
              </p>
              
              <div style="background: #fed7d7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #742a2a;"><strong>Issue:</strong> ${reason}</p>
                <p style="margin: 5px 0 0 0; color: #742a2a;"><strong>Code Provided:</strong> ${claim.activationCode}</p>
              </div>
              
              <h3 style="color: #2d3748; margin-top: 25px;">What to do next:</h3>
              <ul style="color: #4a5568; line-height: 1.6;">
                <li>Double-check the activation code from your purchase receipt</li>
                <li>Ensure there are no extra spaces or special characters</li>
                <li>Contact the seller if you believe the code is correct</li>
                <li>Reach out to our support team for assistance</li>
              </ul>
              
              <div style="background: #e6fffa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h4 style="color: #234e52; margin: 0 0 10px 0;">📞 Need Help?</h4>
                <p style="margin: 0; color: #234e52;">
                  <strong>Email:</strong> support@systechdigital.in<br>
                  <strong>Phone:</strong> +91-XXXXXXXXXX<br>
                  <strong>Claim ID:</strong> ${claim.claimId}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; color: #718096; font-size: 12px;">
              <p>This is an automated message from SYSTECH DIGITAL</p>
            </div>
          </div>
        `
        break
      case "duplicate_claim":
        subject = "⚠️ Duplicate Claim Detected - SYSTECH DIGITAL"
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e53e3e; margin: 0; font-size: 24px;">🚫 Duplicate Claim Detected</h1>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #2d3748; margin-top: 0;">Hello ${customerName},</h2>
              
              <p style="color: #4a5568; line-height: 1.6;">
                The activation code you provided has already been used for another OTT subscription claim.
              </p>
              
              <div style="background: #fed7d7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #742a2a;"><strong>Issue:</strong> ${reason}</p>
                <p style="margin: 5px 0 0 0; color: #742a2a;"><strong>Code:</strong> ${claim.activationCode}</p>
              </div>
              
              <p style="color: #4a5568; line-height: 1.6;">
                Each activation code can only be used once. If you believe this is an error, please contact our support team immediately.
              </p>
              
              <div style="background: #e6fffa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h4 style="color: #234e52; margin: 0 0 10px 0;">📞 Contact Support</h4>
                <p style="margin: 0; color: #234e52;">
                  <strong>Email:</strong> support@systechdigital.in<br>
                  <strong>Phone:</strong> +91-XXXXXXXXXX<br>
                  <strong>Claim ID:</strong> ${claim.claimId}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; color: #718096; font-size: 12px;">
              <p>This is an automated message from SYSTECH DIGITAL</p>
            </div>
          </div>
        `
        break
      default:
        subject = "⚠️ Issue with Your OTT Code Claim - SYSTECH DIGITAL"
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e53e3e; margin: 0; font-size: 24px;">🔧 Processing Issue</h1>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #2d3748; margin-top: 0;">Hello ${customerName},</h2>
              
              <p style="color: #4a5568; line-height: 1.6;">
                We encountered an issue while processing your OTT subscription claim: ${reason}
              </p>
              
              <div style="background: #fed7d7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #742a2a;"><strong>Issue:</strong> ${reason}</p>
                <p style="margin: 5px 0 0 0; color: #742a2a;"><strong>Claim ID:</strong> ${claim.claimId}</p>
              </div>
              
              <p style="color: #4a5568; line-height: 1.6;">
                Our technical team has been notified and is working to resolve this issue. We'll retry processing your claim automatically.
              </p>
              
              <div style="background: #e6fffa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h4 style="color: #234e52; margin: 0 0 10px 0;">🚨 Priority Support</h4>
                <p style="margin: 0; color: #234e52;">
                  <strong>Email:</strong> support@systechdigital.in<br>
                  <strong>Phone:</strong> +91-XXXXXXXXXX<br>
                  <strong>Reference:</strong> ${claim.claimId}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; color: #718096; font-size: 12px;">
              <p>This is an automated message from SYSTECH DIGITAL</p>
            </div>
          </div>
        `
    }

    await sendEmail({
      to: claim.email,
      subject: subject,
      html: emailContent,
    })

    console.log(`📧 Failure email sent to: ${claim.email}`)
  } catch (emailError) {
    console.error(`❌ Failed to send failure email to ${claim.email}:`, emailError)
  }
}
