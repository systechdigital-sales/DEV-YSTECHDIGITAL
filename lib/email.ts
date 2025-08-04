import nodemailer from "nodemailer"
import { IClaimResponse } from "./models"

interface EmailOptions {
  to: string
  subject: string
  template: "custom" | "default" | "payment_success_detailed" | "otp_login_code" // Add new template type
  data: {
    html?: string // For custom HTML templates
    // Data for payment_success_detailed
    customerName?: string
    paymentId?: string
    orderId?: string
    claimId?: string
    amount?: string
    email?: string
    phone?: string
    date?: string
    // Data for otp_login_code
    otp?: string
    otpExpiryMinutes?: number
  }
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const emailTemplates = {
  payment_success_detailed: (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Successful</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-badge { background: #28a745; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; }
            .details-section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #555; }
            .detail-value { color: #333; font-family: monospace; }
            .important-notice { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎉 Payment Successful!</h1>
            <p>Your OTT code claim has been processed</p>
        </div>
        
        <div class="content">
            <div class="success-badge">✅ Payment Confirmed</div>
            
            <p>Dear ${data.customerName},</p>
            
            <p>Thank you for your payment! Your transaction has been successfully processed and your OTT code claim is now being prepared.</p>
            
            <div class="details-section">
                <h3>🔍 Transaction Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Payment ID:</span>
                    <span class="detail-value">${data.paymentId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Order ID:</span>
                    <span class="detail-value">${data.orderId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Claim ID:</span>
                    <span class="detail-value">${data.claimId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount Paid:</span>
                    <span class="detail-value">${data.amount}</span>
                </div>
            </div>
            
            <div class="details-section">
                <h3>👤 Customer Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${data.customerName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${data.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${data.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${data.date}</span>
                </div>
            </div>
            
            <div class="important-notice">
                <h4>📱 What's Next?</h4>
                <p><strong>You will receive your OTT play code within 24 hours.</strong></p>
                <p>Our team is processing your request and will send the activation code to this email address once ready.</p>
            </div>
            
            <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
            
            <div class="footer">
                <p>Thank you for choosing SYSTECH DIGITAL</p>
                <p>This is an automated email. Please do not reply to this message.</p>
            </div>
        </div>
    </body>
    </html>
  `,
  otp_login_code: (data: { otp: string; otpExpiryMinutes: number }) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your SYSTECH DIGITAL Login Code</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa; }
            .container { background: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .content { padding: 30px; text-align: center; }
            .otp-box { background: #e0f2f7; border: 1px solid #b3e5fc; padding: 25px; border-radius: 8px; display: inline-block; margin: 20px 0; }
            .otp-code { font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 6px; }
            .important-notice { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left; }
            .important-notice h4 { margin-top: 0; color: #856404; }
            .important-notice ul { list-style: disc; padding-left: 20px; margin: 0; color: #6b7280; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; padding: 20px; border-top: 1px solid #eee; }
            .footer a { color: #1e40af; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SYSTECH DIGITAL</h1>
                <p style="font-size: 18px; margin-top: 10px;">Your Secure Login Code</p>
            </div>
            
            <div class="content">
                <p style="font-size: 16px; color: #555;">Hello,</p>
                <p style="font-size: 16px; color: #555;">Please use the following One-Time Password (OTP) to log in to your SYSTECH DIGITAL dashboard:</p>
                
                <div class="otp-box">
                    <span class="otp-code">${data.otp}</span>
                </div>
                
                <p style="font-size: 14px; color: #777;">This code is valid for the next <strong>${data.otpExpiryMinutes} minutes</strong>.</p>
                
                <div class="important-notice">
                    <h4>Important:</h4>
                    <ul>
                        <li>This OTP is for your security. Do not share it with anyone.</li>
                        <li>If you did not request this code, please ignore this email.</li>
                    </ul>
                </div>
                
                <p style="font-size: 16px; color: #555; margin-top: 30px;">Thank you for choosing SYSTECH DIGITAL.</p>
            </div>
            
            <div class="footer">
                <p>Need assistance? Contact us:</p>
                <p>📞 +91 7709803412 | ✉️ <a href="mailto:sales.systechdigital@gmail.com">sales.systechdigital@gmail.com</a></p>
                <p style="margin-top: 10px;">© ${new Date().getFullYear()} SYSTECH DIGITAL. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `,
  custom: (data: any) => data.html || "",
  default: (data: any) => `<p>This is a default email. Subject: ${data.subject}</p>`,
}

export async function sendEmail(email: string | undefined, p0: string, p1: string, claimData: Partial<IClaimResponse>, p2: { to: string; subject: string; template: string; data: Partial<IClaimResponse> }, options: EmailOptions): Promise<boolean> {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    console.error(
      "Email credentials not configured. Please ensure GMAIL_USER and GMAIL_APP_PASSWORD are set. For GMAIL_APP_PASSWORD, you need to generate an App Password from your Google Account security settings.",
    )
    return false
  }

  let htmlContent: string

  switch (options.template) {
    case "custom":
      htmlContent = options.data.html || ""
      break
    case "payment_success_detailed":
      htmlContent = emailTemplates.payment_success_detailed(options.data)
      break
    case "otp_login_code":
      if (!options.data.otp || options.data.otpExpiryMinutes === undefined) {
        console.error("Missing OTP data for otp_login_code template.")
        return false
      }
      htmlContent = emailTemplates.otp_login_code({
        otp: options.data.otp,
        otpExpiryMinutes: options.data.otpExpiryMinutes,
      })
      break
    default:
      htmlContent = emailTemplates.default(options.data)
  }

  const mailOptions = {
    from: `SYSTECH DIGITAL <${user}>`, // Added sender name
    to: options.to,
    subject: options.subject,
    html: htmlContent,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Email sent successfully to ${options.to}`)
    return true
  } catch (error) {
    console.error(`Error sending email to ${options.to}:`, error)
    return false
  }
}
