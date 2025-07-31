import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import ClaimResponse from "@/models/ClaimResponse"
import { sendEmail } from "@/lib/email"

// In-memory store for OTPs (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>()
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Rate limiting: max 3 requests per 15 minutes
function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const key = email.toLowerCase()
  const limit = rateLimitStore.get(key)

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + 15 * 60 * 1000 }) // 15 minutes
    return true
  }

  if (limit.count >= 3) {
    return false
  }

  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    // Check rate limit
    if (!checkRateLimit(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please try again after 15 minutes." },
        { status: 429 },
      )
    }

    // Connect to database and check if customer exists
    await dbConnect()
    const existingClaim = await ClaimResponse.findOne({ email: normalizedEmail })

    if (!existingClaim) {
      return NextResponse.json(
        { success: false, message: "No account found with this email address. Please contact support." },
        { status: 404 },
      )
    }

    // Generate and store OTP
    const otp = generateOTP()
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes

    otpStore.set(normalizedEmail, { otp, expires, attempts: 0 })

    // Send OTP email
    const emailSubject = "Your OTT Dashboard Login Code"
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SYSTECH DIGITAL</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">OTT Dashboard Access</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Your Login Code</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Hello! Use the following code to access your OTT subscription dashboard:
          </p>
          
          <div style="background: #f3f4f6; border: 2px dashed #6b7280; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <div style="font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>⚠️ Security Notice:</strong> This code expires in 10 minutes. Never share this code with anyone.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">Security Tips:</h3>
            <ul style="color: #4b5563; font-size: 14px; line-height: 1.6; padding-left: 20px;">
              <li>This code is valid for 10 minutes only</li>
              <li>Use it immediately to access your dashboard</li>
              <li>Never share this code with anyone</li>
              <li>If you didn't request this, please contact support</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
          <p>Need help? Contact us:</p>
          <p>📞 +91 7709803412 | 📧 sales.systechdigital@gmail.com</p>
          <p style="margin-top: 20px;">© 2024 SYSTECH DIGITAL. All rights reserved.</p>
        </div>
      </div>
    `

    await sendEmail(normalizedEmail, emailSubject, emailBody)

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your email address",
    })
  } catch (error) {
    console.error("Error sending OTP:", error)
    return NextResponse.json(
      { success: false, message: "Failed to send OTP. Please try again later." },
      { status: 500 },
    )
  }
}
