import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Claims webhook triggered - New record detected in claims collection")

    const db = await getDatabase()
    const claimsCollection = db.collection("claims")
    const salesCollection = db.collection("salesrecords")
    const keysCollection = db.collection("ottkeys")

    // Get the most recent paid claim that hasn't been processed
    const recentClaim = await claimsCollection.findOne(
      {
        paymentStatus: "paid",
        ottCodeStatus: { $in: ["pending", "activation_code_not_found"] },
      },
      { sort: { createdAt: -1 } },
    )

    if (!recentClaim) {
      console.log("No new paid claims to process")
      return NextResponse.json({ message: "No new claims to process" })
    }

    console.log(`🚀 Auto-processing claim for ${recentClaim.email} with activation code: ${recentClaim.activationCode}`)

    try {
      // Step 1: Check if activation code exists in sales records
      const salesRecord = await salesCollection.findOne({
        activationCode: recentClaim.activationCode,
      })

      if (!salesRecord) {
        console.log(`❌ No sales record found for activation code: ${recentClaim.activationCode}`)

        await claimsCollection.updateOne(
          { _id: recentClaim._id },
          { $set: { ottCodeStatus: "activation_code_not_found" } },
        )

        return NextResponse.json({
          message: "Activation code not found in sales records",
          status: "skipped",
        })
      }

      // Step 2: Check for duplicates
      const existingClaim = await claimsCollection.findOne({
        activationCode: recentClaim.activationCode,
        ottCodeStatus: "delivered",
        _id: { $ne: recentClaim._id },
      })

      if (existingClaim) {
        console.log(`⚠️ Duplicate detected - Activation code ${recentClaim.activationCode} already claimed`)

        await claimsCollection.updateOne({ _id: recentClaim._id }, { $set: { ottCodeStatus: "already_claimed" } })

        return NextResponse.json({
          message: "Activation code already claimed by another user",
          status: "duplicate",
        })
      }

      // Step 3: Find available OTT key
      const availableKey = await keysCollection.findOne({ status: "available" })

      if (!availableKey) {
        console.log(`❌ No available OTT keys for ${recentClaim.email}`)

        await claimsCollection.updateOne({ _id: recentClaim._id }, { $set: { ottCodeStatus: "failed" } })

        return NextResponse.json({
          message: "No available OTT keys in inventory",
          status: "failed",
        })
      }

      // Step 4: Assign key and update records
      await keysCollection.updateOne(
        { _id: availableKey._id },
        {
          $set: {
            status: "assigned",
            assignedEmail: recentClaim.email,
            assignedDate: new Date(),
          },
        },
      )

      await claimsCollection.updateOne(
        { _id: recentClaim._id },
        {
          $set: {
            ottCode: availableKey.activationCode,
            ottCodeStatus: "delivered",
            ottAssignedAt: new Date(),
          },
        },
      )

      await salesCollection.updateOne(
        { _id: salesRecord._id },
        {
          $set: {
            status: "claimed",
            claimedBy: recentClaim.email,
            claimedDate: new Date(),
          },
        },
      )

      // Step 5: Send email notification
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
              Dear ${recentClaim.firstName} ${recentClaim.lastName},
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Thank you for your purchase! Your OTT subscription code has been automatically processed and is now ready for activation.
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
            
            <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
              <h4 style="color: #15803d; margin-top: 0;">✅ Automatically Processed</h4>
              <p style="color: #15803d; margin: 0;">This code was automatically assigned to you within minutes of your payment confirmation!</p>
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
        to: recentClaim.email,
        subject: emailSubject,
        template: "custom",
        data: { html: emailBody },
      })

      console.log(
        `✅ Successfully auto-processed claim for ${recentClaim.email} with OTT code: ${availableKey.activationCode}`,
      )

      return NextResponse.json({
        success: true,
        message: "Claim automatically processed and email sent",
        email: recentClaim.email,
        ottCode: availableKey.activationCode,
        status: "success",
      })
    } catch (error) {
      console.error(`❌ Error auto-processing claim for ${recentClaim.email}:`, error)

      await claimsCollection.updateOne({ _id: recentClaim._id }, { $set: { ottCodeStatus: "failed" } })

      return NextResponse.json(
        {
          error: "Failed to auto-process claim",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Error in claims webhook:", error)
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
