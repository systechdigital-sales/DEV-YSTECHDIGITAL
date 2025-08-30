interface WhatsAppMessage {
  to: string
  message: string
}

interface WhatsAppOTTCodeData {
  customerName: string
  ottCode: string
  platform: string
  claimId: string
}

export async function sendWhatsAppMessage(data: WhatsAppMessage): Promise<boolean> {
  try {
    console.log("BytewiseTestingpoint Sending WhatsApp message to:", data.to)
    console.log("BytewiseTestingpoint Message length:", data.message.length)

    // For now, we'll use a placeholder implementation
    // In production, you would integrate with WhatsApp Business API
    // or a service like Twilio, MessageBird, etc.

    // Example using WhatsApp Cloud API (you'll need to set up proper credentials)
    const whatsappApiUrl = `https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages`
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

    if (!accessToken) {
      console.error("BytewiseTestingpoint WhatsApp access token not configured")
      return false
    }

    const payload = {
      messaging_product: "whatsapp",
      to: data.to,
      type: "text",
      text: {
        body: data.message,
      },
    }

    const response = await fetch(whatsappApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      console.log("BytewiseTestingpoint WhatsApp message sent successfully")
      return true
    } else {
      console.error("BytewiseTestingpoint WhatsApp API error:", await response.text())
      return false
    }
  } catch (error) {
    console.error("BytewiseTestingpoint Error sending WhatsApp message:", error)
    return false
  }
}

export async function sendOTTCodeWhatsApp(phoneNumber: string, data: WhatsAppOTTCodeData): Promise<boolean> {
  // Format phone number (ensure it starts with country code)
  let formattedPhone = phoneNumber.replace(/\D/g, "") // Remove non-digits
  if (formattedPhone.startsWith("91") && formattedPhone.length === 12) {
    // Already has country code
  } else if (formattedPhone.length === 10) {
    // Add India country code
    formattedPhone = "91" + formattedPhone
  }

  const message = `🎉 *Your OTT Code is Ready!* 🎉

Dear ${data.customerName},

Great news! Your OTT subscription claim has been processed successfully.

*${data.platform} Activation Code:*
*${data.ottCode}*

*How to Redeem:*
1. Open the OTT Play app
2. Go to "Redeem Code" section  
3. Enter code: ${data.ottCode}
4. Enjoy your premium subscription!

*Claim ID:* ${data.claimId}
*Processed:* ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}

For support: sales.systechdigital@gmail.com

Thank you for choosing SYSTECH DIGITAL!

_This is an automated message from SYSTECH DIGITAL_`

  return await sendWhatsAppMessage({
    to: formattedPhone,
    message: message,
  })
}

export async function sendFailureWhatsApp(
  phoneNumber: string,
  customerName: string,
  claimId: string,
  reason: string,
): Promise<boolean> {
  // Format phone number
  let formattedPhone = phoneNumber.replace(/\D/g, "")
  if (formattedPhone.startsWith("91") && formattedPhone.length === 12) {
    // Already has country code
  } else if (formattedPhone.length === 10) {
    formattedPhone = "91" + formattedPhone
  }

  const message = `⚠️ *OTT Code Processing Issue* ⚠️

Dear ${customerName},

We encountered an issue while processing your OTT code claim.

*Issue:* ${reason}
*Claim ID:* ${claimId}
*Status:* Under Investigation

*What we're doing:*
• Our team has been notified
• We'll resolve this within 24 hours
• Your payment is secure

*Need help?*
📧 sales.systechdigital@gmail.com

We apologize for the inconvenience.

SYSTECH DIGITAL Support Team

_This is an automated message_`

  return await sendWhatsAppMessage({
    to: formattedPhone,
    message: message,
  })
}
