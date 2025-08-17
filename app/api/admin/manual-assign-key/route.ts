import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import type { IClaimResponse, ISalesRecord, IOTTKey } from "@/lib/models"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { claimId, ottKeyId, adminPassword } = await request.json()

    if (!claimId || !ottKeyId || !adminPassword) {
      return NextResponse.json({ error: "Missing claimId, ottKeyId, or adminPassword" }, { status: 400 })
    }

    // Basic password check for security
    if (adminPassword !== "Tr!ckyH@ck3r#2025") {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 })
    }

    const db = await getDatabase()
    const claimsCollection = db.collection<IClaimResponse>("claims")
    const salesCollection = db.collection<ISalesRecord>("salesrecords")
    const keysCollection = db.collection<IOTTKey>("ottkeys")

    // 1. Find the claim
    const claim = await claimsCollection.findOne({ _id: new ObjectId(claimId) })
    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 })
    }

    // 2. Find the sales record associated with the claim's activation code
    const salesRecord = await salesCollection.findOne({ activationCode: claim.activationCode })
    if (!salesRecord) {
      // Optionally update claim status if sales record is missing
      await claimsCollection.updateOne(
        { _id: claim._id },
        { $set: { ottCodeStatus: "activation_code_not_found", updatedAt: new Date() } },
      )
      return NextResponse.json({ error: "Sales record not found for this claim's activation code" }, { status: 404 })
    }

    // 3. Find the specific OTT key to assign and ensure it's available
    const ottKey = await keysCollection.findOne({ _id: new ObjectId(ottKeyId) })
    if (!ottKey) {
      return NextResponse.json({ error: "OTT Key not found" }, { status: 404 })
    }
    if (ottKey.status !== "available") {
      return NextResponse.json({ error: `OTT Key is not available (status: ${ottKey.status})` }, { status: 400 })
    }

    // 4. Update the OTT key status to assigned
    await keysCollection.updateOne(
      { _id: ottKey._id },
      {
        $set: {
          status: "assigned",
          assignedEmail: claim.email,
          assignedDate: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    // 5. Update the claim with the OTT code and status
    await claimsCollection.updateOne(
      { _id: claim._id },
      {
        $set: {
          ottCode: ottKey.activationCode,
          ottCodeStatus: "delivered",
          ottAssignedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    // 6. Update the sales record status to claimed
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

    // 7. Send email to customer (reusing the automation's email body)
    const emailSubject = "Your OTT Subscription Code - SYSTECH DIGITAL (Manual Assignment)"
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
            <p style="margin: 10px 0;"><strong>Service:</strong> ${ottKey.product}</p>
            <p style="margin: 10px 0;"><strong>Category:</strong> ${ottKey.productSubCategory}</p>
            <p style="margin: 10px 0;"><strong>Activation Code:</strong> 
              <span style="background-color: #fef3c7; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-weight: bold;">
                ${ottKey.activationCode}
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

    console.log(`Manually assigned OTT key ${ottKey.activationCode} to claim ${claim.email}`)

    return NextResponse.json({
      success: true,
      message: `OTT key ${ottKey.activationCode} manually assigned to ${claim.email} and email sent.`,
    })
  } catch (error) {
    console.error("Error in manual key assignment:", error)
    return NextResponse.json(
      {
        error: "Failed to manually assign OTT key",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
