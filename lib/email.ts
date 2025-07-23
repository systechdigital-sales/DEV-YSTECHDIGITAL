import nodemailer from "nodemailer"

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"SYSTECH DIGITAL" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    })

    console.log("Email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Email templates
export const emailTemplates = {
  claimSubmitted: (name: string, claimId: string) => ({
    subject: "OTT Claim Submitted Successfully - SYSTECH DIGITAL",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #000000, #dc2626, #000000); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SYSTECH DIGITAL</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0;">OTT Play Redemption</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for submitting your OTT Play claim. We have received your request and it is currently being processed.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #374151;"><strong>Claim ID:</strong> ${claimId}</p>
            <p style="margin: 10px 0 0 0; color: #374151;"><strong>Status:</strong> Payment Processing</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <strong>Your OTT Play key will be provided to you within 24 working hours</strong> after successful payment verification.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            If you have any questions, please contact us at:
          </p>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Contact Information:</strong></p>
            <p style="margin: 5px 0; color: #991b1b;">📧 sales.systechdigital@gmail.com</p>
            <p style="margin: 5px 0; color: #991b1b;">📱 +91 9876543210</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">
            Best regards,<br>
            <strong>SYSTECH DIGITAL Team</strong>
          </p>
        </div>
      </div>
    `,
  }),

  paymentFailed: (name: string, claimId: string) => ({
    subject: "Payment Failed - Please Try Again - SYSTECH DIGITAL",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #000000, #dc2626, #000000); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SYSTECH DIGITAL</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0;">Payment Failed</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin: 0 0 10px 0;">❌ Payment Failed</h3>
            <p style="margin: 0; color: #991b1b;">Your payment for the OTT Play claim could not be processed.</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #374151;"><strong>Claim ID:</strong> ${claimId}</p>
            <p style="margin: 10px 0 0 0; color: #374151;"><strong>Status:</strong> Payment Failed</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <strong>Please fill the form correctly and try again.</strong> Make sure all information is accurate and your payment method is valid.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/ottclaim" 
               style="background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Try Again
            </a>
          </div>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Need Help?</strong></p>
            <p style="margin: 5px 0; color: #991b1b;">📧 sales.systechdigital@gmail.com</p>
            <p style="margin: 5px 0; color: #991b1b;">📱 +91 9876543210</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">
            Best regards,<br>
            <strong>SYSTECH DIGITAL Team</strong>
          </p>
        </div>
      </div>
    `,
  }),

  ottCodeSent: (name: string, ottCode: string, productName: string) => ({
    subject: "🎉 Your OTT Play Key is Ready! - SYSTECH DIGITAL",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #000000, #dc2626, #000000); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SYSTECH DIGITAL</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0;">OTT Play Key Delivered</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">🎉 Congratulations ${name}!</h2>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin: 0 0 10px 0;">✅ Your OTT Play Key is Ready!</h3>
            <p style="margin: 0; color: #15803d;">Your claim has been verified and processed successfully.</p>
          </div>
          
          <div style="background: #1f2937; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">Your OTT Play Key for ${productName}</p>
            <div style="background: #374151; padding: 15px; border-radius: 6px; margin: 10px 0;">
              <code style="color: #fbbf24; font-size: 18px; font-weight: bold; letter-spacing: 2px;">${ottCode}</code>
            </div>
            <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 12px;">Copy this code to redeem your subscription</p>
          </div>
          
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <h4 style="color: #1d4ed8; margin: 0 0 10px 0;">📋 How to Use Your Key:</h4>
            <ol style="color: #1e40af; margin: 0; padding-left: 20px;">
              <li>Visit the official website/app of your OTT service</li>
              <li>Go to "Redeem Code" or "Gift Card" section</li>
              <li>Enter the code provided above</li>
              <li>Enjoy your subscription!</li>
            </ol>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <strong>Important:</strong> This code is valid for one-time use only. Please redeem it as soon as possible.
          </p>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Support:</strong></p>
            <p style="margin: 5px 0; color: #991b1b;">📧 sales.systechdigital@gmail.com</p>
            <p style="margin: 5px 0; color: #991b1b;">📱 +91 9876543210</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">
            Thank you for choosing SYSTECH DIGITAL!<br>
            <strong>SYSTECH DIGITAL Team</strong>
          </p>
        </div>
      </div>
    `,
  }),

  waitEmail: (name: string, activationCode: string) => ({
    subject: "OTT Claim Under Review - Please Wait - SYSTECH DIGITAL",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #000000, #dc2626, #000000); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SYSTECH DIGITAL</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0;">Claim Under Review</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
          
          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #d97706; margin: 0 0 10px 0;">⏳ Claim Under Review</h3>
            <p style="margin: 0; color: #92400e;">Your OTT claim is currently being reviewed by our team.</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #374151;"><strong>Activation Code:</strong> ${activationCode}</p>
            <p style="margin: 10px 0 0 0; color: #374151;"><strong>Status:</strong> Under Review</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We are currently verifying your activation code with our sales records. This process may take up to <strong>48 working hours</strong>.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You will receive another email once the verification is complete with either your OTT key or further instructions.
          </p>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Questions?</strong></p>
            <p style="margin: 5px 0; color: #991b1b;">📧 sales.systechdigital@gmail.com</p>
            <p style="margin: 5px 0; color: #991b1b;">📱 +91 9876543210</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">
            Thank you for your patience,<br>
            <strong>SYSTECH DIGITAL Team</strong>
          </p>
        </div>
      </div>
    `,
  }),

  alreadyClaimed: (name: string, activationCode: string) => ({
    subject: "OTT Code Already Claimed - Contact Support - SYSTECH DIGITAL",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #000000, #dc2626, #000000); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SYSTECH DIGITAL</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0;">Code Already Claimed</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Code Already Claimed</h3>
            <p style="margin: 0; color: #991b1b;">This activation code has already been used to claim an OTT subscription.</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #374151;"><strong>Activation Code:</strong> ${activationCode}</p>
            <p style="margin: 10px 0 0 0; color: #374151;"><strong>Status:</strong> Already Claimed</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            The activation code you provided has already been used for an OTT claim. Each code can only be used once.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you believe this is an error or if you have any questions, please contact our sales team immediately.
          </p>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Contact Sales Team:</strong></p>
            <p style="margin: 5px 0; color: #991b1b;">📧 sales.systechdigital@gmail.com</p>
            <p style="margin: 5px 0; color: #991b1b;">📱 +91 9876543210</p>
            <p style="margin: 5px 0; color: #991b1b;">💬 Mention your activation code for faster resolution</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">
            Best regards,<br>
            <strong>SYSTECH DIGITAL Team</strong>
          </p>
        </div>
      </div>
    `,
  }),
}
