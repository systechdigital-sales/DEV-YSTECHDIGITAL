import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { z } from "zod"

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(10),
  // Honeypot field
  company: z.string().max(0).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = ContactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid form data", issues: parsed.error.flatten() },
        { status: 400 },
      )
    }

    // Simple anti-spam: reject if honeypot is filled
    if (parsed.data.company && parsed.data.company.length > 0) {
      return NextResponse.json({ success: true, message: "Thanks!" })
    }

    const { name, email, phone, subject, message } = parsed.data

    const user = process.env.GMAIL_USER
    const pass = process.env.GMAIL_APP_PASSWORD

    if (!user || !pass) {
      return NextResponse.json({ success: false, message: "Email configuration is not set." }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    })

    const adminTo = "sales.systechdigital@gmail.com"

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <h2 style="margin: 0 0 8px; color: #b91c1c;">New Contact Form Submission</h2>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || "-")}</p>
        <p style="white-space: pre-wrap;"><strong>Message:</strong><br/>${escapeHtml(message)}</p>
        <hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size:12px;color:#555;">Owned by SYSTECH IT SOLUTIONS Pvt. Ltd. • Developed by BYTEWISE CONSULTING LLP</p>
      </div>
    `

    await transporter.sendMail({
      from: `"SYSTECH IT SOLUTIONS Contact" <${user}>`,
      to: adminTo,
      replyTo: email,
      subject: `[SYSTECH Contact] ${subject}`,
      html,
    })

    return NextResponse.json({
      success: true,
      message: "Message sent successfully.",
    })
  } catch (err) {
    console.error("Contact form error:", err)
    return NextResponse.json(
      { success: false, message: "Failed to send your message. Please try again later." },
      { status: 500 },
    )
  }
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
