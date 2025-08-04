import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ISalesRecord } from "@/lib/models"

// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"

  // Rate limiting logic
  const now = Date.now()
  const clientData = requestCounts.get(ip) || { count: 0, lastReset: now }

  if (now - clientData.lastReset > RATE_LIMIT_WINDOW_MS) {
    clientData.count = 1
    clientData.lastReset = now
  } else {
    clientData.count++
  }
  requestCounts.set(ip, clientData)

  if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
    console.warn(`Rate limit exceeded for IP: ${ip}`)
    return NextResponse.json({ success: false, message: "Too many requests. Please try again later." }, { status: 429 })
  }

  try {
    const { activationCode } = await request.json()

    if (!activationCode) {
      return NextResponse.json({ success: false, message: "Activation code is required." }, { status: 400 })
    }

    const db = await getDatabase()
    const salesRecordsCollection = db.collection<ISalesRecord>("salesrecords")

    const salesRecord = await salesRecordsCollection.findOne({ activationCode: activationCode.toUpperCase() })

    if (!salesRecord) {
      return NextResponse.json({ success: false, message: "Activation code not found." }, { status: 404 })
    }

    if (salesRecord.status === "claimed") {
      return NextResponse.json(
        { success: false, message: "This activation code has already been claimed by someone else." },
        { status: 409 },
      )
    }

    if (salesRecord.status !== "available") {
      return NextResponse.json(
        { success: false, message: "Activation code is not available for claim." },
        { status: 409 },
      )
    }

    return NextResponse.json({ success: true, message: "Activation code is valid and available." })
  } catch (error: any) {
    console.error("Error verifying activation code:", error)
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 })
  }
}
