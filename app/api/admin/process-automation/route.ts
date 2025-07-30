import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()

    console.log("Starting automation process for systech_ott_platform database...")

    // Get collections from systech_ott_platform database
    const claimsCollection = db.collection("claims")
    const salesCollection = db.collection("salesrecords")
    const keysCollection = db.collection("ottkeys")

    // Step 1: Check for expired pending payments (more than 48 hours)
    const fortyEightHoursAgo = new Date()
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48)

    const expiredPendingClaims = await claimsCollection
      .find({
        paymentStatus: "pending",
        createdAt: { $lt: fortyEightHoursAgo },
      })
      .toArray()

    console.log(`Found ${expiredPendingClaims.length} expired pending claims`)

    // Update expired pending claims to failed
    for (const claim of expiredPendingClaims) {
      await claimsCollection.updateOne(
        { _id: claim._id },
        {
          $set: {
            paymentStatus: "failed",
            ottCodeStatus: "failed",
          },
        },
      )
    }

    // Step 2: Get all claims with paid status that haven't been processed yet
    const paidClaims = await claimsCollection
      .find({
        paymentStatus: "paid",
        ottCodeStatus: { $in: ["pending", "activation_code_not_found"] },
      })
      .toArray()

    console.log(`Found ${paidClaims.length} paid claims to process`)

    const results = {
      expired: expiredPendingClaims.length,
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{
        email: string
        status: "success" | "failed" | "skipped"
        message: string
        ottCode?: string
        step?: string
      }>,
    }

    for (const claim of paidClaims) {
      results.processed++

      console.log(`Processing claim for ${claim.email} with activation code: ${claim.activationCode}`)

      try {
        // Step 3: Check if activation code exists in sales records
        const salesRecord = await salesCollection.findOne({
          activationCode: claim.activationCode,
        })

        if (!salesRecord) {
          console.log(`No sales record found for activation code: ${claim.activationCode}`)

          // Update claim status to activation_code_not_found
          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "activation_code_not_found",
              },
            },
          )

          results.skipped++
          results.details.push({
            email: claim.email,
            status: "skipped",
            message: "Activation code not found in sales records",
            step: "Verification",
          })
          continue
        }

        // Step 4: Check if this activation code has already been claimed
        const existingClaim = await claimsCollection.findOne({
          activationCode: claim.activationCode,
          ottCodeStatus: "delivered",
          _id: { $ne: claim._id },
        })

        if (existingClaim) {
          console.log(`Activation code ${claim.activationCode} already claimed by ${existingClaim.email}`)

          // Update claim status to already_claimed
          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "already_claimed",
              },
            },
          )

          results.skipped++
          results.details.push({
            email: claim.email,
            status: "skipped",
            message: `Duplicate user - Key already assigned to ${existingClaim.email}. Can't assign same key again.`,
            step: "Duplicate Check",
          })
          continue
        }

        // Step 5: Find an available OTT key
        const availableKey = await keysCollection.findOne({
          status: "available",
        })

        if (!availableKey) {
          console.log(`No available OTT keys for ${claim.email}`)

          await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                ottCodeStatus: "failed",
              },
            },
          )

          results.failed++
          results.details.push({
            email: claim.email,
            status: "failed",
            message: "No available OTT keys in inventory",
            step: "Key Assignment",
          })
          continue
        }

        // Step 6: Update the OTT key to assigned
        await keysCollection.updateOne(
          { _id: availableKey._id },
          {
            $set: {
              status: "assigned",
              assignedEmail: claim.email,
              assignedDate: new Date(),
            },
          },
        )

        // Step 7: Update the claim with OTT code
        await claimsCollection.updateOne(
          { _id: claim._id },
          {
            $set: {
              ottCode: availableKey.activationCode,
              ottCodeStatus: "delivered",
              ottAssignedAt: new Date(),
            },
          },
        )

        // Step 8: Update sales record status to claimed
        await salesCollection.updateOne(
          { _id: salesRecord._id },
          {
            $set: {
              status: "claimed",
              claimedBy: claim.email,
              claimedDate: new Date(),
            },
          },
        )

        // Step 9: Send email to customer
        const emailSubject = "Your OTT Subscription Code - SYSTECH DIGITAL"
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #000000, #7f1d1d, #000000); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">SYSTECH DIGITAL</h1>
              <p style="color: #fecaca; margin: 5px 0 0 0;">Your OTT Subscription is Ready!</p>
            </div>
            
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Congratulations! 🎉</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Dear ${claim.firstName} ${claim.lastName},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for your purchase! Your OTT subscription code is now ready for activation.
              </p>
              
              <div style="background-color: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">Your OTT Subscription Details:</h3>
                <p style="margin: 10px 0;"><strong>Service:</strong> ${availableKey.product}</p>
                <p style="margin: 10px 0;"><strong>Category:</strong> ${availableKey.productSubCategory}</p>
                <p style="margin: 10px 0;"><strong>Activation Code:</strong> 
                  <span style="background-color: #fef3c7; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-weight: bold;">
                    ${availableKey.activationCode}
                  </span>
                </p>
              </div>
              
              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                <h4 style="color: #1e40af; margin-top: 0;">How to Activate:</h4>
                <ol style="color: #1e40af; margin: 0;">
                  <li>Visit the official website of your OTT service</li>
                  <li>Go to the subscription or redeem section</li>
                  <li>Enter the activation code provided above</li>
                  <li>Follow the on-screen instructions to complete activation</li>
                </ol>
              </div>
              
              <p style="color: #4b5563; font-size: 14px; margin-top: 30px;">
                If you have any questions or need assistance, please contact our support team at 
                <a href="mailto:sales.systechdigital@gmail.com" style="color: #dc2626;">sales.systechdigital@gmail.com</a>
                or call us at +91 7709803412.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px;">
                  Thank you for choosing SYSTECH DIGITAL!<br>
                  Your trusted partner for IT Solutions & Mobile Technology
                </p>
              </div>
            </div>
            
            <div style="background-color: #1f2937; padding: 20px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2025 SYSTECH IT SOLUTIONS LIMITED. All rights reserved.
              </p>
            </div>
          </div>
        `

        await sendEmail({
          to: claim.email,
          subject: emailSubject,
          template: "custom",
          data: { html: emailBody },
        })

        console.log(`Successfully processed claim for ${claim.email} with OTT code: ${availableKey.activationCode}`)

        results.success++
        results.details.push({
          email: claim.email,
          status: "success",
          message: `OTT key successfully assigned and email sent. Key: ${availableKey.activationCode}`,
          ottCode: availableKey.activationCode,
          step: "Completed",
        })
      } catch (error) {
        console.error(`Error processing claim for ${claim.email}:`, error)

        // Update claim status to failed
        await claimsCollection.updateOne(
          { _id: claim._id },
          {
            $set: {
              ottCodeStatus: "failed",
            },
          },
        )

        results.failed++
        results.details.push({
          email: claim.email,
          status: "failed",
          message: `Processing error: ${error instanceof Error ? error.message : "Unknown error"}`,
          step: "Error",
        })
      }
    }

    console.log("Automation process completed for systech_ott_platform:", results)

    return NextResponse.json({
      success: true,
      message: "Automation process completed for systech_ott_platform database",
      results,
    })
  } catch (error) {
    console.error("Error in automation process for systech_ott_platform:", error)
    return NextResponse.json(
      {
        error: "Automation process failed for systech_ott_platform database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
