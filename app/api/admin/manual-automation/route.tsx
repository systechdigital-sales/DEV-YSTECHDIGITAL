import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import { sendOTTCodeWhatsApp, sendFailureWhatsApp } from "@/lib/whatsapp"

export async function POST(request: NextRequest) {
  try {
    const { claimId } = await request.json()

    if (!claimId) {
      return NextResponse.json({ error: "Claim ID is required" }, { status: 400 })
    }

    console.log(`🔄 Manual automation triggered for claim: ${claimId}`)

    const db = await getDatabase()
    const claimsCollection = db.collection("claims")
    const salesCollection = db.collection("salesrecords")
    const keysCollection = db.collection("ottkeys")

    // Find the specific claim
    const claim = await claimsCollection.findOne({ claimId: claimId })

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 })
    }

    console.log(`📋 Processing claim: ${claim.claimId} for ${claim.email}`)

    // Check if claim is eligible for processing
    if (claim.paymentStatus !== "paid") {
      return NextResponse.json(
        {
          error: "Claim is not eligible for processing - payment status is not 'paid'",
          currentStatus: claim.paymentStatus,
        },
        { status: 400 },
      )
    }

    if (claim.ottStatus === "delivered") {
      return NextResponse.json(
        {
          error: "Claim already processed - OTT code already delivered",
          ottCode: claim.ottCode,
        },
        { status: 400 },
      )
    }

    let result = {
      success: false,
      message: "",
      step: "",
      ottCode: null as string | null,
    }

    try {
      // STEP 1: Find matching sales record
      const originalCode = claim.activationCode
      console.log(`🔍 Searching for activation code: "${originalCode}"`)

      let salesRecord = await salesCollection.findOne({
        activationCode: originalCode,
      })

      if (!salesRecord) {
        // Try case-insensitive match
        salesRecord = await salesCollection.findOne({
          activationCode: { $regex: originalCode, $options: "i" },
        })
      }

      if (!salesRecord) {
        console.error(`❌ No sales record found for activation code: ${originalCode}`)

        await claimsCollection.updateOne(
          { _id: claim._id },
          {
            $set: {
              ottStatus: "failed",
              failureReason: "Invalid activation code - not found in sales records",
              updatedAt: new Date(),
              emailSent: "invalid_code_failed",
            },
          },
        )

        await sendFailureEmail(claim, "invalid_code", "Invalid activation code - not found in sales records")

        result = {
          success: false,
          message: "Invalid activation code - not found in sales records",
          step: "Code Verification",
          ottCode: null,
        }

        return NextResponse.json({ result })
      }

      console.log(`✅ Found sales record: ${salesRecord.product || "Unknown product"}`)

      // STEP 2: Check if already claimed
      if (salesRecord.status === "claimed") {
        console.error(`❌ Activation code already claimed by: ${salesRecord.claimedBy}`)

        await claimsCollection.updateOne(
          { _id: claim._id },
          {
            $set: {
              ottStatus: "failed",
              failureReason: "Activation code already claimed",
              updatedAt: new Date(),
              emailSent: "duplicate_failed",
            },
          },
        )

        await sendFailureEmail(claim, "duplicate_claim", "This activation code has already been claimed")

        result = {
          success: false,
          message: "Activation code already claimed",
          step: "Duplicate Check",
          ottCode: null,
        }

        return NextResponse.json({ result })
      }

      // STEP 3: Mark sales record as claimed
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

      console.log(`✅ Sales record marked as claimed by: ${claim.email}`)

      // STEP 4: Find available OTT key
      const platform = getPlatformFromProduct(salesRecord.product || "OTTplay")
      console.log(`🎯 Looking for ${platform} OTT key...`)

      let availableKey = await keysCollection.findOne({
        status: "Available",
        product: platform,
      })

      if (!availableKey) {
        availableKey = await keysCollection.findOne({
          status: "Available",
          product: { $regex: platform, $options: "i" },
        })
      }

      if (!availableKey) {
        availableKey = await keysCollection.findOne({
          status: "Available",
        })
      }

      if (!availableKey) {
        console.error(`❌ No available OTT keys found`)

        await claimsCollection.updateOne(
          { _id: claim._id },
          {
            $set: {
              ottStatus: "failed",
              failureReason: "No available OTT keys",
              updatedAt: new Date(),
              emailSent: "no_keys_failed",
            },
          },
        )

        await sendFailureEmail(claim, "no_keys", "No available OTT keys")

        result = {
          success: false,
          message: "No available OTT keys",
          step: "Key Assignment",
          ottCode: null,
        }

        return NextResponse.json({ result })
      }

      console.log(`🎉 Found available OTT key: ${availableKey.activationCode} for product: ${availableKey.product}`)

      // STEP 5: Assign OTT key and update claim
      const ottCode = availableKey.activationCode
      const assignedPlatform = availableKey.product || platform

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

      // Update claim with success
      await claimsCollection.updateOne(
        { _id: claim._id },
        {
          $set: {
            ottStatus: "delivered",
            ottCode: ottCode,
            platform: assignedPlatform,
            updatedAt: new Date(),
            emailSent: "success_delivered",
            automationProcessed: true,
          },
        },
      )

      // Send success email
      await sendSuccessEmail(claim, ottCode, assignedPlatform)

      result = {
        success: true,
        message: "OTT code assigned and delivered successfully",
        step: "Email Notification",
        ottCode: ottCode,
      }

      console.log(`✅ Successfully processed claim: ${claim.claimId}`)
    } catch (processingError: any) {
      console.error(`❌ Error processing claim ${claim.claimId}:`, processingError)

      await claimsCollection.updateOne(
        { _id: claim._id },
        {
          $set: {
            ottStatus: "failed",
            failureReason: `Processing error: ${processingError.message}`,
            updatedAt: new Date(),
            emailSent: "processing_failed",
          },
        },
      )

      await sendFailureEmail(claim, "technical_error", `Processing error: ${processingError.message}`)

      result = {
        success: false,
        message: `Processing error: ${processingError.message}`,
        step: "Processing",
        ottCode: null,
      }
    }

    return NextResponse.json({ result })
  } catch (error: any) {
    console.error("❌ Manual automation failed:", error)
    return NextResponse.json({ error: error.message || "Manual automation failed" }, { status: 500 })
  }
}

