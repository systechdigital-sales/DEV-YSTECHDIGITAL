import { type NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { connectToDatabase } from "@/lib/mongodb"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "INR", claimId, customerEmail, customerPhone } = await request.json()

    console.log("Creating order for:", { amount, claimId, customerEmail, customerPhone })

    if (!amount || !claimId || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const paymentAttemptsCollection = db.collection("payment_attempts")

    // Create unique identifier for this user (using email + phone combination)
    const userIdentifier = `${customerEmail}_${customerPhone}`

    // Check existing attempts for this user
    const existingAttempts = await paymentAttemptsCollection.findOne({
      userIdentifier,
      claimId,
    })

    const now = new Date()
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000) // 6 hours ago

    if (existingAttempts) {
      // Check if user is in cooldown period
      if (existingAttempts.cooldownUntil && existingAttempts.cooldownUntil > now) {
        const remainingTime = Math.ceil((existingAttempts.cooldownUntil.getTime() - now.getTime()) / (1000 * 60)) // minutes
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

    const options = {
      amount: amount, // Amount should already be in paise
      currency,
      receipt: `receipt_${claimId}`,
      notes: {
        claimId,
        customerEmail,
        customerPhone,
      },
    }

    const order = await razorpay.orders.create(options)
    console.log("Order created successfully:", order.id)

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
        },
        $setOnInsert: {
          createdAt: now,
          userIdentifier,
        },
      },
      { upsert: true },
    )

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
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
