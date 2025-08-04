import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Collection } from "mongodb"

// Basic in-memory rate limiter
const ipAttempts = new Map<string, { count: number; lastAttempt: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_ATTEMPTS = 5 // Max 5 attempts per minute per IP

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"

  // Rate limiting logic
  const now = Date.now()
  const attempts = ipAttempts.get(ip) || { count: 0, lastAttempt: now }

  if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW_MS) {
    attempts.count = 1 // Reset count if window passed
  } else {
    attempts.count++
  }
  attempts.lastAttempt = now
  ipAttempts.set(ip, attempts)

  if (attempts.count > MAX_ATTEMPTS) {
    console.warn(`Rate limit exceeded for IP: ${ip}`)
    return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 })
  }

  try {
    const { activationCode } = await request.json()

    if (!activationCode) {
      return NextResponse.json({ success: false, error: "Activation code is required." }, { status: 400 })
    }

    const db = await getDatabase()
    const salesCollection: Collection = db.collection("salesrecords")

    const salesRecord = await salesCollection.findOne({ activationCode })

    if (!salesRecord) {
      return NextResponse.json({ success: false, error: "Activation code not found." }, { status: 404 })
    }

    if (salesRecord.status === "claimed") {
      return NextResponse.json(
        { success: false, error: "This activation code has already been claimed." },
        { status: 409 },
      )
    }

    if (salesRecord.status !== "available") {
      // Handle other statuses like 'expired', 'pending_activation', etc.
      return NextResponse.json(
        { success: false, error: `Activation code status is '${salesRecord.status}'.` },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: true, message: "Activation code is valid and available." })
  } catch (error: any) {
    console.error("Error verifying activation code:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error." }, { status: 500 })
  }
}
