import nodemailer from "nodemailer"

// Create a transporter with proper error handling
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  debug: process.env.NODE_ENV === "development", // Enable debug logs in development
  logger: process.env.NODE_ENV === "development", // Enable logger in development
})

export async function sendEmail(to: string, subject: string, template: string, data: any) {
  try {
    let htmlContent = ""

    switch (template) {
      case "claim_submitted":
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #DC2626;">OTT Claim Submitted Successfully</h2>
            <p>Dear ${data.firstName} ${data.lastName},</p>
            <p>Your OTT platform claim has been submitted successfully.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Claim Details:</h3>
              <p><strong>Claim ID:</strong> ${data.id}</p>
              <p><strong>Activation Code:</strong> ${data.activationCode}</p>
              <p><strong>Purchase Type:</strong> ${data.purchaseType}</p>
            </div>
            <p>Next steps:</p>
            <ol>
              <li>Complete the payment of ₹99 processing fee</li>
              <li>Your claim will be processed within 24 working hours</li>
              <li>You will receive your OTT access codes via email</li>
            </ol>
            <p>Thank you for choosing SYSTECH DIGITAL!</p>
          </div>
        `
        break

      case "payment_success":
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16A34A;">Payment Successful!</h2>
            <p>Dear ${data.firstName} ${data.lastName},</p>
            <p>Your payment has been processed successfully.</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16A34A;">
              <h3>Payment Details:</h3>
              <p><strong>Payment ID:</strong> ${data.paymentId}</p>
              <p><strong>Amount:</strong> ₹99</p>
              <p><strong>Status:</strong> Completed</p>
            </div>
            <p><strong>Your OTT platform access codes will be provided to you within 24 working hours.</strong></p>
            <p>We will send you another email once your codes are ready.</p>
            <p>Thank you for your patience!</p>
          </div>
        `
        break

      case "automation_success":
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16A34A;">Your OTT Access Code is Ready!</h2>
            <p>Dear ${data.firstName} ${data.lastName},</p>
            <p>Great news! Your OTT platform access code has been processed and is ready to use.</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16A34A;">
              <h3>Your Access Details:</h3>
              <p><strong>Platform:</strong> ${data.platform}</p>
              <p><strong>Access Code:</strong> <span style="font-family: monospace; background: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${data.ottCode}</span></p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #92400e;">How to use your code:</h4>
              <ol style="color: #92400e;">
                <li>Visit the ${data.platform} website or app</li>
                <li>Go to the subscription or redeem section</li>
                <li>Enter your access code: ${data.ottCode}</li>
                <li>Follow the on-screen instructions to activate</li>
              </ol>
            </div>
            <p>If you face any issues, please contact our support team.</p>
            <p>Enjoy your premium streaming experience!</p>
          </div>
        `
        break

      case "automation_wait":
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #F59E0B;">Processing Your OTT Claim</h2>
            <p>Dear ${data.firstName} ${data.lastName},</p>
            <p>Thank you for your payment. We are currently processing your OTT platform claim.</p>
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <h3>Status Update:</h3>
              <p>Your claim is being reviewed and processed. This may take up to 24 working hours.</p>
              <p><strong>Claim ID:</strong> ${data.id}</p>
              <p><strong>Activation Code:</strong> ${data.activationCode}</p>
            </div>
            <p>We will notify you via email as soon as your OTT access codes are ready.</p>
            <p>Thank you for your patience!</p>
          </div>
        `
        break

      case "automation_failed":
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #DC2626;">OTT Claim Status Update</h2>
            <p>Dear ${data.firstName} ${data.lastName},</p>
            <p>We're processing your OTT platform claim, but we need a bit more time.</p>
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
              <h3>Status Update:</h3>
              <p><strong>Claim ID:</strong> ${data.id}</p>
              <p><strong>Activation Code:</strong> ${data.activationCode}</p>
              <p><strong>Status:</strong> Under Review</p>
            </div>
            <p>Our team is working on your request. This may take up to 24-48 working hours.</p>
            <p>We will notify you via email as soon as your OTT access codes are ready.</p>
            <p>Thank you for your patience!</p>
          </div>
        `
        break

      default:
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>SYSTECH DIGITAL</h2>
            <p>Thank you for contacting us.</p>
          </div>
        `
    }

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: htmlContent,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)
    return result
  } catch (error) {
    console.error("Error sending email to:", to)
    console.error("Email subject:", subject)
    console.error("Email template:", template)
    console.error("Error details:", error)

    // Don't throw the error, just log it and return a failed status
    // This prevents the automation process from failing completely if email sending fails
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
