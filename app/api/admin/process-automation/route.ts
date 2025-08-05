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
    }> = []

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
        console.log(`🔄 Processing claim for ${claim.email} with activation code: ${claim.activationCode}`)

        // Step 3: Verify activation code exists in sales records
        const salesRecord = await salesCollection.findOne({
          activationCode: claim.activationCode,
        })

        if (!salesRecord) {
          console.log(`❌ Activation code ${claim.activationCode} not found in sales records`)
          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "failed",
                updatedAt: new Date(),
                failureReason: "Invalid activation code - not found in sales records",
              },
            },
          )

          // Send failure email
          try {
            const customerName = `${claim.firstName || ""} ${claim.lastName || ""}`.trim()
            await sendEmail(
              claim.email,
              "OTT Code Processing Update - Action Required - SYSTECH DIGITAL",
              "automation_failed",
              claim,
              {
                to: claim.email,
                subject: "OTT Code Processing Update - Action Required - SYSTECH DIGITAL",
                template: "automation_failed",
                data: claim,
              },
              {
                to: claim.email,
                subject: "OTT Code Processing Update - Action Required - SYSTECH DIGITAL",
                template: "automation_failed",
                data: {
                  customerName: customerName || claim.email.split("@")[0],
                  email: claim.email,
                  claimId: claim._id,
                  failureReason: "Invalid activation code - not found in sales records",
                  status: "Failed",
                  step: "Verification",
                  date: new Date().toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                },
              },
            )
          } catch (emailError) {
            console.error(`Failed to send failure email to ${claim.email}:`, emailError)
          }

          details.push({
            email: claim.email,
            status: "skipped",
            message: "Invalid activation code - not found in sales records",
            step: "Verification",
          })
          skippedCount++
          continue
        }

        // Step 4: Check for duplicate claims on same activation code
        const duplicateClaim = await claimsCollection.findOne({
          activationCode: claim.activationCode,
          ottCodeStatus: "delivered",
          _id: { $ne: claim._id },
        })

        if (duplicateClaim) {
          console.log(`⚠️ Duplicate claim detected for activation code: ${claim.activationCode}`)
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

          // Send failure email
          try {
            const customerName = `${claim.firstName || ""} ${claim.lastName || ""}`.trim()
            await sendEmail(
              claim.email,
              "OTT Code Processing Update - Duplicate Claim - SYSTECH DIGITAL",
              "automation_failed",
              claim,
              {
                to: claim.email,
                subject: "OTT Code Processing Update - Duplicate Claim - SYSTECH DIGITAL",
                template: "automation_failed",
                data: claim,
              },
              {
                to: claim.email,
                subject: "OTT Code Processing Update - Duplicate Claim - SYSTECH DIGITAL",
                template: "automation_failed",
                data: {
                  customerName: customerName || claim.email.split("@")[0],
                  email: claim.email,
                  claimId: claim._id,
                  failureReason: "Duplicate claim - activation code already used",
                  status: "Failed",
                  step: "Duplicate Check",
                  date: new Date().toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                },
              },
            )
          } catch (emailError) {
            console.error(`Failed to send failure email to ${claim.email}:`, emailError)
          }

          details.push({
            email: claim.email,
            status: "skipped",
            message: "Duplicate claim - activation code already used",
            step: "Duplicate Check",
          })
          skippedCount++
          continue
        }

        // Step 5: Find and assign available OTT key
        const availableKey = await ottKeysCollection.findOne({
          platform: claim.platform,
          status: "available",
        })

        if (!availableKey) {
          console.log(`❌ No available OTT keys for platform: ${claim.platform}`)
          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "failed",
                updatedAt: new Date(),
                failureReason: `No available OTT keys for platform: ${claim.platform}`,
              },
            },
          )

          // Send failure email
          try {
            const customerName = `${claim.firstName || ""} ${claim.lastName || ""}`.trim()
            await sendEmail(
              claim.email,
              "OTT Code Processing Update - No Available Keys - SYSTECH DIGITAL",
              "automation_failed",
              claim,
              {
                to: claim.email,
                subject: "OTT Code Processing Update - No Available Keys - SYSTECH DIGITAL",
                template: "automation_failed",
                data: claim,
              },
              {
                to: claim.email,
                subject: "OTT Code Processing Update - No Available Keys - SYSTECH DIGITAL",
                template: "automation_failed",
                data: {
                  customerName: customerName || claim.email.split("@")[0],
                  email: claim.email,
                  claimId: claim._id,
                  failureReason: `No available OTT keys for platform: ${claim.platform}`,
                  status: "Failed",
                  step: "Key Assignment",
                  date: new Date().toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                },
              },
            )
          } catch (emailError) {
            console.error(`Failed to send failure email to ${claim.email}:`, emailError)
          }

          details.push({
            email: claim.email,
            status: "failed",
            message: `No available OTT keys for platform: ${claim.platform}`,
            step: "Key Assignment",
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
              assignedTo: claim.email,
              assignedAt: new Date(),
              claimId: claim._id,
            },
          },
        )

        // Update claim with OTT code
        await claimsCollection.updateOne(
          { _id: claim._id },
          {
            $set: {
              ottCode: availableKey.code,
              ottCodeStatus: "delivered",
              updatedAt: new Date(),
              deliveredAt: new Date(),
            },
          },
        )

        // Step 6: Send email notification
        try {
          const emailSubject = `Your ${claim.platform} OTT Code - SYSTECH DIGITAL`
          const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Your OTT Code is Ready!</h2>
              <p>Dear ${claim.name || "Customer"},</p>
              <p>Your OTT code for <strong>${claim.platform}</strong> has been successfully processed.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">Your OTT Code:</h3>
                <p style="font-size: 24px; font-weight: bold; color: #dc2626; letter-spacing: 2px; font-family: monospace;">
                  ${availableKey.code}
                </p>
              </div>
              
              <p><strong>Platform:</strong> ${claim.platform}</p>
              <p><strong>Activation Code:</strong> ${claim.activationCode}</p>
              <p><strong>Processed At:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
              
              <p>Please use this code to activate your OTT subscription. Keep this email safe for your records.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                This is an automated email from SYSTECH DIGITAL. Please do not reply to this email.
              </p>
            </div>
          `

          await sendEmail(
            claim.email,
            emailSubject,
            "custom",
            claim,
            {
              to: claim.email,
              subject: emailSubject,
              template: "custom",
              data: claim,
            },
            {
              to: claim.email,
              subject: emailSubject,
              template: "custom",
              data: {
                html: emailBody,
              },
            },
          )
          console.log(`📧 Email sent successfully to ${claim.email}`)

          details.push({
            email: claim.email,
            status: "success",
            message: "OTT code assigned and email sent successfully",
            ottCode: availableKey.code,
            step: "Email Notification",
          })
          successCount++
        } catch (emailError) {
          console.error(`📧 Failed to send email to ${claim.email}:`, emailError)

          // Mark as failed due to email issue
          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "failed",
                updatedAt: new Date(),
                failureReason: "Failed to send email notification",
              },
            },
          )

          // Revert OTT key assignment
          await ottKeysCollection.updateOne(
            { _id: availableKey._id },
            {
              $set: {
                status: "available",
                assignedTo: null,
                assignedAt: null,
                claimId: null,
              },
            },
          )

          // Send failure email
          try {
            const customerName = `${claim.firstName || ""} ${claim.lastName || ""}`.trim()
            await sendEmail(
              claim.email,
              "OTT Code Processing Update - Email Delivery Issue - SYSTECH DIGITAL",
              "automation_failed",
              claim,
              {
                to: claim.email,
                subject: "OTT Code Processing Update - Email Delivery Issue - SYSTECH DIGITAL",
                template: "automation_failed",
                data: claim,
              },
              {
                to: claim.email,
                subject: "OTT Code Processing Update - Email Delivery Issue - SYSTECH DIGITAL",
                template: "automation_failed",
                data: {
                  customerName: customerName || claim.email.split("@")[0],
                  email: claim.email,
                  claimId: claim._id,
                  failureReason: "Failed to send email notification",
                  status: "Failed",
                  step: "Email Notification",
                  date: new Date().toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                },
              },
            )
          } catch (secondEmailError) {
            console.error(`Failed to send secondary failure email to ${claim.email}:`, secondEmailError)
          }

          details.push({
            email: claim.email,
            status: "failed",
            message: "Failed to send email notification",
            step: "Email Notification",
          })
          failedCount++
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

        // Send failure email
        try {
          const customerName = `${claim.firstName || ""} ${claim.lastName || ""}`.trim()
          await sendEmail(
            claim.email,
            "OTT Code Processing Update - Technical Error - SYSTECH DIGITAL",
            "automation_failed",
            claim,
            {
              to: claim.email,
              subject: "OTT Code Processing Update - Technical Error - SYSTECH DIGITAL",
              template: "automation_failed",
              data: claim,
            },
            {
              to: claim.email,
              subject: "OTT Code Processing Update - Technical Error - SYSTECH DIGITAL",
              template: "automation_failed",
              data: {
                customerName: customerName || claim.email.split("@")[0],
                email: claim.email,
                claimId: claim._id,
                failureReason: `Processing error: ${claimError instanceof Error ? claimError.message : "Unknown error"}`,
                status: "Failed",
                step: "Processing",
                date: new Date().toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              },
            },
          )
        } catch (emailError) {
          console.error(`Failed to send failure email to ${claim.email}:`, emailError)
        }

        details.push({
          email: claim.email,
          status: "failed",
          message: `Processing error: ${claimError instanceof Error ? claimError.message : "Unknown error"}`,
          step: "Processing",
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
