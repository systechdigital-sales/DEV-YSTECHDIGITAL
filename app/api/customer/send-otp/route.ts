import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

// Rate limiting storage (in production, use Redis or database)
const otpAttempts = new Map<string, { count: number; resetTime: number }>()

export async function POST(request: NextRequest) {
  try {
    console.log("=== SEND OTP REQUEST START ===")
    const { email } = await request.json()
    console.log("Received email:", email)

    if (!email) {
      console.log("Error: No email provided")
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    console.log("Normalized email:", normalizedEmail)

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      console.log("Error: Invalid email format")
      return NextResponse.json({ success: false, message: "Please enter a valid email address" }, { status: 400 })
    }

    // Rate limiting check
    const now = Date.now()
    const attemptKey = normalizedEmail
    const attempts = otpAttempts.get(attemptKey)

    if (attempts && attempts.count >= 3 && now < attempts.resetTime) {
      const remainingTime = Math.ceil((attempts.resetTime - now) / 1000 / 60)
      return NextResponse.json(
        {
          success: false,
          message: `Too many OTP requests. Please try again in ${remainingTime} minutes.`,
        },
        { status: 429 },
      )
    }

    // Reset attempts if time window has passed
    if (attempts && now >= attempts.resetTime) {
      otpAttempts.delete(attemptKey)
    }

    // Connect to database
    let db
    try {
      ;({ db } = await connectToDatabase())
      console.log("Database connection established for send-otp route.")
    } catch (dbError) {
      console.error("Database connection error in send-otp route:", dbError)
      return NextResponse.json(
        { success: false, message: "Failed to connect to the database. Please try again later." },
        { status: 500 },
      )
    }

    // Check if email exists in ottkeys collection - try multiple possible field names
    let ottKey
    try {
      console.log("Searching for OTT key with email:", normalizedEmail)

      // First, let's see what collections exist
      const collections = await db.listCollections().toArray()
      console.log(
        "Available collections:",
        collections.map((c) => c.name),
      )

      // Try different collection names that might exist
      const possibleCollections = ["ottkeys", "ott_keys", "OTTKeys", "keys", "salesrecords", "sales_records"]
      let foundCollection = null

      for (const collectionName of possibleCollections) {
        try {
          const count = await db.collection(collectionName).countDocuments()
          if (count > 0) {
            console.log(`Found collection '${collectionName}' with ${count} documents`)
            foundCollection = collectionName
            break
          }
        } catch (e) {
          // Collection doesn't exist, continue
        }
      }

      if (!foundCollection) {
        console.log("No OTT keys collection found")
        return NextResponse.json(
          {
            success: false,
            message: "No OTT Play key found against your email ID. Please wait or contact the support team.",
            noOttKey: true,
          },
          { status: 404 },
        )
      }

      // Now search in the found collection with multiple possible field names
      const searchQueries = [
        { assignedEmail: normalizedEmail },
        { "Assigned To": normalizedEmail },
        { assignedTo: normalizedEmail },
        { email: normalizedEmail },
        { customerEmail: normalizedEmail },
        { userEmail: normalizedEmail },
        { "Customer Email": normalizedEmail },
        { "User Email": normalizedEmail },
        // Case insensitive searches
        { assignedEmail: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } },
        { "Assigned To": { $regex: new RegExp(`^${normalizedEmail}$`, "i") } },
        { assignedTo: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } },
        { email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } },
        { customerEmail: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } },
        { userEmail: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } },
        { "Customer Email": { $regex: new RegExp(`^${normalizedEmail}$`, "i") } },
        { "User Email": { $regex: new RegExp(`^${normalizedEmail}$`, "i") } },
      ]

      // Try each search query
      for (const query of searchQueries) {
        try {
          ottKey = await db.collection(foundCollection).findOne(query)
          if (ottKey) {
            console.log(`Found OTT key using query:`, query)
            console.log("OTT key document fields:", Object.keys(ottKey))
            break
          }
        } catch (queryError) {
          console.log("Query failed:", query, queryError.message)
          continue
        }
      }

      // If still not found, let's see what documents exist and their structure
      if (!ottKey) {
        console.log("OTT key not found with standard queries. Checking document structure...")
        const sampleDocs = await db.collection(foundCollection).find({}).limit(3).toArray()
        console.log(
          "Sample documents structure:",
          sampleDocs.map((doc) => Object.keys(doc)),
        )

        // Try a broader search to see if email exists anywhere in the documents
        if (sampleDocs.length > 0) {
          const firstDoc = sampleDocs[0]
          const searchFields = Object.keys(firstDoc).filter(
            (key) => key.toLowerCase().includes("email") || key.toLowerCase().includes("assigned"),
          )

          console.log("Found potential email fields:", searchFields)

          for (const field of searchFields) {
            try {
              ottKey = await db.collection(foundCollection).findOne({
                [field]: { $regex: new RegExp(normalizedEmail, "i") },
              })
              if (ottKey) {
                console.log(`Found OTT key using field ${field}`)
                break
              }
            } catch (fieldError) {
              console.log(`Field search failed for ${field}:`, fieldError.message)
            }
          }
        }
      }

      console.log(`Database query for email '${normalizedEmail}' completed. Found OTT key:`, !!ottKey)
    } catch (queryError) {
      console.error("Error querying ottkeys collection:", queryError)
      return NextResponse.json(
        { success: false, message: "Failed to retrieve OTT key information. Please try again later." },
        { status: 500 },
      )
    }

    if (!ottKey) {
      console.log("No OTT key found for email:", normalizedEmail)
      return NextResponse.json(
        {
          success: false,
          message: "No OTT Play key found against your email ID. Please wait or contact the support team.",
          noOttKey: true,
        },
        { status: 404 },
      )
    }

    console.log("OTT key found! Proceeding to generate and send OTP...")

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiryMinutes = 10 // Define OTP expiry in minutes

    // Store OTP in database with expiration (10 minutes)
    const otpExpiry = new Date(Date.now() + otpExpiryMinutes * 60 * 1000)

    try {
      await db.collection("customer_otps").deleteMany({ email: normalizedEmail })
      await db.collection("customer_otps").insertOne({
        email: normalizedEmail,
        otp,
        expiresAt: otpExpiry,
        attempts: 0,
        createdAt: new Date(),
      })
      console.log(`OTP stored for ${normalizedEmail}: ${otp}`)
    } catch (otpDbError) {
      console.error("Error storing OTP in database:", otpDbError)
      return NextResponse.json(
        { success: false, message: "Failed to store OTP. Please try again later." },
        { status: 500 },
      )
    }

    // Create professional OTP email template
    const otpEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTT Login OTP - Systech Digital</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px; 
                background-color: #f8fafc;
            }
            .container { 
                background: #ffffff; 
                border-radius: 12px; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
                overflow: hidden; 
            }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: bold; 
            }
            .content { 
                padding: 40px 30px; 
                text-align: center; 
            }
            .otp-section { 
                background: #f8f9fa; 
                border: 2px dashed #667eea; 
                border-radius: 10px; 
                padding: 30px; 
                margin: 30px 0; 
            }
            .otp-code { 
                font-size: 36px; 
                font-weight: bold; 
                color: #667eea; 
                letter-spacing: 8px; 
                margin-bottom: 10px; 
                font-family: 'Courier New', monospace;
            }
            .otp-label { 
                color: #666; 
                margin: 0; 
                font-size: 14px; 
            }
            .important-notice { 
                background: #fff3cd; 
                border-left: 4px solid #ffc107; 
                padding: 15px; 
                margin: 20px 0; 
                border-radius: 4px; 
                text-align: left;
            }
            .important-notice h4 { 
                margin-top: 0; 
                color: #856404; 
            }
            .important-notice p { 
                margin: 5px 0; 
                color: #856404; 
            }
            .footer { 
                text-align: center; 
                margin-top: 30px; 
                color: #666; 
                font-size: 14px; 
                padding: 20px; 
                border-top: 1px solid #eee; 
            }
            .support-info {
                background: #e3f2fd;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .support-info h4 {
                color: #1976d2;
                margin: 0 0 10px 0;
            }
            .support-info p {
                color: #1976d2;
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Systech Digital</h1>
                <p style="font-size: 18px; margin-top: 10px; opacity: 0.9;">Your OTT Login Verification</p>
            </div>
            
            <div class="content">
                <h2 style="color: #333; margin-bottom: 20px;">Your One-Time Password</h2>
                <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
                    Please use the following OTP to access your OTT dashboard:
                </p>
                
                <div class="otp-section">
                    <div class="otp-code">${otp}</div>
                    <p class="otp-label">Enter this code to access your dashboard</p>
                </div>
                
                <p style="font-size: 14px; color: #777; margin: 20px 0;">
                    This code is valid for the next <strong>${otpExpiryMinutes} minutes</strong> only.
                </p>
                
                <div class="important-notice">
                    <h4>🔒 Security Notice:</h4>
                    <p>• This OTP is for your security. Do not share it with anyone.</p>
                    <p>• If you didn't request this code, please ignore this email.</p>
                    <p>• The code will expire automatically after ${otpExpiryMinutes} minutes.</p>
                </div>
                
                <div class="support-info">
                    <h4>Need Help?</h4>
                    <p><strong>Phone:</strong> +91 7709803412</p>
                    <p><strong>Email:</strong> sales.systechdigital@gmail.com</p>
                    <p style="font-size: 12px; margin-top: 10px;">Available 9 AM - 9 PM IST</p>
                </div>
            </div>
            
            <div class="footer">
                <p style="margin: 0; font-weight: bold;">Thank you for choosing Systech Digital</p>
                <p style="margin: 5px 0 0 0; font-size: 12px;">
                    © ${new Date().getFullYear()} Systech Digital. All rights reserved.<br>
                    Simplifying the Digital Experience
                </p>
            </div>
        </div>
    </body>
    </html>
    `

    // Send OTP email
    console.log("Attempting to send OTP email to:", normalizedEmail)

    try {
      const emailSent = await sendEmail({
        to: normalizedEmail,
        subject: "Your OTT Login OTP - Systech Digital",
        html: otpEmailHtml,
      })

      console.log("Email send result:", emailSent)

      if (!emailSent) {
        console.log("Error: Failed to send email")
        // Clean up the OTP from database since email failed
        try {
          await db.collection("customer_otps").deleteOne({ email: normalizedEmail, otp: otp })
          console.log("Cleaned up OTP from database after email failure")
        } catch (cleanupError) {
          console.error("Error cleaning up OTP:", cleanupError)
        }

        return NextResponse.json(
          {
            success: false,
            message: "Failed to send OTP email. Please check your email address and try again later.",
          },
          { status: 500 },
        )
      }

      // Update rate limiting
      const currentAttempts = otpAttempts.get(attemptKey)
      if (currentAttempts) {
        otpAttempts.set(attemptKey, {
          count: currentAttempts.count + 1,
          resetTime: currentAttempts.resetTime,
        })
      } else {
        otpAttempts.set(attemptKey, {
          count: 1,
          resetTime: now + 15 * 60 * 1000, // 15 minutes
        })
      }

      console.log("=== SEND OTP REQUEST SUCCESS ===")
      return NextResponse.json({
        success: true,
        message: `OTP sent successfully to ${normalizedEmail}. Please check your email and enter the 6-digit code.`,
      })
    } catch (emailError) {
      console.error("Email sending error:", emailError)

      // Clean up the OTP from database since email failed
      try {
        await db.collection("customer_otps").deleteOne({ email: normalizedEmail, otp: otp })
        console.log("Cleaned up OTP from database after email error")
      } catch (cleanupError) {
        console.error("Error cleaning up OTP:", cleanupError)
      }

      return NextResponse.json(
        {
          success: false,
          message: "Failed to send OTP email. Please check your email address and try again later.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("An unexpected error occurred in send-otp route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while sending OTP. Please try again later." },
      { status: 500 },
    )
  }
}
