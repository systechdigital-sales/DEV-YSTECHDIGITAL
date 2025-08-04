import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ISalesRecord } from "@/lib/models"

// Basic in-memory rate limiter
const requestCounts = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5 // Max 5 requests per minute per IP

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const now = Date.now()

  // Rate limiting logic
  let entry = requestCounts.get(ip)
  if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW_MS) {
    entry = { count: 1, lastReset: now }
    requestCounts.set(ip, entry)
  } else {
    entry.count++
    if (entry.count > MAX_REQUESTS_PER_WINDOW) {
      console.warn(`Rate limit exceeded for IP: ${ip}`)
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429 },
      )
    }
  }

  try {
    const { activationCode } = await request.json()

    if (!activationCode) {
      return NextResponse.json({ success: false, message: "Activation code is required." }, { status: 400 })
    }

    console.log(`Verifying activation code: ${activationCode} for IP: ${ip}`)

    const db = await getDatabase()
    const salesRecordsCollection = db.collection<ISalesRecord>("salesrecords") // Assuming 'salesrecords' is the collection name

    const salesRecord = await salesRecordsCollection.findOne({ activationCode: activationCode.toUpperCase() })

    if (!salesRecord) {
      console.log(`Activation code ${activationCode} not found.`)
      return NextResponse.json({ success: false, message: "Activation code not found." })
    }

    if (salesRecord.status === "claimed") {
      console.log(`Activation code ${activationCode} is already claimed.`)
      return NextResponse.json({ success: false, message: "This activation code has already been claimed." })
    }

    if (salesRecord.status === "available") {
      console.log(`Activation code ${activationCode} is available.`)
      return NextResponse.json({ success: true, message: "Activation code is valid and available." })
    }

    // Fallback for unexpected statuses
    console.warn(`Activation code ${activationCode} has an unexpected status: ${salesRecord.status}`)
    return NextResponse.json({ success: false, message: "Activation code status is not available." })
  } catch (error: any) {
    console.error("Error verifying activation code:", error)
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 })
  }
}
