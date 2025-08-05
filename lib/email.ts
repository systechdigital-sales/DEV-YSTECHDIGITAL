import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  template:
    | "custom"
    | "default"
    | "payment_success_detailed"
    | "otp_login_code"
    | "order_placed"
    | "automation_failed"
    | "ott_success"
    | "ott_failure"
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
    // Data for OTT success
    ottCode?: string
    platform?: string
    activationCode?: string
    // Data for failure emails
    failureReason?: string
    status?: string
    step?: string
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
  // 1. Order Placed Email (After form submission)
  order_placed: (data: any) => `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Placed Successfully</title>
      <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
          .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 30px; }
          .order-badge { background: #3b82f6; color: white; padding: 12px 24px; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .details-section { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #4a5568; }
          .detail-value { color: #2d3748; font-family: 'Courier New', monospace; }
          .next-steps { background: #e6fffa; border: 1px solid #81e6d9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .next-steps h4 { color: #234e52; margin: 0 0 15px 0; }
          .next-steps ul { margin: 0; padding-left: 20px; color: #2d3748; }
          .next-steps li { margin-bottom: 8px; }
          .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>📋 Order Placed Successfully!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your OTT code claim has been submitted</p>
          </div>
          
          <div class="content">
              <div class="order-badge">✅ Order Confirmed</div>
              
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.customerName},</p>
              
              <p style="color: #4a5568; line-height: 1.6;">
                  Thank you for submitting your OTT code claim! Your order has been successfully placed and is now awaiting payment.
              </p>
              
              <div class="details-section">
                  <h3 style="color: #2d3748; margin-top: 0;">📋 Order Details</h3>
                  <div class="detail-row">
                      <span class="detail-label">Claim ID:</span>
                      <span class="detail-value">${data.claimId}</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Activation Code:</span>
                      <span class="detail-value">${data.activationCode}</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Processing Fee:</span>
                      <span class="detail-value">₹99</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Order Date:</span>
                      <span class="detail-value">${data.date}</span>
                  </div>
              </div>
              
              <div class="details-section">
                  <h3 style="color: #2d3748; margin-top: 0;">👤 Customer Details</h3>
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
              </div>
              
              <div class="next-steps">
                  <h4>💳 Next Steps</h4>
                  <ul>
                      <li>Complete the payment of ₹99 to activate your claim</li>
                      <li>After successful payment, your claim will be processed automatically</li>
                      <li>You'll receive your OTT code within 24-48 hours via email</li>
                      <li>Keep this email for your records</li>
                  </ul>
              </div>
              
              <p style="color: #4a5568; line-height: 1.6; margin-top: 25px;">
                  If you have any questions, please don't hesitate to contact our support team.
              </p>
              
              <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f7fafc; border-radius: 8px;">
                  <p style="margin: 0; color: #2d3748; font-size: 18px; font-weight: bold;">Processing Fee: ₹99</p>
                  <p style="margin: 5px 0 0 0; color: #718096; font-size: 14px;">One-time payment • Includes all taxes</p>
              </div>
          </div>
          
          <div class="footer">
              <p style="margin: 0;">Thank you for choosing SYSTECH DIGITAL</p>
              <p style="margin: 5px 0 0 0;">📞 +91 7709803412 | ✉️ sales.systechdigital@gmail.com</p>
              <p style="margin: 10px 0 0 0; font-size: 12px;">This is an automated email. Please do not reply to this message.</p>
          </div>
      </div>
  </body>
  </html>`,

  // 2. Payment Success Email (After payment completion)
  payment_success_detailed: (data: any) => `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful</title>
      <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0fff4; }
          .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 30px; }
          .success-badge { background: #10b981; color: white; padding: 12px 24px; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .details-section { background: #f0fff4; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #d1fae5; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #065f46; }
          .detail-value { color: #047857; font-family: 'Courier New', monospace; }
          .important-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .important-notice h4 { color: #92400e; margin: 0 0 15px 0; }
          .important-notice p { margin: 0 0 10px 0; color: #78350f; }
          .important-notice p:last-child { margin: 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>🎉 Payment Successful!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your OTT code claim is being processed</p>
          </div>
          
          <div class="content">
              <div class="success-badge">✅ Payment Confirmed</div>
              
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.customerName},</p>
              
              <p style="color: #374151; line-height: 1.6;">
                  Excellent! Your payment has been successfully processed. Your OTT code claim is now in our processing queue and will be handled automatically within the next 24-48 hours.
              </p>
              
              <div class="details-section">
                  <h3 style="color: #065f46; margin-top: 0;">🔍 Transaction Details</h3>
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
                  <div class="detail-row">
                      <span class="detail-label">Payment Date:</span>
                      <span class="detail-value">${data.date}</span>
                  </div>
              </div>
              
              <div class="details-section">
                  <h3 style="color: #065f46; margin-top: 0;">👤 Customer Information</h3>
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
              </div>
              
              <div class="important-notice">
                  <h4>📱 What Happens Next?</h4>
                  <p><strong>Automated Processing:</strong> Your claim will be processed automatically by our system.</p>
                  <p><strong>Timeline:</strong> You will receive your OTT activation code within 24-48 hours.</p>
                  <p><strong>Delivery:</strong> The code will be sent to this email address (${data.email}).</p>
                  <p><strong>Support:</strong> Our team is monitoring all claims to ensure smooth processing.</p>
              </div>
              
              <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
                  <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">💡 Pro Tip</h4>
                  <p style="margin: 0; color: #0c4a6e;">
                      Add <strong>sales.systechdigital@gmail.com</strong> to your contacts to ensure you receive your OTT code email.
                  </p>
              </div>
              
              <p style="color: #374151; line-height: 1.6; margin-top: 25px;">
                  Thank you for your trust in SYSTECH DIGITAL. We're committed to delivering your OTT code promptly and securely.
              </p>
          </div>
          
          <div class="footer">
              <p style="margin: 0; font-weight: bold;">SYSTECH DIGITAL</p>
              <p style="margin: 5px 0;">📞 +91 7709803412 | ✉️ sales.systechdigital@gmail.com</p>
              <p style="margin: 10px 0 0 0; font-size: 12px;">This is an automated email. Please do not reply to this message.</p>
          </div>
      </div>
  </body>
  </html>`,

  // 3. OTT Success Email (After automation runs successfully)
  ott_success: (data: any) => `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your OTT Code is Ready!</title>
      <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f9ff; }
          .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 30px; }
          .success-badge { background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .ott-code-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center; }
          .ott-code-label { color: white; margin: 0 0 15px 0; font-size: 16px; opacity: 0.9; }
          .ott-code-box { background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; border: 2px dashed rgba(255,255,255,0.5); }
          .ott-code { color: white; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 3px; font-family: 'Courier New', monospace; }
          .platform-badge { background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin: 15px 0; display: inline-block; }
          .instructions-section { background: #f0f9ff; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #3b82f6; }
          .instructions-section h3 { color: #1e40af; margin: 0 0 20px 0; }
          .instructions-section ol { color: #1e40af; line-height: 1.8; margin: 0; padding-left: 20px; }
          .instructions-section li { margin-bottom: 8px; }
          .details-section { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #4a5568; }
          .detail-value { color: #2d3748; font-family: 'Courier New', monospace; }
          .important-note { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .important-note h4 { color: #92400e; margin: 0 0 10px 0; }
          .important-note p { margin: 0; color: #78350f; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>🎉 Your OTT Code is Ready!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Enjoy your premium subscription</p>
          </div>
          
          <div class="content">
              <div class="success-badge">✅ Code Delivered</div>
              
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.customerName},</p>
              
              <p style="color: #374151; line-height: 1.6;">
                  Fantastic news! Your OTT subscription claim has been processed successfully. Here's your premium activation code:
              </p>
              
              <div class="platform-badge">${data.platform || "OTT Platform"}</div>
              
              <div class="ott-code-section">
                  <p class="ott-code-label">Your Activation Code</p>
                  <div class="ott-code-box">
                      <h1 class="ott-code">${data.ottCode}</h1>
                  </div>
              </div>
              
              <div class="instructions-section">
                  <h3>📱 How to Redeem Your Code</h3>
                  <ol>
                      <li>Download the <strong>${data.platform || "OTT"}</strong> app from your device's app store</li>
                      <li>Open the app and create an account or sign in to your existing account</li>
                      <li>Look for "Redeem Code", "Activate Subscription", or "Promo Code" option</li>
                      <li>Enter your activation code: <strong>${data.ottCode}</strong></li>
                      <li>Follow the on-screen instructions to complete activation</li>
                      <li>Start enjoying your premium content immediately!</li>
                  </ol>
              </div>
              
              <div class="details-section">
                  <h3 style="color: #2d3748; margin-top: 0;">📋 Order Summary</h3>
                  <div class="detail-row">
                      <span class="detail-label">Claim ID:</span>
                      <span class="detail-value">${data.claimId}</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Platform:</span>
                      <span class="detail-value">${data.platform || "OTT Platform"}</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Activation Code:</span>
                      <span class="detail-value">${data.ottCode}</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Original Code:</span>
                      <span class="detail-value">${data.activationCode}</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Processed On:</span>
                      <span class="detail-value">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                  </div>
              </div>
              
              <div class="important-note">
                  <h4>⚠️ Important Instructions</h4>
                  <p><strong>Save this email:</strong> Keep this email safe for future reference. You may need the activation code again.</p>
                  <p><strong>One-time use:</strong> This activation code can only be used once. Do not share it with others.</p>
                  <p><strong>Validity:</strong> Please redeem your code as soon as possible to avoid any expiration issues.</p>
                  <p><strong>Support:</strong> If you face any issues during activation, contact us with your Claim ID.</p>
              </div>
              
              <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <h4 style="color: #166534; margin: 0 0 10px 0;">🌟 Enjoy Your Premium Experience!</h4>
                  <p style="margin: 0; color: #166534;">
                      You now have access to premium content, ad-free streaming, and exclusive features.
                  </p>
              </div>
              
              <p style="color: #374151; line-height: 1.6; margin-top: 25px;">
                  Thank you for choosing SYSTECH DIGITAL. We hope you enjoy your premium OTT experience!
              </p>
          </div>
          
          <div class="footer">
              <p style="margin: 0; font-weight: bold;">SYSTECH DIGITAL</p>
              <p style="margin: 5px 0;">📞 +91 7709803412 | ✉️ sales.systechdigital@gmail.com</p>
              <p style="margin: 10px 0 0 0; font-size: 12px;">This is an automated email. Please do not reply to this message.</p>
          </div>
      </div>
  </body>
  </html>`,

  // 4. OTT Failure Email (When automation fails)
  ott_failure: (data: any) => `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTT Code Processing Issue</title>
      <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef2f2; }
          .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 30px; }
          .warning-badge { background: #f59e0b; color: white; padding: 12px 24px; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .error-section { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .error-section h4 { color: #92400e; margin: 0 0 15px 0; }
          .error-section p { margin: 0 0 10px 0; color: #78350f; }
          .error-section p:last-child { margin: 0; }
          .details-section { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #4a5568; }
          .detail-value { color: #2d3748; font-family: 'Courier New', monospace; }
          .resolution-section { background: #dbeafe; border: 1px solid #93c5fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .resolution-section h4 { color: #1e40af; margin: 0 0 15px 0; }
          .resolution-section ul { margin: 0; padding-left: 20px; color: #1e40af; }
          .resolution-section li { margin-bottom: 8px; }
          .support-section { background: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .support-section h4 { color: #166534; margin: 0 0 15px 0; }
          .support-section p { margin: 0 0 10px 0; color: #166534; }
          .support-section p:last-child { margin: 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>⚠️ Processing Issue Detected</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your OTT code claim needs attention</p>
          </div>
          
          <div class="content">
              <div class="warning-badge">🔄 Action Required</div>
              
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.customerName},</p>
              
              <p style="color: #374151; line-height: 1.6;">
                  We encountered an issue while processing your OTT code claim. Don't worry - your payment is completely secure, and we're working to resolve this immediately.
              </p>
              
              <div class="error-section">
                  <h4>❌ Issue Details</h4>
                  <p><strong>Problem:</strong> ${data.failureReason || "Technical processing error occurred"}</p>
                  <p><strong>Status:</strong> ${data.status || "Under Investigation"}</p>
                  ${data.step ? `<p><strong>Failed at Step:</strong> ${data.step}</p>` : ""}
                  <p><strong>Detected:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
              </div>
              
              <div class="details-section">
                  <h3 style="color: #2d3748; margin-top: 0;">📋 Claim Information</h3>
                  <div class="detail-row">
                      <span class="detail-label">Claim ID:</span>
                      <span class="detail-value">${data.claimId}</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Customer Name:</span>
                      <span class="detail-value">${data.customerName}</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Email:</span>
                      <span class="detail-value">${data.email}</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Activation Code:</span>
                      <span class="detail-value">${data.activationCode || "Not available"}</span>
                  </div>
                  <div class="detail-row">
                      <span class="detail-label">Issue Date:</span>
                      <span class="detail-value">${data.date || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                  </div>
              </div>
              
              <div class="resolution-section">
                  <h4>🔧 What We're Doing</h4>
                  <ul>
                      <li><strong>Automatic Notification:</strong> Our technical team has been immediately alerted</li>
                      <li><strong>Priority Processing:</strong> Your claim is now in our priority queue</li>
                      <li><strong>Payment Security:</strong> Your payment is safe and will not be charged again</li>
                      <li><strong>Resolution Timeline:</strong> We'll resolve this within 24 hours maximum</li>
                      <li><strong>Automatic Retry:</strong> Our system will automatically retry processing your claim</li>
                  </ul>
              </div>
              
              <div class="support-section">
                  <h4>📞 Need Immediate Assistance?</h4>
                  <p>Our support team is ready to help you immediately:</p>
                  <p><strong>Phone:</strong> +91 7709803412 (Available 9 AM - 9 PM IST)</p>
                  <p><strong>Email:</strong> sales.systechdigital@gmail.com</p>
                  <p><strong>WhatsApp:</strong> +91 7709803412</p>
                  <p><strong>Reference Number:</strong> ${data.claimId}</p>
                  <p><strong>Priority Code:</strong> URGENT-OTT-${data.claimId?.slice(-6) || "000000"}</p>
              </div>
              
              <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
                  <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">💡 What You Can Do</h4>
                  <p style="margin: 0 0 10px 0; color: #0c4a6e;">
                      <strong>Wait for Auto-Resolution:</strong> Our system will automatically retry processing your claim.
                  </p>
                  <p style="margin: 0 0 10px 0; color: #0c4a6e;">
                      <strong>Contact Support:</strong> For immediate assistance, use the contact details above.
                  </p>
                  <p style="margin: 0; color: #0c4a6e;">
                      <strong>Check Email:</strong> We'll send you an update as soon as the issue is resolved.
                  </p>
              </div>
              
              <p style="color: #374151; line-height: 1.6; margin-top: 25px;">
                  We sincerely apologize for this inconvenience and appreciate your patience. Your satisfaction is our priority, and we're committed to resolving this quickly.
              </p>
          </div>
          
          <div class="footer">
              <p style="margin: 0; font-weight: bold; color: #f59e0b;">SYSTECH DIGITAL - Priority Support</p>
              <p style="margin: 5px 0;">📞 +91 7709803412 | ✉️ sales.systechdigital@gmail.com</p>
              <p style="margin: 10px 0 0 0; font-size: 12px;">This is an automated priority alert. Reply to this email for immediate support.</p>
          </div>
      </div>
  </body>
  </html>`,

  // Legacy templates for backward compatibility
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
  </html>`,

  automation_failed: (data: any) => `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTT Code Processing Update</title>
      <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { background: #f59e0b; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; }
          .details-section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; font-family: monospace; }
          .error-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .resolution-steps { background: #dbeafe; border: 1px solid #93c5fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
  </head>
  <body>
      <div class="header">
          <h1>⚠️ Processing Update Required</h1>
          <p>Your OTT code claim needs attention</p>
      </div>
      
      <div class="content">
          <div class="status-badge">🔄 Processing Update</div>
          
          <p>Dear ${data.customerName},</p>
          
          <p>We encountered an issue while processing your OTT code claim. Don't worry - your payment is secure and we're working to resolve this quickly.</p>
          
          <div class="details-section">
              <h3>📋 Claim Details</h3>
              <div class="detail-row">
                  <span class="detail-label">Claim ID:</span>
                  <span class="detail-value">${data.claimId}</span>
              </div>
              <div class="detail-row">
                  <span class="detail-label">Customer Name:</span>
                  <span class="detail-value">${data.customerName}</span>
              </div>
              <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${data.email}</span>
              </div>
              <div class="detail-row">
                  <span class="detail-label">Processing Date:</span>
                  <span class="detail-value">${data.date}</span>
              </div>
          </div>
          
          <div class="error-notice">
              <h4>❌ Issue Details</h4>
              <p><strong>Reason:</strong> ${data.failureReason || "Technical processing error"}</p>
              <p><strong>Status:</strong> ${data.status || "Under Review"}</p>
              ${data.step ? `<p><strong>Failed at Step:</strong> ${data.step}</p>` : ""}
          </div>
          
          <div class="resolution-steps">
              <h4>🔧 What We're Doing</h4>
              <ul>
                  <li>Our technical team has been automatically notified</li>
                  <li>We're investigating the issue and will resolve it within 24 hours</li>
                  <li>Your payment is secure and will not be charged again</li>
                  <li>You'll receive your OTT code once the issue is resolved</li>
              </ul>
          </div>
          
          <div class="resolution-steps">
              <h4>📞 Need Immediate Help?</h4>
              <p>If you need immediate assistance, please contact our support team:</p>
              <ul>
                  <li><strong>Phone:</strong> +91 7709803412</li>
                  <li><strong>Email:</strong> sales.systechdigital@gmail.com</li>
                  <li><strong>Reference:</strong> Claim ID ${data.claimId}</li>
              </ul>
          </div>
          
          <p>We apologize for any inconvenience and appreciate your patience while we resolve this matter.</p>
          
          <div class="footer">
              <p>Thank you for choosing SYSTECH DIGITAL</p>
              <p>This is an automated email. Please do not reply to this message.</p>
          </div>
      </div>
  </body>
  </html>`,

  custom: (data: any) => data.html || "",
  default: (data: any) => `<p>This is a default email. Subject: ${data.subject}</p>`,
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
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
    case "order_placed":
      if (!options.data.customerName || !options.data.claimId) {
        console.error("Missing order data for order_placed template.")
        return false
      }
      htmlContent = emailTemplates.order_placed(options.data)
      break
    case "ott_success":
      if (!options.data.customerName || !options.data.ottCode) {
        console.error("Missing OTT success data for ott_success template.")
        return false
      }
      htmlContent = emailTemplates.ott_success(options.data)
      break
    case "ott_failure":
      if (!options.data.customerName || !options.data.claimId) {
        console.error("Missing failure data for ott_failure template.")
        return false
      }
      htmlContent = emailTemplates.ott_failure(options.data)
      break
    case "automation_failed":
      if (!options.data.customerName || !options.data.claimId) {
        console.error("Missing failure data for automation_failed template.")
        return false
      }
      htmlContent = emailTemplates.automation_failed(options.data)
      break
    default:
      htmlContent = emailTemplates.default(options.data)
  }

  const mailOptions = {
    from: `SYSTECH DIGITAL <${user}>`,
    to: options.to,
    subject: options.subject,
    html: htmlContent,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`📧 Email sent successfully to ${options.to}`)
    return true
  } catch (error) {
    console.error(`❌ Error sending email to ${options.to}:`, error)
    return false
  }
}
