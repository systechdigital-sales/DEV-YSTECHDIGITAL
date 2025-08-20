import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
  cc?: string[] // keeping the same field name for compatibility
}

interface EmailData {
  to: string
  subject: string
  template: string
  data: Record<string, any>
}

const DEFAULT_BCC_RECIPIENTS = ["Sales.systechdigital@gmail.com"]

const emailTemplates = {
  order_placed: (data: any) => `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Placed Successfully</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 20px; background-color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
              <!-- Changed to light background with black text for Outlook compatibility -->
              <td style="background-color: #f8fafc; color: #000000; padding: 30px; text-align: center; border: 2px solid #3b82f6;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #000000;">📋 Order Placed Successfully!</h1>
                  <p style="margin: 10px 0 0 0; font-size: 16px; color: #000000;">Your OTT code claim has been submitted</p>
              </td>
          </tr>
          
          <!-- Content -->
          <tr>
              <td style="padding: 30px;">
                  <!-- Changed to light background with black text and border -->
                  <div style="background-color: #f8fafc; color: #000000; padding: 12px 24px; border-radius: 25px; border: 2px solid #3b82f6; display: inline-block; margin: 20px 0; font-weight: bold;">✅ Order Confirmed</div>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.customerName},</p>
                  
                  <p style="color: #4a5568; line-height: 1.6;">
                      Thank you for submitting your OTT code claim! Your order has been successfully placed and is now awaiting payment.
                  </p>
                  
                  <!-- Order Details Section -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
                      <tr>
                          <td style="padding: 20px;">
                              <h3 style="color: #2d3748; margin-top: 0;">📋 Order Details</h3>
                              <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Claim ID:</td>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-family: 'Courier New', monospace;">${data.claimId}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Activation Code:</td>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-family: 'Courier New', monospace;">${data.activationCode}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Processing Fee:</td>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-family: 'Courier New', monospace;">₹99</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Order Date:</td>
                                      <td style="padding: 10px 0; color: #2d3748; font-family: 'Courier New', monospace;">${data.date}</td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- Customer Details Section -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
                      <tr>
                          <td style="padding: 20px;">
                              <h3 style="color: #2d3748; margin-top: 0;">👤 Customer Details</h3>
                              <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Name:</td>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-family: 'Courier New', monospace;">${data.customerName}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Email:</td>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-family: 'Courier New', monospace;">${data.email}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Phone:</td>
                                      <td style="padding: 10px 0; color: #2d3748; font-family: 'Courier New', monospace;">${data.phone}</td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- Next Steps -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e6fffa; border: 1px solid #81e6d9; margin: 20px 0; border-radius: 8px;">
                      <tr>
                          <td style="padding: 20px;">
                              <h4 style="color: #234e52; margin: 0 0 15px 0;">💳 Next Steps</h4>
                              <ul style="margin: 0; padding-left: 20px; color: #2d3748;">
                                  <li style="margin-bottom: 8px;">Complete the payment of ₹99 to activate your claim</li>
                                  <li style="margin-bottom: 8px;">After successful payment, your claim will be processed automatically</li>
                                  <li style="margin-bottom: 8px;">You'll receive your OTT code within 24-48 hours via email</li>
                                  <li style="margin-bottom: 8px;">Keep this email for your records</li>
                              </ul>
                          </td>
                      </tr>
                  </table>
                  
                  <p style="color: #4a5568; line-height: 1.6; margin-top: 25px;">
                      If you have any questions, please don't hesitate to contact our support team.
                  </p>
                  
                  <!-- Processing Fee Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #f7fafc; border-radius: 8px;">
                      <tr>
                          <td style="padding: 20px; text-align: center;">
                              <p style="margin: 0; color: #2d3748; font-size: 18px; font-weight: bold;">Processing Fee: ₹99</p>
                              <p style="margin: 5px 0 0 0; color: #718096; font-size: 14px;">One-time payment</p>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
          
          <!-- Footer -->
          <tr>
              <td style="text-align: center; padding: 30px; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0;">Thank you for choosing SYSTECH DIGITAL</p>
                  <p style="margin: 5px 0 0 0;">📞 +91 7709803412 | ✉️ sales.systechdigital@gmail.com</p>
                  <p style="margin: 10px 0 0 0; font-size: 12px;">This is an automated email. Please do not reply to this message.</p>
              </td>
          </tr>
      </table>
  </body>
  </html>`,
  payment_success_detailed: (data: any) => `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 20px; background-color: #f0fff4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
              <!-- Changed to light background with black text for Outlook compatibility -->
              <td style="background-color: #f0fff4; color: #000000; padding: 30px; text-align: center; border: 2px solid #10b981;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #000000;">🎉 Payment Successful!</h1>
                  <p style="margin: 10px 0 0 0; font-size: 16px; color: #000000;">Your OTT code claim is being processed</p>
              </td>
          </tr>
          
          <!-- Content -->
          <tr>
              <td style="padding: 30px;">
                  <!-- Changed to light background with black text and border -->
                  <div style="background-color: #f0fff4; color: #000000; padding: 12px 24px; border-radius: 25px; border: 2px solid #10b981; display: inline-block; margin: 20px 0; font-weight: bold;">✅ Payment Confirmed</div>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.customerName},</p>
                  
                  <p style="color: #374151; line-height: 1.6;">
                      Excellent! Your payment has been successfully processed. Your OTT code claim is now in our processing queue and will be handled automatically within the next 24-48 hours.
                  </p>
                  
                  <!-- Transaction Details Section -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fff4; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981;">
                      <tr>
                          <td style="padding: 20px;">
                              <h3 style="color: #065f46; margin-top: 0;">🔍 Transaction Details</h3>
                              <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5; font-weight: bold; color: #065f46;">Payment ID:</td>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5; color: #047857; font-family: 'Courier New', monospace;">${data.paymentId}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5; font-weight: bold; color: #065f46;">Order ID:</td>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5; color: #047857; font-family: 'Courier New', monospace;">${data.orderId}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5; font-weight: bold; color: #065f46;">Claim ID:</td>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5; color: #047857; font-family: 'Courier New', monospace;">${data.claimId}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5; font-weight: bold; color: #065f46;">Amount Paid:</td>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5; color: #047857; font-family: 'Courier New', monospace;">${data.amount}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; font-weight: bold; color: #065f46;">Payment Date:</td>
                                      <td style="padding: 8px 0; color: #047857; font-family: 'Courier New', monospace;">${data.date}</td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- Customer Information Section -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fff4; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981;">
                      <tr>
                          <td style="padding: 20px;">
                              <h3 style="color: #065f46; margin-top: 0;">👤 Customer Information</h3>
                              <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5; font-weight: bold; color: #065f46;">Name:</td>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5; color: #047857; font-family: 'Courier New', monospace;">${data.customerName}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5; font-weight: bold; color: #065f46;">Email:</td>
                                      <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5; color: #047857; font-family: 'Courier New', monospace;">${data.email}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 10px 0; font-weight: bold; color: #065f46;">Phone:</td>
                                      <td style="padding: 10px 0; color: #047857; font-family: 'Courier New', monospace;">${data.phone}</td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- What Happens Next -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 1px solid #f59e0b; margin: 20px 0; border-radius: 8px;">
                      <tr>
                          <td style="padding: 20px;">
                              <h4 style="color: #92400e; margin: 0 0 15px 0;">📱 What Happens Next?</h4>
                              <p style="margin: 0 0 10px 0; color: #78350f;"><strong>Automated Processing:</strong> Your claim will be processed automatically.</p>
                              <p style="margin: 0 0 10px 0; color: #78350f;"><strong>Timeline:</strong> You will receive your OTT activation code within 24-48 hours.</p>
                              <p style="margin: 0 0 10px 0; color: #78350f;"><strong>Delivery:</strong> The code will be sent to this email address (${data.email}).</p>
                              <p style="margin: 0; color: #78350f;"><strong>Support:</strong> Our team is monitoring all claims to ensure smooth processing.</p>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- Pro Tip -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e0f2fe; margin: 20px 0; border-radius: 8px; border-left: 4px solid #0284c7;">
                      <tr>
                          <td style="padding: 20px;">
                              <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">💡 Pro Tip</h4>
                              <p style="margin: 0; color: #0c4a6e;">
                                  Add <strong>sales.systechdigital@gmail.com</strong> to your contacts to ensure you receive your OTT code email.
                              </p>
                          </td>
                      </tr>
                  </table>
                  
                  <p style="color: #374151; line-height: 1.6; margin-top: 25px;">
                      Thank you for your trust in SYSTECH DIGITAL. We're committed to delivering your OTT code promptly and securely.
                  </p>
              </td>
          </tr>
          
          <!-- Footer -->
          <tr>
              <td style="text-align: center; padding: 30px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-weight: bold;">SYSTECH DIGITAL</p>
                  <p style="margin: 5px 0;">📞 +91 7709803412 | ✉️ sales.systechdigital@gmail.com</p>
                  <p style="margin: 10px 0 0 0; font-size: 12px;">This is an automated email. Please do not reply to this message.</p>
              </td>
          </tr>
      </table>
  </body>
  </html>`,
  ott_success: (data: any) => `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your OTT Code is Ready!</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 20px; background-color: #f0f9ff;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
              <!-- Changed to light background with black text for Outlook compatibility -->
              <td style="background-color: #f0f9ff; color: #000000; padding: 30px; text-align: center; border: 2px solid #8b5cf6;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #000000;">🎉 Your OTT Code is Ready!</h1>
                  <p style="margin: 10px 0 0 0; font-size: 16px; color: #000000;">Enjoy your premium subscription</p>
              </td>
          </tr>
          
          <!-- Content -->
          <tr>
              <td style="padding: 30px;">
                  <!-- Changed to light background with black text and border -->
                  <div style="background-color: #f0f9ff; color: #000000; padding: 12px 24px; border-radius: 25px; border: 2px solid #8b5cf6; display: inline-block; margin: 20px 0; font-weight: bold;">✅ Code Delivered</div>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.customerName},</p>
                  
                  <p style="color: #374151; line-height: 1.6;">
                      Fantastic news! Your OTT subscription claim has been processed successfully. Here's your premium activation code:
                  </p>
                  
                  <!-- Changed to light background with black text and border -->
                  <div style="background-color: #fef3c7; color: #000000; padding: 8px 16px; border-radius: 20px; border: 2px solid #f59e0b; font-size: 14px; font-weight: bold; margin: 15px 0; display: inline-block;">${data.platform || "OTT Platform"}</div>
                  
                  <!-- OTT Code Section -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; margin: 25px 0; border-radius: 12px; border: 2px solid #667eea;">
                      <tr>
                          <td style="padding: 30px; text-align: center;">
                              <!-- Changed to black text for visibility -->
                              <p style="color: #000000; margin: 0 0 15px 0; font-size: 16px;">Your Activation Code</p>
                              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; border: 3px solid #000000;">
                                  <tr>
                                      <td style="padding: 20px; text-align: center;">
                                          <!-- Ensured black text for maximum visibility -->
                                          <h1 style="color: #000000; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 3px; font-family: 'Courier New', monospace;">${data.ottCode}</h1>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- Instructions Section -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; margin: 25px 0; border-radius: 10px; border-left: 4px solid #3b82f6;">
                      <tr>
                          <td style="padding: 25px;">
                              <h3 style="color: #1e40af; margin: 0 0 20px 0;">📱 How to Redeem Your Code</h3>
                              <ol style="color: #1e40af; line-height: 1.8; margin: 0; padding-left: 20px;">
                                  <li style="margin-bottom: 8px;">Download the <a href="https://www.ottplay.com/partner/systech-it-solution/ott_sustech_annualtest" style="color: #1e40af;">OTT Play app</a> from your device's app store</li>
                                  <li style="margin-bottom: 8px;">Open the app and create an account or sign in to your existing account</li>
                                  <li style="margin-bottom: 8px;">Look for "Redeem Code", "Activate Subscription", or "Promo Code" option</li>
                                  <li style="margin-bottom: 8px;">Enter your activation code: <strong>${data.ottCode}</strong></li>
                                  <li style="margin-bottom: 8px;">Follow the on-screen instructions to complete activation</li>
                                  <li style="margin-bottom: 8px;">Start enjoying your premium content immediately!</li>
                              </ol>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- Order Summary Section -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; margin: 20px 0; border-radius: 8px;">
                      <tr>
                          <td style="padding: 20px;">
                              <h3 style="color: #2d3748; margin-top: 0;">📋 Order Summary</h3>
                              <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Claim ID:</td>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-family: 'Courier New', monospace;">${data.claimId}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Platform:</td>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-family: 'Courier New', monospace;">${data.platform || "OTT Platform"}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Activation Code:</td>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-family: 'Courier New', monospace;">${data.ottCode}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Original Code:</td>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-family: 'Courier New', monospace;">${data.activationCode}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Processed On:</td>
                                      <td style="padding: 8px 0; color: #2d3748; font-family: 'Courier New', monospace;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- Important Instructions -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 1px solid #f59e0b; margin: 20px 0; border-radius: 8px;">
                      <tr>
                          <td style="padding: 20px;">
                              <h4 style="color: #92400e; margin: 0 0 10px 0;">⚠️ Important Instructions</h4>
                              <p style="margin: 0 0 10px 0; color: #78350f;"><strong>Save this email:</strong> Keep this email safe for future reference. You may need the activation code again.</p>
                              <p style="margin: 0 0 10px 0; color: #78350f;"><strong>One-time use:</strong> This activation code can only be used once. Do not share it with others.</p>
                              <p style="margin: 0 0 10px 0; color: #78350f;"><strong>Validity:</strong> Please redeem your code as soon as possible to avoid any expiration issues.</p>
                              <p style="margin: 0; color: #78350f;"><strong>Support:</strong> If you face any issues during activation, contact us with your Claim ID.</p>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- Enjoy Premium Experience -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dcfce7; margin: 20px 0; border-radius: 8px;">
                      <tr>
                          <td style="padding: 20px; text-align: center;">
                              <h4 style="color: #166534; margin: 0 0 10px 0;">🌟 Enjoy Your Premium Experience!</h4>
                              <p style="margin: 0; color: #166534;">
                                  You now have access to premium content, ad-free streaming, and exclusive features.
                              </p>
                          </td>
                      </tr>
                  </table>
                  
                  <p style="color: #374151; line-height: 1.6; margin-top: 25px;">
                      Thank you for choosing SYSTECH DIGITAL. We hope you enjoy your premium OTT experience!
                  </p>
              </td>
          </tr>
          
          <!-- Footer -->
          <tr>
              <td style="text-align: center; padding: 30px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-weight: bold;">SYSTECH DIGITAL</p>
                  <p style="margin: 5px 0;">📞 +91 7709803412 | ✉️ sales.systechdigital@gmail.com</p>
                  <p style="margin: 10px 0 0 0; font-size: 12px;">This is an automated email. Please do not reply to this message.</p>
              </td>
          </tr>
      </table>
  </body>
  </html>`,
  ott_failure: (data: any) => `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTT Code Processing Issue</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 20px; background-color: #fef2f2;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
              <!-- Changed to light background with black text for Outlook compatibility -->
              <td style="background-color: #fef3c7; color: #000000; padding: 30px; text-align: center; border: 2px solid #f59e0b;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #000000;">⚠️ Processing Issue Detected</h1>
                  <p style="margin: 10px 0 0 0; font-size: 16px; color: #000000;">Your OTT code claim needs attention</p>
              </td>
          </tr>
          
          <!-- Content -->
          <tr>
              <td style="padding: 30px;">
                  <!-- Changed to light background with black text and border -->
                  <div style="background-color: #fef3c7; color: #000000; padding: 12px 24px; border-radius: 25px; border: 2px solid #f59e0b; display: inline-block; margin: 20px 0; font-weight: bold;">🔄 Action Required</div>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.customerName},</p>
                  
                  <p style="color: #374151; line-height: 1.6;">
                      We encountered an issue while processing your OTT code claim. Don't worry - your payment is completely secure, and we're working to resolve this immediately.
                  </p>
                  
                  <!-- Issue Details -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 1px solid #f59e0b; margin: 20px 0; border-radius: 8px;">
                      <tr>
                          <td style="padding: 20px;">
                              <h4 style="color: #92400e; margin: 0 0 15px 0;">❌ Issue Details</h4>
                              <p style="margin: 0 0 10px 0; color: #78350f;"><strong>Problem:</strong> ${data.failureReason || "Technical processing error occurred"}</p>
                              <p style="margin: 0 0 10px 0; color: #78350f;"><strong>Status:</strong> ${data.status || "Under Investigation"}</p>
                              ${data.step ? `<p style="margin: 0 0 10px 0; color: #78350f;"><strong>Failed at Step:</strong> ${data.step}</p>` : ""}
                              <p style="margin: 0; color: #78350f;"><strong>Detected:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- Claim Information -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; margin: 20px 0; border-radius: 8px;">
                      <tr>
                          <td style="padding: 20px;">
                              <h3 style="color: #2d3748; margin-top: 0;">📋 Claim Information</h3>
                              <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Claim ID:</td>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-family: monospace;">${data.claimId}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Customer Name:</td>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-family: monospace;">${data.customerName}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Email:</td>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-family: monospace;">${data.email}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Activation Code:</td>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-family: monospace;">${data.activationCode || "Not available"}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Issue Date:</td>
                                      <td style="padding: 8px 0; color: #2d3748; font-family: monospace;">${data.date || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- What We're Doing -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dbeafe; border: 1px solid #93c5fd; margin: 20px 0; border-radius: 8px;">
                      <tr>
                          <td style="padding: 20px;">
                              <h4 style="color: #1e40af; margin: 0 0 15px 0;">🔧 What We're Doing</h4>
                              <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                                  <li style="margin-bottom: 8px;"><strong>Automatic Notification:</strong> Our technical team has been immediately alerted</li>
                                  <li style="margin-bottom: 8px;"><strong>Priority Processing:</strong> Your claim is now in our priority queue</li>
                                  <li style="margin-bottom: 8px;"><strong>Payment Security:</strong> Your payment is safe and will not be charged again</li>
                                  <li style="margin-bottom: 8px;"><strong>Resolution Timeline:</strong> We'll resolve this within 24 hours maximum</li>
                                  <li style="margin-bottom: 8px;"><strong>Automatic Retry:</strong> Our system will automatically retry processing your claim</li>
                              </ul>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- Need Immediate Assistance -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #86efac; margin: 20px 0; border-radius: 8px;">
                      <tr>
                          <td style="padding: 20px;">
                              <h4 style="color: #166534; margin: 0 0 15px 0;">📞 Need Immediate Assistance?</h4>
                              <p style="margin: 0 0 10px 0; color: #166534;">Our support team is ready to help you immediately:</p>
                              <p style="margin: 0 0 10px 0; color: #166534;"><strong>Phone:</strong> +91 7709803412 (Available 9 AM - 9 PM IST)</p>
                              <p style="margin: 0 0 10px 0; color: #166534;"><strong>Email:</strong> sales.systechdigital@gmail.com</p>
                              <p style="margin: 0 0 10px 0; color: #166534;"><strong>WhatsApp:</strong> +91 7709803412</p>
                              <p style="margin: 0 0 10px 0; color: #166534;"><strong>Reference Number:</strong> ${data.claimId}</p>
                              <p style="margin: 0 0 10px 0; color: #166534;"><strong>Priority Code:</strong> URGENT-OTT-${data.claimId?.slice(-6) || "000000"}</p>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- What You Can Do -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e0f2fe; margin: 20px 0; border-radius: 8px; border-left: 4px solid #0284c7;">
                      <tr>
                          <td style="padding: 20px;">
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
                          </td>
                      </tr>
                  </table>
                  
                  <p style="color: #374151; line-height: 1.6; margin-top: 25px;">
                      We sincerely apologize for this inconvenience and appreciate your patience. Your satisfaction is our priority, and we're committed to resolving this quickly.
                  </p>
              </td>
          </tr>
          
          <!-- Footer -->
          <tr>
              <td style="text-align: center; padding: 30px; color: #6b7280; font-size: 14px;">
                  <p style="margin: 0; font-weight: bold; color: #f59e0b;">SYSTECH DIGITAL - Priority Support</p>
                  <p style="margin: 5px 0;">📞 +91 7709803412 | ✉️ sales.systechdigital@gmail.com</p>
                  <p style="margin: 10px 0 0 0; font-size: 12px;">This is an automated priority alert. Reply to this email for immediate support.</p>
              </td>
          </tr>
      </table>
  </body>
  </html>`,
  otp_login_code: (data: { otp: string; otpExpiryMinutes: number }) => `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your SYSTECH DIGITAL Login Code</title>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 20px; background-color: #f4f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
              <!-- Changed to light background with black text for Outlook compatibility -->
              <td style="background-color: #f0f9ff; color: #000000; padding: 30px; text-align: center; border: 2px solid #1e40af;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #000000;">SYSTECH DIGITAL</h1>
                  <p style="font-size: 18px; margin-top: 10px; color: #000000;">Your Secure Login Code</p>
              </td>
          </tr>
          
          <!-- Content -->
          <tr>
              <td style="padding: 30px; text-align: center;">
                  <p style="font-size: 16px; color: #555555;">Hello,</p>
                  <p style="font-size: 16px; color: #555555;">Please use the following One-Time Password (OTP) to log in to your SYSTECH DIGITAL dashboard:</p>
                  
                  <!-- OTP Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                      <tr>
                          <td style="text-align: center;">
                              <div style="background-color: #e0f2f7; border: 1px solid #b3e5fc; padding: 25px; border-radius: 8px; display: inline-block;">
                                  <span style="font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 6px;">${data.otp}</span>
                              </div>
                          </td>
                      </tr>
                  </table>
                  
                  <p style="font-size: 14px; color: #777777;">This code is valid for the next <strong>${data.otpExpiryMinutes} minutes</strong>.</p>
                  
                  <!-- Important Notice -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border: 1px solid #ffeaa7; margin: 20px 0; border-radius: 5px;">
                      <tr>
                          <td style="padding: 15px; text-align: left;">
                              <h4 style="margin-top: 0; color: #856404;">Important:</h4>
                              <ul style="list-style: disc; padding-left: 20px; margin: 0; color: #6b7280;">
                                  <li>This OTP is for your security. Do not share it with anyone.</li>
                                  <li>If you did not request this code, please ignore this email.</li>
                              </ul>
                          </td>
                      </tr>
                  </table>
                  
                  <p style="font-size: 16px; color: #555555; margin-top: 30px;">Thank you for choosing SYSTECH DIGITAL.</p>
              </td>
          </tr>
          
          <!-- Footer -->
          <tr>
              <td style="text-align: center; padding: 20px; color: #666666; font-size: 12px; border-top: 1px solid #eeeeee;">
                  <p>Need assistance? Contact us:</p>
                  <p>✉️ <a href="mailto:sales.systechdigital@gmail.com" style="color: #1e40af; text-decoration: none;">sales.systechdigital@gmail.com</a></p>
                  <p style="margin-top: 10px; font-size: 12px;">© ${new Date().getFullYear()} SYSTECH DIGITAL. All rights reserved.</p>
              </td>
          </tr>
      </table>
  </body>
  </html>
  `,
  automation_failed: (data: any) => `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTT Code Processing Update</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <tr>
              <!-- Changed to light background with black text for Outlook compatibility -->
              <td style="background-color: #fef3c7; color: #000000; padding: 30px; text-align: center; border: 2px solid #f59e0b; border-radius: 10px 10px 0 0;">
                  <h1 style="color: #000000;">⚠️ Processing Update Required</h1>
                  <p style="color: #000000;">Your OTT code claim needs attention</p>
              </td>
          </tr>
          
          <!-- Content -->
          <tr>
              <td style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                  <!-- Changed to light background with black text and border -->
                  <div style="background-color: #fef3c7; color: #000000; padding: 10px 20px; border-radius: 25px; border: 2px solid #f59e0b; display: inline-block; margin: 20px 0;">🔄 Processing Update</div>
                  
                  <p>Dear ${data.customerName},</p>
                  
                  <p>We encountered an issue while processing your OTT code claim. Don't worry - your payment is secure and we're working to resolve this quickly.</p>
                  
                  <!-- Claim Details -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
                      <tr>
                          <td style="padding: 20px;">
                              <h3>📋 Claim Details</h3>
                              <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555555;">Claim ID:</td>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; color: #333333; font-family: monospace;">${data.claimId}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555555;">Customer Name:</td>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; color: #333333; font-family: monospace;">${data.customerName}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555555;">Email:</td>
                                      <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; color: #333333; font-family: monospace;">${data.email}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; font-weight: bold; color: #555555;">Processing Date:</td>
                                      <td style="padding: 8px 0; color: #333333; font-family: monospace;">${data.date}</td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- Issue Details -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 1px solid #f59e0b; margin: 20px 0; border-radius: 5px;">
                      <tr>
                          <td style="padding: 15px;">
                              <h4>❌ Issue Details</h4>
                              <p><strong>Reason:</strong> ${data.failureReason || "Technical processing error"}</p>
                              <p><strong>Status:</strong> ${data.status || "Under Review"}</p>
                              ${data.step ? `<p><strong>Failed at Step:</strong> ${data.step}</p>` : ""}
                          </td>
                      </tr>
                  </table>
                  
                  <!-- Resolution Steps -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dbeafe; border: 1px solid #93c5fd; margin: 20px 0; border-radius: 5px;">
                      <tr>
                          <td style="padding: 15px;">
                              <h4>🔧 What We're Doing</h4>
                              <ul>
                                  <li>Our technical team has been automatically notified</li>
                                  <li>We're investigating the issue and will resolve it within 24 hours</li>
                                  <li>Your payment is secure and will not be charged again</li>
                                  <li>You'll receive your OTT code once the issue is resolved</li>
                              </ul>
                          </td>
                      </tr>
                  </table>
                  
                  <!-- Support Contact -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dbeafe; border: 1px solid #93c5fd; margin: 20px 0; border-radius: 5px;">
                      <tr>
                          <td style="padding: 15px;">
                              <h4>📞 Need Immediate Help?</h4>
                              <p>If you need immediate assistance, please contact our support team:</p>
                              <ul>
                                  <li><strong>Phone:</strong> +91 7709803412</li>
                                  <li><strong>Email:</strong> sales.systechdigital@gmail.com</li>
                                  <li><strong>Reference:</strong> Claim ID ${data.claimId}</li>
                              </ul>
                          </td>
                      </tr>
                  </table>
                  
                  <p>We apologize for any inconvenience and appreciate your patience while we resolve this matter.</p>
                  
                  <!-- Footer -->
                  <div style="text-align: center; margin-top: 30px; color: #666666; font-size: 14px;">
                      <p>Thank you for choosing SYSTECH DIGITAL</p>
                      <p>This is an automated email. Please do not reply to this message.</p>
                  </div>
              </td>
          </tr>
      </table>
  </body>
  </html>`,
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  console.log("=== EMAIL SEND START ===")
  console.log("[v0] Sending email to:", options.to)
  console.log("[v0] Subject:", options.subject)
  console.log("[v0] HTML content length:", options.html.length)
  console.log("[v0] BCC recipients:", options.cc || "none")

  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  console.log("[v0] Gmail user configured:", !!user)
  console.log("[v0] Gmail password configured:", !!pass)
  console.log("[v0] Gmail user value:", user ? `${user.substring(0, 3)}***@${user.split("@")[1]}` : "not set")

  if (!user || !pass) {
    console.error("[v0] EMAIL CONFIGURATION ERROR: Email credentials not configured")
    console.error("[v0] Please ensure GMAIL_USER and GMAIL_APP_PASSWORD environment variables are set")
    console.error("[v0] GMAIL_USER exists:", !!process.env.GMAIL_USER)
    console.error("[v0] GMAIL_APP_PASSWORD exists:", !!process.env.GMAIL_APP_PASSWORD)
    return false
  }

  try {
    console.log("[v0] Creating Gmail transporter...")
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    console.log("[v0] Verifying transporter configuration...")
    await transporter.verify()
    console.log("[v0] Transporter verified successfully")

    const allBccRecipients = [...DEFAULT_BCC_RECIPIENTS]
    if (options.cc && options.cc.length > 0) {
      allBccRecipients.push(...options.cc)
    }

    const mailOptions = {
      from: `"Systech Digital" <${user}>`,
      to: options.to,
      bcc: allBccRecipients.join(", "), // switched from cc to bcc
      subject: options.subject,
      html: options.html,
    }

    console.log("[v0] Email configuration:", {
      from: mailOptions.from,
      to: mailOptions.to,
      bcc: mailOptions.bcc,
      subject: mailOptions.subject,
      htmlLength: options.html.length,
      bccRecipientsCount: allBccRecipients.length,
    })

    console.log("[v0] Attempting to send email...")
    const result = await transporter.sendMail(mailOptions)

    console.log("[v0] Email sent successfully!")
    console.log("[v0] Message ID:", result.messageId)
    console.log("[v0] Response:", result.response)
    console.log("[v0] BCC recipients included:", allBccRecipients)
    console.log("=== EMAIL SEND SUCCESS ===")
    return true
  } catch (error: any) {
    console.error("=== EMAIL SEND ERROR ===")
    console.error("[v0] Error sending email:", error)
    console.error("[v0] Error type:", typeof error)
    console.error("[v0] Error name:", error?.name)
    console.error("[v0] Error message:", error?.message)
    console.error("[v0] Error code:", error?.code)
    console.error("[v0] Error command:", error?.command)
    console.error("[v0] Error stack:", error?.stack)

    if (error?.code === "EAUTH") {
      console.error("[v0] AUTHENTICATION ERROR: Invalid Gmail credentials")
      console.error("[v0] Check GMAIL_USER and GMAIL_APP_PASSWORD environment variables")
    } else if (error?.code === "ENOTFOUND") {
      console.error("[v0] NETWORK ERROR: Cannot reach Gmail SMTP server")
      console.error("[v0] Check internet connection and firewall settings")
    } else if (error?.code === "ETIMEDOUT") {
      console.error("[v0] TIMEOUT ERROR: Connection to Gmail SMTP server timed out")
    } else if (error?.message?.includes("Invalid login")) {
      console.error("[v0] LOGIN ERROR: Gmail login failed - check app password")
    }

    console.error("=== EMAIL SEND ERROR END ===")
    return false
  }
}

export async function sendTemplatedEmail(emailData: EmailData): Promise<boolean> {
  console.log("[v0] Sending templated email:", {
    to: emailData.to,
    subject: emailData.subject,
    template: emailData.template,
    dataKeys: Object.keys(emailData.data),
  })

  const template = emailTemplates[emailData.template as keyof typeof emailTemplates]

  if (!template) {
    console.error(`[v0] Template '${emailData.template}' not found`)
    console.error("[v0] Available templates:", Object.keys(emailTemplates))
    return false
  }

  console.log("[v0] Template found, generating HTML...")
  const html = template(emailData.data)
  console.log("[v0] Generated HTML length:", html.length)

  const result = await sendEmail({
    to: emailData.to,
    subject: emailData.subject,
    html: html,
  })

  console.log("[v0] Templated email send result:", result)
  return result
}
