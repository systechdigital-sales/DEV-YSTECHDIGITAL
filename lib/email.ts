import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string // For custom HTML templates
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    console.error("GMAIL_USER or GMAIL_APP_PASSWORD environment variables are not set.")
    // In a real application, you might want to throw an error or log this more prominently
    return false // Indicate failure due to missing credentials
  }

  const mailOptions = {
    from: user,
    to: options.to,
    subject: options.subject,
    html: options.html,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Email sent successfully to ${options.to}`)
    return true
  } catch (error) {
    console.error(`Error sending email to ${options.to}:`, error)
    // You might want to log the full error object for debugging
    return false // Indicate failure
  }
}
