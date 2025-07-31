import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html: string
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const gmailUser = process.env.GMAIL_USER
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailAppPassword) {
    console.error("Email sending failed: GMAIL_USER or GMAIL_APP_PASSWORD environment variables are not set.")
    console.error("Please ensure you are using a Gmail App Password, not your regular password.")
    return false
  }

  try {
    await transporter.sendMail({
      from: `"SYSTECH DIGITAL" <${gmailUser}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
    console.log(`Email sent successfully to ${options.to}`)
    return true
  } catch (error) {
    console.error(`Error sending email to ${options.to}:`, error)
    return false
  }
}