// Helper function to determine platform from product name
function getPlatformFromProduct(product: string): string {
  const productLower = product.toLowerCase()

  const platformMapping: Record<string, string> = {
    ottplay: "OTTplay Power Package 01 Yr Subscription",
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

  for (const [key, platform] of Object.entries(platformMapping)) {
    if (productLower.includes(key)) {
      return platform
    }
  }

  return "OTTplay Power Package 01 Yr Subscription"
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
              Great news! Your OTT subscription claim has been processed successfully. Here's your Coupon code:
            </p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center;">
              <p style="color: white; margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your ${platform} Coupon Code</p>
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
                <li>Tap 'Apply Coupon', enter code &amp; get 100% off.</li>
                <li>Tap 'Subscribe Yearly"</li>
                <li>Enter your mobile number, verify OTP &amp; start streaming OTTs +500 Live channels for 12 months!</li>
                <li>Enter the Coupon code: <strong>${ottCode}</strong></li>
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
          </div>
          
          <div style="text-align: center; color: #718096; font-size: 12px;">
            <p>Thank you for choosing SYSTECH DIGITAL</p>
            <p>This is an automated message - please do not reply</p>
          </div>
        </div>
      `,
    })

    if (claim.phoneNumber || claim.phone) {
      const phone = claim.phoneNumber || claim.phone
      console.log(`📱 Sending WhatsApp message to: ${phone}`)
      await sendOTTCodeWhatsApp(phone, {
        customerName,
        ottCode,
        platform,
        claimId: claim.claimId,
      })
    }

    console.log(`📧 Success email sent to: ${claim.email}`)
  } catch (emailError) {
    console.error(`❌ Failed to send success email to ${claim.email}:`, emailError)
  }
}

// Helper function to send failure email
async function sendFailureEmail(claim: any, failureType: string, reason: string) {
  try {
    const customerName = `${claim.firstName} ${claim.lastName}`

    await sendEmail({
      to: claim.email,
      subject: "⚠️ Issue with Your OTT Code Claim - SYSTECH DIGITAL",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e53e3e; margin: 0; font-size: 24px;">⚠️ Processing Issue</h1>
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
            
            <div style="background: #e6fffa; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #234e52; margin: 0 0 10px 0;">📞 Contact Support</h4>
              <p style="margin: 0; color: #234e52;">
                <strong>Email:</strong> sales.systechdigital@gmail.com<br />
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

    if (claim.phoneNumber || claim.phone) {
      const phone = claim.phoneNumber || claim.phone
      console.log(`📱 Sending failure WhatsApp message to: ${phone}`)
      await sendFailureWhatsApp(phone, customerName, claim.claimId, reason)
    }

    console.log(`📧 Failure email sent to: ${claim.email}`)
  } catch (emailError) {
    console.error(`❌ Failed to send failure email to ${claim.email}:`, emailError)
  }
}
