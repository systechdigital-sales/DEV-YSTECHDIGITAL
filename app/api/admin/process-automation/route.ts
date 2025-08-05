import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import ClaimResponse from "@/models/ClaimResponse"
import SalesRecord from "@/models/SalesRecord"
import OTTKey from "@/models/OTTKey"
import { sendEmail } from "@/lib/email"

// Normalize activation code for better matching
const normalizeActivationCode = (code: string): string => {
  return code.toString().trim().toUpperCase().replace(/\s+/g, "")
}

// Map product names to OTT platforms
const mapProductToOTTPlatform = (productName: string): string => {
  const product = productName.toLowerCase()

  // Platform mapping based on product names
  const platformMap: Record<string, string> = {
    ottplay: "OTTplay",
    "ott play": "OTTplay",
    "power play": "OTTplay",
    powerplay: "OTTplay",
    netflix: "Netflix",
    "amazon prime": "Amazon Prime",
    disney: "Disney+",
    hotstar: "Disney+ Hotstar",
    zee5: "ZEE5",
    sonyliv: "SonyLIV",
    voot: "Voot",
    altbalaji: "ALTBalaji",
    "mx player": "MX Player",
    jiocinema: "JioCinema",
    "eros now": "Eros Now",
  }

  for (const [key, platform] of Object.entries(platformMap)) {
    if (product.includes(key)) {
      return platform
    }
  }

  return "OTTplay" // Default platform
}

