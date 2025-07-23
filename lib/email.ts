import nodemailer from "nodemailer"

// Create transporter with Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

// Email templates
const getEmailTemplate = (type: string, data: any) => {
  const baseStyle = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #dc2626, #000000); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">SYSTECH DIGITAL</h1>
        <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Your Technology Partner</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  `

  const baseFooter = `
      </div>
      <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
        <p>Contact us: sales.systechdigital@gmail.com | +91-7709803412</p>
        <p>© 2025 SYSTECH DIGITAL. All rights reserved.</p>
      </div>
    </div>
  `

  switch (type) {
    case "form_submitted":
      return (
        baseStyle +
        `
        <h2 style="color: #dc2626; margin-bottom: 20px;">OTT Claim Submitted Successfully!</h2>
        <p>Dear ${data.firstName} ${data.lastName},</p>
        <p>Thank you for submitting your OTT platform claim. We have received your request and it's being processed.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Next Steps:</h3>
          <ol style="color: #374151;">
            <li>Complete the payment of ₹99 processing fee</li>
            <li>Your OTT Play key will be provided within 24 working hours</li>
            <li>Check your email for updates</li>
          </ol>
        </div>
        <p><strong>Activation Code:</strong> ${data.activationCode}</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>SYSTECH DIGITAL Team</p>
      ` +
        baseFooter
      )

    case "payment_success":
      return (
        baseStyle +
        `
        <h2 style="color: #059669; margin-bottom: 20px;">Payment Successful!</h2>
        <p>Dear ${data.firstName} ${data.lastName},</p>
        <p>Your payment of ₹99 has been successfully processed.</p>
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #065f46;">Payment Details:</h3>
          <p style="margin: 5px 0; color: #065f46;"><strong>Payment ID:</strong> ${data.paymentId}</p>
          <p style="margin: 5px 0; color: #065f46;"><strong>Amount:</strong> ₹99</p>
          <p style="margin: 5px 0; color: #065f46;"><strong>Status:</strong> Completed</p>
        </div>
        <p>Your OTT claim is now being processed. You will receive your OTT Play key within 24 working hours.</p>
        <p>Best regards,<br>SYSTECH DIGITAL Team</p>
      ` +
        baseFooter
      )

    case "payment_failed":
      return (
        baseStyle +
        `
        <h2 style="color: #dc2626; margin-bottom: 20px;">Payment Failed</h2>
        <p>Dear ${data.firstName} ${data.lastName},</p>
        <p>Unfortunately, your payment could not be processed. Please check your payment details and try again.</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #991b1b;">What to do next:</h3>
          <ol style="color: #991b1b;">
            <li>Verify your payment information</li>
            <li>Ensure sufficient balance in your account</li>
            <li>Try the payment process again</li>
            <li>Contact our support team if the issue persists</li>
          </ol>
        </div>
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/payment?claimId=${data.claimId}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Retry Payment</a></p>
        <p>Best regards,<br>SYSTECH DIGITAL Team</p>
      ` +
        baseFooter
      )

    case "ott_code_sent":
      return (
        baseStyle +
        `
        <h2 style="color: #059669; margin-bottom: 20px;">Your OTT Code is Ready!</h2>
        <p>Dear ${data.firstName} ${data.lastName},</p>
        <p>Great news! Your OTT platform subscription code has been processed and is ready for use.</p>
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #065f46;">Your OTT Code:</h3>
          <p style="font-size: 18px; font-weight: bold; color: #065f46; background: white; padding: 15px; border-radius: 6px; text-align: center; letter-spacing: 2px;">${data.ottCode}</p>
        </div>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">How to Redeem:</h3>
          <ol style="color: #374151;">
            <li>Visit the OTT platform website or app</li>
            <li>Go to the subscription or redeem section</li>
            <li>Enter the code provided above</li>
            <li>Enjoy your subscription!</li>
          </ol>
        </div>
        <p>If you face any issues with redemption, please contact our support team.</p>
        <p>Best regards,<br>SYSTECH DIGITAL Team</p>
      ` +
        baseFooter
      )

    case "wait_48_hours":
      return (
        baseStyle +
        `
        <h2 style="color: #d97706; margin-bottom: 20px;">Verification in Progress</h2>
        <p>Dear ${data.firstName} ${data.lastName},</p>
        <p>Thank you for your OTT claim submission. We are currently verifying your activation code with our records.</p>
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
          <h3 style="margin-top: 0; color: #92400e;">Please Wait 48 Hours</h3>
          <p style="color: #92400e;">Your activation code is being verified. This process may take up to 48 working hours.</p>
          <p style="color: #92400e;"><strong>Activation Code:</strong> ${data.activationCode}</p>
        </div>
        <p>We will send you another email once the verification is complete with your OTT code or further instructions.</p>
        <p>Thank you for your patience.</p>
        <p>Best regards,<br>SYSTECH DIGITAL Team</p>
      ` +
        baseFooter
      )

    case "already_claimed":
      return (
        baseStyle +
        `
        <h2 style="color: #dc2626; margin-bottom: 20px;">Code Already Used</h2>
        <p>Dear ${data.firstName} ${data.lastName},</p>
        <p>We found that the activation code you provided has already been used for an OTT claim.</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #991b1b;">Code Status:</h3>
          <p style="color: #991b1b;"><strong>Activation Code:</strong> ${data.activationCode}</p>
          <p style="color: #991b1b;"><strong>Status:</strong> Already Claimed</p>
        </div>
        <p>If you believe this is an error or if you have any questions, please contact our sales team immediately.</p>
        <p><strong>Contact Information:</strong></p>
        <ul>
          <li>Email: sales.systechdigital@gmail.com</li>
          <li>Phone: +91-7709803412</li>
        </ul>
        <p>Best regards,<br>SYSTECH DIGITAL Team</p>
      ` +
        baseFooter
      )

    default:
      return (
        baseStyle +
        `
        <h2>Thank you for contacting SYSTECH DIGITAL</h2>
        <p>We have received your request and will get back to you soon.</p>
        <p>Best regards,<br>SYSTECH DIGITAL Team</p>
      ` +
        baseFooter
      )
  }
}

// Send email function
export const sendEmail = async (to: string, subject: string, type: string, data: any) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"SYSTECH DIGITAL" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: getEmailTemplate(type, data),
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
