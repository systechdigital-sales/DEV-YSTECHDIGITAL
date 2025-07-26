import nodemailer from "nodemailer"

interface EmailData {
  to: string
  subject: string
  template: string
  data: any
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
}

export async function sendEmail({ to, subject, template, data }: EmailData) {
  try {
    const templateFunction = emailTemplates[template as keyof typeof emailTemplates]
    if (!templateFunction) {
      throw new Error(`Template ${template} not found`)
    }

    const html = templateFunction(data)

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)
    return result
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}
