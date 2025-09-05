// app/api/log-client/route.ts
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, data, time } = body

    // Print to Vercel function logs
    console.log("📋 Client Log:", { message, data, time })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Error logging client message:", error)
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }
}


