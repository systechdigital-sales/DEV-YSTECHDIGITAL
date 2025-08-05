import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

export async function POST() {
  try {
    console.log("🚀 Starting OTT Key Assignment Automation Process...")
    const startTime = new Date()

    const db = await getDatabase()
    const claimsCollection = db.collection("claims")
    const salesCollection = db.collection("salesrecords")
    const ottKeysCollection = db.collection("ottkeys")
    const settingsCollection = db.collection("automationsettings")

    let expiredCount = 0
    let processedCount = 0
    let successCount = 0
    let failedCount = 0
    let skippedCount = 0
    const details: Array<{
      email: string
      status: "success" | "failed" | "skipped"
      message: string
      ottCode?: string
      step?: string
      activationCode?: string
      debugInfo?: any
    }> = []

    // Helper function to normalize activation codes for comparison
    const normalizeActivationCode = (code: string): string => {
      if (!code) return ""
      return code.toString().trim().toUpperCase().replace(/\s+/g, "")
    }

    // Step 1: Handle expired claims (older than 48 hours)
    console.log("⏰ Step 1: Processing expired claims...")
    const expiredCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours ago

    const expiredResult = await claimsCollection.updateMany(
      {
        paymentStatus: "paid",
        ottCodeStatus: "pending",
        createdAt: { $lt: expiredCutoff },
      },
      {
        $set: {
          paymentStatus: "failed",
          ottCodeStatus: "failed",
          updatedAt: new Date(),
          failureReason: "Expired - exceeded 48 hour processing window",
        },
      },
    )

    expiredCount = expiredResult.modifiedCount
    console.log(`📊 Marked ${expiredCount} expired claims as failed`)

    // Step 2: Get paid claims with pending OTT status
    console.log("💰 Step 2: Fetching paid claims with pending OTT status...")
    const pendingClaims = await claimsCollection
      .find({
        paymentStatus: "paid",
        ottCodeStatus: "pending",
      })
      .toArray()

    console.log(`🔍 Found ${pendingClaims.length} pending claims to process`)
    processedCount = pendingClaims.length

    for (const claim of pendingClaims) {
      try {
        const claimActivationCode = claim.activationCode
        const normalizedClaimCode = normalizeActivationCode(claimActivationCode)

        console.log(`🔄 Processing claim for ${claim.email}`)
        console.log(`📋 Original activation code: "${claimActivationCode}"`)
        console.log(`🔧 Normalized activation code: "${normalizedClaimCode}"`)

        // Step 3: Enhanced activation code verification with multiple matching strategies
        let salesRecord = null
        let matchStrategy = ""

        // Strategy 1: Exact match (original)
        salesRecord = await salesCollection.findOne({
          activationCode: claimActivationCode,
        })
        if (salesRecord) {
          matchStrategy = "exact_match"
          console.log(`✅ Found sales record using exact match`)
        }

        // Strategy 2: Case-insensitive match
        if (!salesRecord) {
          salesRecord = await salesCollection.findOne({
            activationCode: {
              $regex: new RegExp(`^${claimActivationCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
            },
          })
          if (salesRecord) {
            matchStrategy = "case_insensitive"
            console.log(`✅ Found sales record using case-insensitive match`)
          }
        }

        // Strategy 3: Normalized comparison (remove spaces, case insensitive)
        if (!salesRecord) {
          const allSalesRecords = await salesCollection.find({}).toArray()
          salesRecord = allSalesRecords.find((record) => {
            const normalizedSalesCode = normalizeActivationCode(record.activationCode)
            return normalizedSalesCode === normalizedClaimCode
          })
          if (salesRecord) {
            matchStrategy = "normalized_match"
            console.log(`✅ Found sales record using normalized match`)
            console.log(`📋 Sales record activation code: "${salesRecord.activationCode}"`)
            console.log(`🔧 Normalized sales code: "${normalizeActivationCode(salesRecord.activationCode)}"`)
          }
        }

        // Strategy 4: Partial match (in case of extra characters)
        if (!salesRecord) {
          salesRecord = await salesCollection.findOne({
            activationCode: { $regex: normalizedClaimCode, $options: "i" },
          })
          if (salesRecord) {
            matchStrategy = "partial_match"
            console.log(`✅ Found sales record using partial match`)
          }
        }

        if (!salesRecord) {
          console.log(`❌ Activation code ${claimActivationCode} not found in sales records after all strategies`)

          // Get some sample sales records for debugging
          const sampleSalesRecords = await salesCollection.find({}).limit(5).toArray()
          const debugInfo = {
            claimCode: claimActivationCode,
            normalizedClaimCode: normalizedClaimCode,
            sampleSalesRecords: sampleSalesRecords.map((record) => ({
              activationCode: record.activationCode,
              normalized: normalizeActivationCode(record.activationCode),
            })),
            totalSalesRecords: await salesCollection.countDocuments(),
          }

          console.log(`🔍 Debug info:`, JSON.stringify(debugInfo, null, 2))

          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "failed",
                updatedAt: new Date(),
                failureReason: "Invalid activation code - not found in sales records",
                debugInfo: debugInfo,
              },
            },
          )

          // Send failure email with debug information
          try {
            const customerName = `${claim.firstName || ""} ${claim.lastName || ""}`.trim()
            const emailSubject = "OTT Code Processing Update - Action Required - SYSTECH DIGITAL"
            const emailBody = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">⚠️ OTT Code Processing Issue</h1>
                </div>
                
                <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
                  <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${customerName || "Customer"},</p>
                  
                  <p style="color: #374151; line-height: 1.6;">We encountered an issue while processing your OTT code request. The activation code provided could not be verified in our sales records.</p>
                  
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Issue Details:</h3>
                    <p style="color: #92400e; margin: 0;"><strong>Reason:</strong> Invalid activation code - not found in sales records</p>
                    <p style="color: #92400e; margin: 5px 0 0 0;"><strong>Activation Code:</strong> ${claimActivationCode}</p>
                    <p style="color: #92400e; margin: 5px 0 0 0;"><strong>Status:</strong> Under Review</p>
                  </div>
                  
                  <h3 style="color: #1f2937; margin: 25px 0 15px 0;">Next Steps:</h3>
                  <ol style="color: #374151; line-height: 1.6; padding-left: 20px;">
                    <li>Please verify that your activation code is correct</li>
                    <li>Check your purchase receipt or invoice for the exact code</li>
                    <li>Contact our support team if you need assistance</li>
                  </ol>
                  
                  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">📞 Support Information:</h3>
                    <p style="color: #374151; margin: 5px 0;"><strong>Email:</strong> support@systechdigital.com</p>
                    <p style="color: #374151; margin: 5px 0;"><strong>Phone:</strong> +91-XXXXXXXXXX</p>
                    <p style="color: #374151; margin: 5px 0;"><strong>Business Hours:</strong> 9:00 AM - 6:00 PM (Mon-Fri)</p>
                  </div>
                  
                  <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #1e40af; margin: 0; font-size: 14px;">
                      <strong>Reference ID:</strong> ${claim._id}<br>
                      <strong>Date:</strong> ${new Date().toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    This is an automated email from SYSTECH DIGITAL. Please do not reply to this email directly. For support, use the contact information provided above.
                  </p>
                </div>
              </div>
            `

            await sendEmail(claim.email, emailSubject, emailBody)
            console.log(`📧 Failure notification email sent to ${claim.email}`)
          } catch (emailError) {
            console.error(`Failed to send failure email to ${claim.email}:`, emailError)
          }

          details.push({
            email: claim.email,
            status: "skipped",
            message: "Invalid activation code - not found in sales records",
            step: "Verification",
            activationCode: claimActivationCode,
            debugInfo: debugInfo,
          })
          skippedCount++
          continue
        }

        console.log(`✅ Found sales record using ${matchStrategy} strategy`)
        console.log(`📋 Sales record details:`, {
          activationCode: salesRecord.activationCode,
          product: salesRecord.product,
          productSubCategory: salesRecord.productSubCategory,
        })

        // Step 4: Check for duplicate claims on same activation code
        const duplicateClaim = await claimsCollection.findOne({
          activationCode: claimActivationCode,
          ottCodeStatus: "delivered",
          _id: { $ne: claim._id },
        })

        if (duplicateClaim) {
          console.log(`⚠️ Duplicate claim detected for activation code: ${claimActivationCode}`)
          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "failed",
                updatedAt: new Date(),
                failureReason: "Duplicate claim - activation code already used",
              },
            },
          )

          // Send failure email for duplicate
          try {
            const customerName = `${claim.firstName || ""} ${claim.lastName || ""}`.trim()
            const emailSubject = "OTT Code Processing Update - Duplicate Claim - SYSTECH DIGITAL"
            const emailBody = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">⚠️ Duplicate Claim Detected</h1>
                </div>
                
                <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
                  <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${customerName || "Customer"},</p>
                  
                  <p style="color: #374151; line-height: 1.6;">We found that the activation code you provided has already been used for another OTT code claim.</p>
                  
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Issue Details:</h3>
                    <p style="color: #92400e; margin: 0;"><strong>Reason:</strong> Duplicate claim - activation code already used</p>
                    <p style="color: #92400e; margin: 5px 0 0 0;"><strong>Activation Code:</strong> ${claimActivationCode}</p>
                    <p style="color: #92400e; margin: 5px 0 0 0;"><strong>Status:</strong> Failed</p>
                  </div>
                  
                  <p style="color: #374151; line-height: 1.6;">Each activation code can only be used once. If you believe this is an error, please contact our support team with your purchase details.</p>
                  
                  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">📞 Support Information:</h3>
                    <p style="color: #374151; margin: 5px 0;"><strong>Email:</strong> support@systechdigital.com</p>
                    <p style="color: #374151; margin: 5px 0;"><strong>Phone:</strong> +91-XXXXXXXXXX</p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    This is an automated email from SYSTECH DIGITAL.
                  </p>
                </div>
              </div>
            `

            await sendEmail(claim.email, emailSubject, emailBody)
          } catch (emailError) {
            console.error(`Failed to send duplicate failure email to ${claim.email}:`, emailError)
          }

          details.push({
            email: claim.email,
            status: "skipped",
            message: "Duplicate claim - activation code already used",
            step: "Duplicate Check",
            activationCode: claimActivationCode,
          })
          skippedCount++
          continue
        }

        // Step 5: Find and assign available OTT key based on sales record product info
        const platformMapping: { [key: string]: string } = {
          "sony liv": "Sony LIV",
          zee5: "Zee5",
          lionsgate: "Lionsgate Play",
          fancode: "Fancode",
          "sun nxt": "Sun NXT",
          aha: "Aha",
          shemaroo: "Shemaroo Me",
          "distro tv": "Distro TV",
          stage: "Stage",
          "shorts tv": "Shorts TV",
        }

        // Determine platform from sales record
        const productLower = salesRecord.product?.toLowerCase() || ""
        const subCategoryLower = salesRecord.productSubCategory?.toLowerCase() || ""

        let targetPlatform = claim.platform // Default to claim platform

        // Try to match platform from product or subcategory
        for (const [key, value] of Object.entries(platformMapping)) {
          if (productLower.includes(key) || subCategoryLower.includes(key)) {
            targetPlatform = value
            break
          }
        }

        console.log(`🎯 Target platform determined: ${targetPlatform} (from product: ${salesRecord.product})`)

        const availableKey = await ottKeysCollection.findOne({
          product: targetPlatform,
          status: "available",
        })

        if (!availableKey) {
          console.log(`❌ No available OTT keys for platform: ${targetPlatform}`)
          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "failed",
                updatedAt: new Date(),
                failureReason: `No available OTT keys for platform: ${targetPlatform}`,
              },
            },
          )

          // Send failure email for no keys
          try {
            const customerName = `${claim.firstName || ""} ${claim.lastName || ""}`.trim()
            const emailSubject = "OTT Code Processing Update - No Available Keys - SYSTECH DIGITAL"
            const emailBody = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">⚠️ OTT Keys Temporarily Unavailable</h1>
                </div>
                
                <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
                  <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${customerName || "Customer"},</p>
                  
                  <p style="color: #374151; line-height: 1.6;">We're currently out of available OTT keys for your requested platform. Our team is working to replenish the inventory.</p>
                  
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Status Update:</h3>
                    <p style="color: #92400e; margin: 0;"><strong>Platform:</strong> ${targetPlatform}</p>
                    <p style="color: #92400e; margin: 5px 0 0 0;"><strong>Status:</strong> Keys being restocked</p>
                    <p style="color: #92400e; margin: 5px 0 0 0;"><strong>Expected Resolution:</strong> 24-48 hours</p>
                  </div>
                  
                  <p style="color: #374151; line-height: 1.6;">Your claim will be automatically processed once new keys are available. No further action is required from your side.</p>
                  
                  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">📞 Support Information:</h3>
                    <p style="color: #374151; margin: 5px 0;"><strong>Email:</strong> support@systechdigital.com</p>
                    <p style="color: #374151; margin: 5px 0;"><strong>Phone:</strong> +91-XXXXXXXXXX</p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    This is an automated email from SYSTECH DIGITAL.
                  </p>
                </div>
              </div>
            `

            await sendEmail(claim.email, emailSubject, emailBody)
          } catch (emailError) {
            console.error(`Failed to send no-keys failure email to ${claim.email}:`, emailError)
          }

          details.push({
            email: claim.email,
            status: "failed",
            message: `No available OTT keys for platform: ${targetPlatform}`,
            step: "Key Assignment",
            activationCode: claimActivationCode,
          })
          failedCount++
          continue
        }

        // Update OTT key status to assigned
        await ottKeysCollection.updateOne(
          { _id: availableKey._id },
          {
            $set: {
              status: "assigned",
              assignedEmail: claim.email,
              assignedDate: new Date(),
              assignedTo: claim._id,
            },
          },
        )

        // Update claim with OTT code
        await claimsCollection.updateOne(
          { _id: claim._id },
          {
            $set: {
              ottCode: availableKey.activationCode,
              ottCodeStatus: "delivered",
              updatedAt: new Date(),
              deliveredAt: new Date(),
              matchStrategy: matchStrategy,
            },
          },
        )

        // Step 6: Send success email notification
        try {
          const customerName = `${claim.firstName || ""} ${claim.lastName || ""}`.trim()
          const emailSubject = `Your ${targetPlatform} OTT Code - SYSTECH DIGITAL`
          const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🎉 Your OTT Code is Ready!</h1>
              </div>
              
              <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${customerName || "Customer"},</p>
                
                <p style="color: #374151; line-height: 1.6;">Great news! Your OTT code for <strong>${targetPlatform}</strong> has been successfully processed and is ready to use.</p>
                
                <div style="background: #f0fdf4; border: 2px solid #10b981; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
                  <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">🎯 Your OTT Code</h3>
                  <div style="background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #d1fae5;">
                    <p style="font-size: 28px; font-weight: bold; color: #dc2626; letter-spacing: 3px; font-family: 'Courier New', monospace; margin: 0;">
                      ${availableKey.activationCode}
                    </p>
                  </div>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">📋 Order Details:</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Platform:</td>
                      <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${targetPlatform}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Activation Code:</td>
                      <td style="padding: 8px 0; color: #1f2937; font-family: monospace;">${claimActivationCode}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Processed At:</td>
                      <td style="padding: 8px 0; color: #1f2937;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Reference ID:</td>
                      <td style="padding: 8px 0; color: #1f2937; font-family: monospace;">${claim._id}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">📱 How to Use Your Code:</h3>
                  <ol style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.6;">
                    <li>Open the ${targetPlatform} app or website</li>
                    <li>Go to the subscription or redeem section</li>
                    <li>Enter the OTT code provided above</li>
                    <li>Enjoy your premium content!</li>
                  </ol>
                </div>
                
                <p style="color: #374151; line-height: 1.6; margin: 20px 0;">Please keep this email safe for your records. If you encounter any issues while redeeming your code, feel free to contact our support team.</p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">📞 Support Information:</h3>
                  <p style="color: #374151; margin: 5px 0;"><strong>Email:</strong> support@systechdigital.com</p>
                  <p style="color: #374151; margin: 5px 0;"><strong>Phone:</strong> +91-XXXXXXXXXX</p>
                  <p style="color: #374151; margin: 5px 0;"><strong>Business Hours:</strong> 9:00 AM - 6:00 PM (Mon-Fri)</p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                  Thank you for choosing SYSTECH DIGITAL!<br>
                  This is an automated email. Please do not reply to this email directly.
                </p>
              </div>
            </div>
          `

          await sendEmail(claim.email, emailSubject, emailBody)
          console.log(`📧 Success email sent to ${claim.email}`)

          details.push({
            email: claim.email,
            status: "success",
            message: "OTT code assigned and email sent successfully",
            ottCode: availableKey.activationCode,
            step: "Email Notification",
            activationCode: claimActivationCode,
          })
          successCount++
        } catch (emailError) {
          console.error(`📧 Failed to send success email to ${claim.email}:`, emailError)

          // Mark as failed due to email issue but keep the key assigned
          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "delivered", // Keep as delivered since key was assigned
                emailStatus: "failed",
                updatedAt: new Date(),
                emailFailureReason: "Failed to send email notification",
              },
            },
          )

          details.push({
            email: claim.email,
            status: "success", // Still success since key was assigned
            message: "OTT code assigned but email notification failed",
            ottCode: availableKey.activationCode,
            step: "Email Notification",
            activationCode: claimActivationCode,
          })
          successCount++
        }
      } catch (claimError) {
        console.error(`❌ Error processing claim for ${claim.email}:`, claimError)

        await claimsCollection.updateOne(
          { _id: claim._id },
          {
            $set: {
              ottCodeStatus: "failed",
              updatedAt: new Date(),
              failureReason: `Processing error: ${claimError instanceof Error ? claimError.message : "Unknown error"}`,
            },
          },
        )

        // Send technical error email
        try {
          const customerName = `${claim.firstName || ""} ${claim.lastName || ""}`.trim()
          const emailSubject = "OTT Code Processing Update - Technical Error - SYSTECH DIGITAL"
          const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🔧 Technical Processing Error</h1>
              </div>
              
              <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${customerName || "Customer"},</p>
                
                <p style="color: #374151; line-height: 1.6;">We encountered a technical error while processing your OTT code request. Our technical team has been notified and is working to resolve this issue.</p>
                
                <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 16px;">Error Details:</h3>
                  <p style="color: #991b1b; margin: 0;"><strong>Status:</strong> Technical processing error</p>
                  <p style="color: #991b1b; margin: 5px 0 0 0;"><strong>Reference ID:</strong> ${claim._id}</p>
                  <p style="color: #991b1b; margin: 5px 0 0 0;"><strong>Time:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                </div>
                
                <p style="color: #374151; line-height: 1.6;">Our support team will contact you within 24 hours with an update. Your payment is secure and will be processed once the technical issue is resolved.</p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">📞 Immediate Support:</h3>
                  <p style="color: #374151; margin: 5px 0;"><strong>Email:</strong> support@systechdigital.com</p>
                  <p style="color: #374151; margin: 5px 0;"><strong>Phone:</strong> +91-XXXXXXXXXX</p>
                  <p style="color: #374151; margin: 5px 0;"><strong>Priority Support:</strong> Available 24/7 for technical issues</p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  This is an automated error notification from SYSTECH DIGITAL.
                </p>
              </div>
            </div>
          `

          await sendEmail(claim.email, emailSubject, emailBody)
        } catch (emailError) {
          console.error(`Failed to send technical error email to ${claim.email}:`, emailError)
        }

        details.push({
          email: claim.email,
          status: "failed",
          message: `Processing error: ${claimError instanceof Error ? claimError.message : "Unknown error"}`,
          step: "Processing",
          activationCode: claim.activationCode,
        })
        failedCount++
      }
    }

    const endTime = new Date()
    const processingTime = endTime.getTime() - startTime.getTime()

    const results = {
      expired: expiredCount,
      processed: processedCount,
      success: successCount,
      failed: failedCount,
      skipped: skippedCount,
      details,
      processingTime: `${processingTime}ms`,
      timestamp: endTime.toISOString(),
    }

    // Update automation settings with results and clear running status
    await settingsCollection.findOneAndUpdate(
      {},
      {
        $set: {
          isRunning: false,
          lastRun: endTime,
          lastRunResult: results,
          updatedAt: endTime,
        },
      },
    )

    console.log("✅ Automation process completed:", results)

    return NextResponse.json({
      success: true,
      message: "Automation process completed",
      results,
    })
  } catch (error) {
    console.error("💥 Automation process failed:", error)

    // Clear running status on error
    try {
      const db = await getDatabase()
      const settingsCollection = db.collection("automationsettings")
      await settingsCollection.findOneAndUpdate(
        {},
        {
          $set: {
            isRunning: false,
            lastError: {
              message: error instanceof Error ? error.message : "Unknown error",
              timestamp: new Date(),
            },
            updatedAt: new Date(),
          },
        },
      )
    } catch (updateError) {
      console.error("Failed to update error status:", updateError)
    }

    return NextResponse.json(
      {
        success: false,
        error: "Automation process failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
