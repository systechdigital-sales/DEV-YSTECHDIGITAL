import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import ClaimResponse from "@/models/ClaimResponse"
import SalesRecord from "@/models/SalesRecord"
import OTTKey from "@/models/OTTKey"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    console.log("Starting automation process...")

    // Get all claims with paid status that haven't been processed yet
    const paidClaims = await ClaimResponse.find({
      paymentStatus: "paid",
      ottCodeStatus: { $in: ["pending", "activation_code_not_found"] },
    })

    console.log(`Found ${paidClaims.length} paid claims to process`)

    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{
        email: string
        status: "success" | "failed" | "skipped"
        message: string
        ottCode?: string
      }>,
    }

    for (const claim of paidClaims) {
      results.processed++

      console.log(`Processing claim for ${claim.email} with activation code: ${claim.activationCode}`)

      // Skip claims with activation_code_not_found status
      if (claim.ottCodeStatus === "activation_code_not_found") {
        console.log(`Skipping claim for ${claim.email} - activation code not found`)
        results.skipped++
        results.details.push({
          email: claim.email,
          status: "skipped",
          message: "Activation code not found in sales records",
        })
        continue
      }

      try {
        // Check if activation code exists in sales records
        const salesRecord = await SalesRecord.findOne({
          activationCode: claim.activationCode,
        })

        if (!salesRecord) {
          console.log(`No sales record found for activation code: ${claim.activationCode}`)

          // Update claim status to activation_code_not_found
          await ClaimResponse.findByIdAndUpdate(claim._id, {
            ottCodeStatus: "activation_code_not_found",
          })

          results.skipped++
          results.details.push({
            email: claim.email,
            status: "skipped",
            message: "Activation code not found in sales records",
          })
          continue
        }

        // Find an available OTT key
        const availableKey = await OTTKey.findOne({
          status: "available",
        })

        if (!availableKey) {
          console.log(`No available OTT keys for ${claim.email}`)
          results.failed++
          results.details.push({
            email: claim.email,
            status: "failed",
            message: "No available OTT keys",
          })
          continue
        }

        // Update the OTT key to assigned
        await OTTKey.findByIdAndUpdate(availableKey._id, {
          status: "assigned",
          assignedEmail: claim.email,
          assignedDate: new Date(),
        })

        // Update the claim with OTT code
        await ClaimResponse.findByIdAndUpdate(claim._id, {
          ottCode: availableKey.activationCode,
          ottCodeStatus: "sent",
          ottAssignedAt: new Date(),
        })

        // Update sales record status
        await SalesRecord.findByIdAndUpdate(salesRecord._id, {
          status: "claimed",
        })

        // Send email to customer
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

        await sendEmail(claim.email, emailSubject, emailBody)

        console.log(`Successfully processed claim for ${claim.email} with OTT code: ${availableKey.activationCode}`)

        results.success++
        results.details.push({
          email: claim.email,
          status: "success",
          message: `OTT code assigned and email sent successfully`,
          ottCode: availableKey.activationCode,
        })
      } catch (error) {
        console.error(`Error processing claim for ${claim.email}:`, error)
        results.failed++
        results.details.push({
          email: claim.email,
          status: "failed",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
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
    console.error("Error in automation process:", error)
    return NextResponse.json({ error: "Automation process failed" }, { status: 500 })
  }
}
