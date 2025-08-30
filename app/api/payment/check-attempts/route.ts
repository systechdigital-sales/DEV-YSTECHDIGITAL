import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { customerEmail, customerPhone, claimId } = await request.json()

    if (!customerEmail || !customerPhone || !claimId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const paymentAttemptsCollection = db.collection("payment_attempts")

    const userIdentifier = `${customerEmail}_${customerPhone}`
    const now = new Date()

    const attempts = await paymentAttemptsCollection.findOne({
      userIdentifier,
      claimId,
    })

    if (!attempts) {
      return NextResponse.json({
        success: true,
        canAttemptPayment: true,
        attemptCount: 0,
        remainingAttempts: 3,
      })
    }

    // Check if user is in cooldown period
    if (attempts.cooldownUntil && attempts.cooldownUntil > now) {
      const remainingTime = Math.ceil((attempts.cooldownUntil.getTime() - now.getTime()) / (1000 * 60)) // minutes
      return NextResponse.json({
        success: true,
        canAttemptPayment: false,
        inCooldown: true,
        cooldownUntil: attempts.cooldownUntil,
        remainingMinutes: remainingTime,
        attemptCount: attempts.attemptCount,
        message: `You have exceeded the maximum payment attempts. Please wait ${remainingTime} minutes before trying again.`,
      })
    }

    // Check if user has reached maximum attempts
    if (attempts.attemptCount >= 3) {
      return NextResponse.json({
        success: true,
        canAttemptPayment: false,
        maxAttemptsReached: true,
        attemptCount: attempts.attemptCount,
        message: "Maximum payment attempts reached. Please wait for cooldown period to reset.",
      })
    }

    return NextResponse.json({
      success: true,
      canAttemptPayment: true,
      attemptCount: attempts.attemptCount,
      remainingAttempts: 3 - attempts.attemptCount,
      lastAttemptAt: attempts.lastAttemptAt,
    })
  } catch (error) {
    console.error("Error checking payment attempts:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check payment attempts",
      },
      { status: 500 },
    )
  }
}
