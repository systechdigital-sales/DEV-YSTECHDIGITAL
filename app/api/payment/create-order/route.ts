import { type NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { connectToDatabase } from "@/lib/mongodb"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

async function logToClient(message: string, data?: any) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/log-client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        data,
        time: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error("Failed to log to client:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "INR", claimId, customerEmail, customerPhone, activationCode } = await request.json()

    console.log("🚀 Payment order creation started:", { amount, claimId, customerEmail, customerPhone })
    await logToClient("Payment order creation started", {
      amount,
      claimId,
      customerEmail,
      customerPhone,
      activationCode
    })

    if (!amount || !claimId || !customerEmail || !customerPhone) {
      console.log("❌ Missing required fields:", {
        amount: !!amount,
        claimId: !!claimId,
        customerEmail: !!customerEmail,
        customerPhone: !!customerPhone,
      })
      await logToClient("Missing required fields validation failed", {
        amount: !!amount,
        claimId: !!claimId,
        customerEmail: !!customerEmail,
        customerPhone: !!customerPhone,
      })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("📊 Connecting to database for payment attempts check...")
    const { db } = await connectToDatabase()
    const paymentAttemptsCollection = db.collection("payment_attempts")

    // Create unique identifier for this user (using email + phone combination)
    const userIdentifier = `${customerEmail}_${customerPhone}`
    console.log("🔍 Checking existing attempts for user:", userIdentifier)

    // Check existing attempts for this user
    const existingAttempts = await paymentAttemptsCollection.findOne({
      userIdentifier,
      claimId,
    })

    console.log(
      "📋 Existing attempts found:",
      existingAttempts ? `${existingAttempts.attemptCount} attempts` : "No previous attempts",
    )

    const now = new Date()
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000) // 6 hours ago

    if (existingAttempts) {
      // Check if user is in cooldown period
      if (existingAttempts.cooldownUntil && existingAttempts.cooldownUntil > now) {
        const remainingTime = Math.ceil((existingAttempts.cooldownUntil.getTime() - now.getTime()) / (1000 * 60)) // minutes
        console.log("⏰ User in cooldown period:", remainingTime, "minutes remaining")
        await logToClient("Payment blocked - user in cooldown", { userIdentifier, remainingTime })
        return NextResponse.json(
          {
            error: "PAYMENT_COOLDOWN",
            message: `You have exceeded the maximum payment attempts. Please wait ${remainingTime} minutes before trying again.`,
            cooldownUntil: existingAttempts.cooldownUntil,
            remainingMinutes: remainingTime,
          },
          { status: 429 },
        )
      }

      // Reset attempts if cooldown period has passed
      if (existingAttempts.cooldownUntil && existingAttempts.cooldownUntil <= now) {
        console.log("🔄 Resetting attempts - cooldown period passed")
        await logToClient("Resetting payment attempts - cooldown expired", { userIdentifier })
        await paymentAttemptsCollection.updateOne(
          { userIdentifier, claimId },
          {
            $set: {
              attemptCount: 0,
              lastAttemptAt: now,
              updatedAt: now,
            },
            $unset: { cooldownUntil: "" },
          },
        )
      }
      // Check if user has reached maximum attempts (3) within any timeframe
      else if (existingAttempts.attemptCount >= 3) {
        // Set 6-hour cooldown
        const cooldownUntil = new Date(now.getTime() + 6 * 60 * 60 * 1000) // 6 hours from now
        console.log("🚫 Maximum attempts reached, setting cooldown until:", cooldownUntil)
        await logToClient("Maximum payment attempts reached - setting cooldown", {
          userIdentifier,
          attemptCount: existingAttempts.attemptCount,
        })

        await paymentAttemptsCollection.updateOne(
          { userIdentifier, claimId },
          {
            $set: {
              cooldownUntil,
              lastAttemptAt: now,
              updatedAt: now,
            },
          },
        )

        return NextResponse.json(
          {
            error: "PAYMENT_LIMIT_EXCEEDED",
            message: "You have exceeded the maximum payment attempts (3). Please wait for 6 hours before trying again.",
            cooldownUntil,
            remainingMinutes: 360, // 6 hours in minutes
          },
          { status: 429 },
        )
      }
    }

    console.log("💳 Creating Razorpay order with options...")
    const options = {
      amount: amount, // Amount should already be in paise
      currency,
      receipt: `receipt_${claimId}`,
      notes: {
        claimId,
        customerEmail,
        customerPhone,
        activationCode
      },
    }

    console.log("📝 Razorpay order options:", options)
    await logToClient("Creating Razorpay order", { options })

    const order = await razorpay.orders.create(options)
    console.log("✅ Razorpay order created successfully:", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
    await logToClient("Razorpay order created successfully", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })

    console.log("📊 Updating payment attempts in database...")
    await paymentAttemptsCollection.updateOne(
      { userIdentifier, claimId },
      {
        $inc: { attemptCount: 1 },
        $set: {
          lastAttemptAt: now,
          updatedAt: now,
          customerEmail,
          customerPhone,
          claimId,
          activationCode
        },
        $setOnInsert: {
          createdAt: now,
          userIdentifier,
        },
      },
      { upsert: true },
    )

    console.log("🎉 Payment order creation completed successfully")
    await logToClient("Payment order creation completed", { orderId: order.id, claimId })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    })
  } catch (error) {
    console.error("💥 Error creating Razorpay order:", error)
    await logToClient("Error creating Razorpay order", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}