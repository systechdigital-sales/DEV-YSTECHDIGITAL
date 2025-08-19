import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json()

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields: to, subject, html" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 })
    }

    // Send the email using the existing email service
    const emailSent = await sendEmail({
      to: to,
      subject: subject,
      html: html,
    })

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${to}`,
    })
  } catch (error) {
    console.error("Manual email send error:", error)
    return NextResponse.json(
      {
        error: "Failed to send manual email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