export async function POST(request: NextRequest) {
  try {
    console.log("🤖 Starting automation process...")

    await connectToDatabase()

    // Get all pending claims that haven't been processed
    const pendingClaims = await ClaimResponse.find({
      paymentStatus: "paid",
      ottKeyAssigned: { $ne: true },
      automationProcessed: { $ne: true },
    }).sort({ createdAt: 1 })

    console.log(`📋 Found ${pendingClaims.length} pending claims to process`)

    if (pendingClaims.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending claims to process",
        processed: 0,
      })
    }

    let processedCount = 0
    let successCount = 0
    let failureCount = 0

    for (const claim of pendingClaims) {
      try {
        console.log(`\n🔄 Processing claim: ${claim.claimId}`)
        console.log(`📱 Activation Code: "${claim.activationCode}"`)

        // Normalize the activation code for matching
        const normalizedSearchCode = normalizeActivationCode(claim.activationCode)
        console.log(`🔍 Normalized Search Code: "${normalizedSearchCode}"`)

        // Try multiple matching strategies
        let salesRecord = null
        let matchStrategy = ""

        // Strategy 1: Exact match
        salesRecord = await SalesRecord.findOne({
          activationCode: claim.activationCode,
          claimed: { $ne: true },
        })
        if (salesRecord) {
          matchStrategy = "exact"
          console.log(`✅ Found exact match: ${salesRecord.activationCode}`)
        }

        // Strategy 2: Case-insensitive match
        if (!salesRecord) {
          salesRecord = await SalesRecord.findOne({
            activationCode: { $regex: new RegExp(`^${claim.activationCode}$`, "i") },
            claimed: { $ne: true },
          })
          if (salesRecord) {
            matchStrategy = "case-insensitive"
            console.log(`✅ Found case-insensitive match: ${salesRecord.activationCode}`)
          }
        }

        // Strategy 3: Normalized match (remove spaces, uppercase)
        if (!salesRecord) {
          const allSalesRecords = await SalesRecord.find({ claimed: { $ne: true } })
          salesRecord = allSalesRecords.find(
            (record) => normalizeActivationCode(record.activationCode) === normalizedSearchCode,
          )
          if (salesRecord) {
            matchStrategy = "normalized"
            console.log(`✅ Found normalized match: ${salesRecord.activationCode} -> ${normalizedSearchCode}`)
          }
        }

        // Strategy 4: Partial match (contains)
        if (!salesRecord) {
          salesRecord = await SalesRecord.findOne({
            activationCode: { $regex: normalizedSearchCode, $options: "i" },
            claimed: { $ne: true },
          })
          if (salesRecord) {
            matchStrategy = "partial"
            console.log(`✅ Found partial match: ${salesRecord.activationCode}`)
          }
        }

        if (!salesRecord) {
          console.log(`❌ No sales record found for: "${claim.activationCode}"`)

          // Log some sample sales records for debugging
          const sampleRecords = await SalesRecord.find({ claimed: { $ne: true } }).limit(5)
          console.log("📊 Sample available activation codes:")
          sampleRecords.forEach((record, index) => {
            console.log(
              `  ${index + 1}. "${record.activationCode}" (normalized: "${normalizeActivationCode(record.activationCode)}")`,
            )
          })

          // Send failure email
          await sendEmail({
            to: claim.customerEmail,
            subject: "OTT Claim Processing - Invalid Activation Code",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #e53e3e; margin: 0; font-size: 24px;">⚠️ Activation Code Issue</h1>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="color: #2d3748; margin-top: 0;">Hello ${claim.customerName},</h2>
                  
                  <p style="color: #4a5568; line-height: 1.6;">
                    We encountered an issue while processing your OTT subscription claim. The activation code you provided could not be found in our sales records.
                  </p>
                  
                  <div style="background: #fed7d7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0; color: #742a2a;"><strong>Issue:</strong> Invalid activation code - not found in sales records</p>
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
            `,
          })

          // Mark as processed with failure
          await ClaimResponse.findByIdAndUpdate(claim._id, {
            automationProcessed: true,
            automationStatus: "failed",
            automationError: "Invalid activation code - not found in sales records",
            automationProcessedAt: new Date(),
            debugInfo: {
              searchCode: claim.activationCode,
              normalizedCode: normalizedSearchCode,
              sampleCodes: sampleRecords.map((r) => r.activationCode),
            },
          })

          failureCount++
          processedCount++
          continue
        }

        // Check if this activation code has already been claimed
        const existingClaim = await ClaimResponse.findOne({
          activationCode: salesRecord.activationCode,
          ottKeyAssigned: true,
          _id: { $ne: claim._id },
        })

        if (existingClaim) {
          console.log(`❌ Activation code already claimed: ${salesRecord.activationCode}`)

          // Send duplicate claim email
          await sendEmail({
            to: claim.customerEmail,
            subject: "OTT Claim Processing - Code Already Used",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #e53e3e; margin: 0; font-size: 24px;">🚫 Duplicate Claim Detected</h1>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="color: #2d3748; margin-top: 0;">Hello ${claim.customerName},</h2>
                  
                  <p style="color: #4a5568; line-height: 1.6;">
                    The activation code you provided has already been used for another OTT subscription claim.
                  </p>
                  
                  <div style="background: #fed7d7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0; color: #742a2a;"><strong>Issue:</strong> Activation code already claimed</p>
                    <p style="margin: 5px 0 0 0; color: #742a2a;"><strong>Code:</strong> ${salesRecord.activationCode}</p>
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
            `,
          })

          // Mark as processed with failure
          await ClaimResponse.findByIdAndUpdate(claim._id, {
            automationProcessed: true,
            automationStatus: "failed",
            automationError: "Activation code already claimed",
            automationProcessedAt: new Date(),
          })

          failureCount++
          processedCount++
          continue
        }

        // Determine the OTT platform based on product name
        const ottPlatform = mapProductToOTTPlatform(salesRecord.productName || "OTTplay")
        console.log(`🎯 Mapped to platform: ${ottPlatform}`)

        // Find an available OTT key for this platform
        const availableKey = await OTTKey.findOne({
          platform: ottPlatform,
          assigned: { $ne: true },
        })

        if (!availableKey) {
          console.log(`❌ No available keys for platform: ${ottPlatform}`)

          // Send no keys available email
          await sendEmail({
            to: claim.customerEmail,
            subject: "OTT Claim Processing - Keys Temporarily Unavailable",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #d97706; margin: 0; font-size: 24px;">⏳ Processing Delay</h1>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="color: #2d3748; margin-top: 0;">Hello ${claim.customerName},</h2>
                  
                  <p style="color: #4a5568; line-height: 1.6;">
                    Your OTT subscription claim has been validated successfully, but we're temporarily out of ${ottPlatform} activation keys.
                  </p>
                  
                  <div style="background: #fed7aa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e;"><strong>Status:</strong> Waiting for key availability</p>
                    <p style="margin: 5px 0 0 0; color: #92400e;"><strong>Platform:</strong> ${ottPlatform}</p>
                  </div>
                  
                  <p style="color: #4a5568; line-height: 1.6;">
                    We're working to replenish our key inventory. You'll receive your activation code within 24-48 hours via email.
                  </p>
                  
                  <div style="background: #e6fffa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h4 style="color: #234e52; margin: 0 0 10px 0;">📋 Your Claim Details</h4>
                    <p style="margin: 0; color: #234e52;">
                      <strong>Claim ID:</strong> ${claim.claimId}<br>
                      <strong>Platform:</strong> ${ottPlatform}<br>
                      <strong>Status:</strong> Pending Key Assignment
                    </p>
                  </div>
                </div>
                
                <div style="text-align: center; color: #718096; font-size: 12px;">
                  <p>This is an automated message from SYSTECH DIGITAL</p>
                </div>
              </div>
            `,
          })

          // Mark as processed but pending key assignment
          await ClaimResponse.findByIdAndUpdate(claim._id, {
            automationProcessed: true,
            automationStatus: "pending_keys",
            automationError: `No available keys for platform: ${ottPlatform}`,
            automationProcessedAt: new Date(),
            ottPlatform: ottPlatform,
          })

          failureCount++
          processedCount++
          continue
        }

        console.log(`🔑 Found available key: ${availableKey.ottCode} for ${ottPlatform}`)

        // Assign the key to the claim
        await Promise.all([
          // Mark the OTT key as assigned
          OTTKey.findByIdAndUpdate(availableKey._id, {
            assigned: true,
            assignedTo: claim.customerEmail,
            assignedAt: new Date(),
            claimId: claim.claimId,
          }),

          // Mark the sales record as claimed
          SalesRecord.findByIdAndUpdate(salesRecord._id, {
            claimed: true,
            claimedAt: new Date(),
            claimedBy: claim.customerEmail,
            claimId: claim.claimId,
          }),

          // Update the claim response
          ClaimResponse.findByIdAndUpdate(claim._id, {
            ottKeyAssigned: true,
            ottCode: availableKey.ottCode,
            ottPlatform: ottPlatform,
            automationProcessed: true,
            automationStatus: "success",
            automationProcessedAt: new Date(),
            matchStrategy: matchStrategy,
          }),
        ])

        // Send success email with OTT code
        await sendEmail({
          to: claim.customerEmail,
          subject: "🎉 Your OTT Activation Code is Ready!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0fff4; border: 1px solid #9ae6b4; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #38a169; margin: 0; font-size: 28px;">🎉 Success!</h1>
                <p style="color: #2f855a; font-size: 18px; margin: 10px 0 0 0;">Your OTT Code is Ready</p>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #2d3748; margin-top: 0;">Hello ${claim.customerName},</h2>
                
                <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
                  Great news! Your OTT subscription claim has been processed successfully. Here's your activation code:
                </p>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center;">
                  <p style="color: white; margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your ${ottPlatform} Activation Code</p>
                  <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; border: 2px dashed rgba(255,255,255,0.5);">
                    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                      ${availableKey.ottCode}
                    </h1>
                  </div>
                </div>
                
                <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                  <h3 style="color: #234e52; margin: 0 0 15px 0;">📱 How to Redeem:</h3>
                  <ol style="color: #234e52; line-height: 1.8; margin: 0; padding-left: 20px;">
                    <li>Download the ${ottPlatform} app from your app store</li>
                    <li>Create an account or log in to your existing account</li>
                    <li>Go to "Redeem Code" or "Activate Subscription" section</li>
                    <li>Enter the activation code: <strong>${availableKey.ottCode}</strong></li>
                    <li>Enjoy your premium subscription!</li>
                  </ol>
                </div>
                
                <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                  <h4 style="color: #2d3748; margin: 0 0 15px 0;">📋 Order Summary</h4>
                  <table style="width: 100%; color: #4a5568;">
                    <tr><td><strong>Claim ID:</strong></td><td>${claim.claimId}</td></tr>
                    <tr><td><strong>Platform:</strong></td><td>${ottPlatform}</td></tr>
                    <tr><td><strong>Activation Code:</strong></td><td style="font-family: monospace;">${availableKey.ottCode}</td></tr>
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

        console.log(`✅ Successfully processed claim: ${claim.claimId}`)
        successCount++
        processedCount++
      } catch (claimError) {
        console.error(`❌ Error processing claim ${claim.claimId}:`, claimError)

        // Send technical error email
        await sendEmail({
          to: claim.customerEmail,
          subject: "OTT Claim Processing - Technical Issue",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #e53e3e; margin: 0; font-size: 24px;">🔧 Technical Issue</h1>
              </div>
              
              <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #2d3748; margin-top: 0;">Hello ${claim.customerName},</h2>
                
                <p style="color: #4a5568; line-height: 1.6;">
                  We encountered a technical issue while processing your OTT subscription claim. Our technical team has been notified and is working to resolve this immediately.
                </p>
                
                <div style="background: #fed7d7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 0; color: #742a2a;"><strong>Status:</strong> Technical processing error</p>
                  <p style="margin: 5px 0 0 0; color: #742a2a;"><strong>Claim ID:</strong> ${claim.claimId}</p>
                </div>
                
                <p style="color: #4a5568; line-height: 1.6;">
                  We'll retry processing your claim automatically. If the issue persists, our support team will contact you directly within 24 hours.
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
          `,
        })

        // Mark as processed with error
        await ClaimResponse.findByIdAndUpdate(claim._id, {
          automationProcessed: true,
          automationStatus: "error",
          automationError: claimError instanceof Error ? claimError.message : "Unknown error",
          automationProcessedAt: new Date(),
        })

        failureCount++
        processedCount++
      }
    }

    console.log(`\n🎯 Automation Summary:`)
    console.log(`   Total Processed: ${processedCount}`)
    console.log(`   Successful: ${successCount}`)
    console.log(`   Failed: ${failureCount}`)

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} claims`,
      summary: {
        total: processedCount,
        successful: successCount,
        failed: failureCount,
      },
    })
  } catch (error) {
    console.error("❌ Automation process error:", error)
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
