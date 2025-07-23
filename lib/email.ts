import nodemailer from "nodemailer"

// Create transporter
const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Email templates
const emailTemplates = {
  claim_submitted: (data: any) => ({
    subject: "OTT Claim Submitted Successfully - SYSTECH DIGITAL",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTT Claim Submitted</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #000); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 OTT Claim Submitted Successfully!</h1>
            <p>SYSTECH DIGITAL</p>
          </div>
          <div class="content">
            <p>Dear <strong>${data.firstName} ${data.lastName}</strong>,</p>
            
            <p>Thank you for submitting your OTT platform claim. We have received your request and it's currently being processed.</p>
            
            <div class="info-box">
              <h3>📋 Claim Details:</h3>
              <p><strong>Claim ID:</strong> ${data.id}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Phone:</strong> ${data.phone}</p>
              <p><strong>Purchase Type:</strong> ${data.purchaseType}</p>
              <p><strong>Activation Code:</strong> ${data.activationCode}</p>
              <p><strong>Purchase Date:</strong> ${data.purchaseDate}</p>
              <p><strong>Submission Date:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div class="info-box">
              <h3>💳 Next Steps:</h3>
              <p>1. Complete the payment of ₹99 processing fee</p>
              <p>2. Our team will verify your claim within 24-48 hours</p>
              <p>3. You'll receive your OTT platform access details via email</p>
            </div>
            
            <p><strong>Important:</strong> Please complete the payment to process your claim. You will be redirected to our secure payment gateway.</p>
            
            <div class="footer">
              <p><strong>SYSTECH DIGITAL</strong></p>
              <p>📧 sales.systechdigital@gmail.com | 📞 +91 7709803412</p>
              <p>🌐 www.systechdigital.co.in</p>
              <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  payment_success: (data: any) => ({
    subject: "Payment Successful - OTT Key Processing - SYSTECH DIGITAL",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Successful</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a34a, #000); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #dcfce7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #16a34a; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Successful!</h1>
            <p>SYSTECH DIGITAL</p>
          </div>
          <div class="content">
            <p>Dear <strong>${data.firstName} ${data.lastName}</strong>,</p>
            
            <div class="success-box">
              <h3>🎉 Payment Confirmed!</h3>
              <p>Your payment of ₹99 has been successfully processed. Your OTT claim is now being reviewed by our team.</p>
            </div>
            
            <div class="info-box">
              <h3>📋 Payment Details:</h3>
              <p><strong>Payment ID:</strong> ${data.paymentId}</p>
              <p><strong>Claim ID:</strong> ${data.id}</p>
              <p><strong>Amount:</strong> ₹99</p>
              <p><strong>Status:</strong> Completed</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="info-box">
              <h3>⏰ What's Next?</h3>
              <p><strong>Your OTT platform key will be provided to you within 24 working hours.</strong></p>
              <p>Our team is now processing your claim and will send you the access details once verified.</p>
            </div>
            
            <p>If you have any questions, please contact us at sales.systechdigital@gmail.com</p>
            
            <div class="footer">
              <p><strong>SYSTECH DIGITAL</strong></p>
              <p>📧 sales.systechdigital@gmail.com | 📞 +91 7709803412</p>
              <p>🌐 www.systechdigital.co.in</p>
              <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  payment_failed: (data: any) => ({
    subject: "Payment Failed - Please Try Again - SYSTECH DIGITAL",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Failed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #000); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .error-box { background: #fef2f2; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Payment Failed</h1>
            <p>SYSTECH DIGITAL</p>
          </div>
          <div class="content">
            <p>Dear <strong>${data.firstName} ${data.lastName}</strong>,</p>
            
            <div class="error-box">
              <h3>⚠️ Payment Could Not Be Processed</h3>
              <p>Unfortunately, your payment for the OTT claim could not be completed. Please fill the form correctly and try again.</p>
            </div>
            
            <div class="info-box">
              <h3>📋 Claim Details:</h3>
              <p><strong>Claim ID:</strong> ${data.claimId}</p>
              <p><strong>Amount:</strong> ₹99</p>
              <p><strong>Status:</strong> Payment Failed</p>
            </div>
            
            <div class="info-box">
              <h3>🔄 Next Steps:</h3>
              <p>1. Please check your payment details and try again</p>
              <p>2. Ensure you have sufficient balance in your account</p>
              <p>3. Contact your bank if the issue persists</p>
              <p>4. You can retry the payment using the same claim ID</p>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/payment?claimId=${data.claimId}" class="button">Retry Payment</a>
            
            <p>If you continue to face issues, please contact us at sales.systechdigital@gmail.com</p>
            
            <div class="footer">
              <p><strong>SYSTECH DIGITAL</strong></p>
              <p>📧 sales.systechdigital@gmail.com | 📞 +91 7709803412</p>
              <p>🌐 www.systechdigital.co.in</p>
              <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  automation_success: (data: any) => ({
    subject: "OTT Key Delivered Successfully - SYSTECH DIGITAL",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTT Key Delivered</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a34a, #000); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #dcfce7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #16a34a; }
          .key-box { background: #1f2937; color: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 Your OTT Key is Ready!</h1>
            <p>SYSTECH DIGITAL</p>
          </div>
          <div class="content">
            <p>Dear <strong>${data.firstName} ${data.lastName}</strong>,</p>
            
            <div class="success-box">
              <h3>🎉 Congratulations!</h3>
              <p>Your OTT platform claim has been successfully processed and your access key is ready!</p>
            </div>
            
            <div class="key-box">
              <h3>🔑 Your OTT Access Key:</h3>
              <h2 style="font-family: monospace; letter-spacing: 2px; margin: 20px 0;">${data.ottCode}</h2>
              <p style="font-size: 14px; opacity: 0.8;">Please save this key securely</p>
            </div>
            
            <div class="success-box">
              <h3>📱 How to Use:</h3>
              <p>1. Download your OTT platform app</p>
              <p>2. Create an account or login</p>
              <p>3. Go to "Redeem Code" or "Activate Subscription"</p>
              <p>4. Enter the key provided above</p>
              <p>5. Enjoy your premium subscription!</p>
            </div>
            
            <p><strong>Note:</strong> This key is valid for one-time use only. Please activate it within 30 days.</p>
            
            <div class="footer">
              <p><strong>SYSTECH DIGITAL</strong></p>
              <p>📧 sales.systechdigital@gmail.com | 📞 +91 7709803412</p>
              <p>🌐 www.systechdigital.co.in</p>
              <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  automation_failed: (data: any) => ({
    subject: "OTT Claim Processing Issue - SYSTECH DIGITAL",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Claim Processing Issue</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #000); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .error-box { background: #fef2f2; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Claim Processing Issue</h1>
            <p>SYSTECH DIGITAL</p>
          </div>
          <div class="content">
            <p>Dear <strong>${data.firstName} ${data.lastName}</strong>,</p>
            
            <div class="error-box">
              <h3>❌ Unable to Process Your Claim</h3>
              <p>We encountered an issue while processing your OTT claim. This could be due to:</p>
              <ul>
                <li>Activation code not found in our database</li>
                <li>Code already claimed by another user</li>
                <li>Invalid or expired activation code</li>
              </ul>
            </div>
            
            <div class="info-box">
              <h3>📋 Claim Details:</h3>
              <p><strong>Claim ID:</strong> ${data.id}</p>
              <p><strong>Activation Code:</strong> ${data.activationCode}</p>
              <p><strong>Status:</strong> ${data.ottCodeStatus}</p>
            </div>
            
            <div class="info-box">
              <h3>🔄 Next Steps:</h3>
              <p>1. Please verify your activation code is correct</p>
              <p>2. Check if you have already claimed this code</p>
              <p>3. Contact our support team for manual verification</p>
              <p>4. We will resolve this issue within 24-48 hours</p>
            </div>
            
            <p>Our support team has been notified and will contact you shortly to resolve this issue.</p>
            
            <div class="footer">
              <p><strong>SYSTECH DIGITAL</strong></p>
              <p>📧 sales.systechdigital@gmail.com | 📞 +91 7709803412</p>
              <p>🌐 www.systechdigital.co.in</p>
              <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
}

export async function sendEmail(to: string, subject: string, template: keyof typeof emailTemplates, data: any) {
  try {
    const emailTemplate = emailTemplates[template](data)

    const mailOptions = {
      from: `"SYSTECH DIGITAL" <${process.env.GMAIL_USER}>`,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", { to, subject, messageId: result.messageId })
    return result
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

export { emailTemplates }
