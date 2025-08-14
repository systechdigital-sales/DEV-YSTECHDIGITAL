import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Claims monitor triggered - Checking for new records...")

    const db = await getDatabase()
    const claimsCollection = db.collection("claims")

    // Get claims that need processing (paid but not processed)
    const unprocessedClaims = await claimsCollection
      .find({
        paymentStatus: "paid",
        ottStatus: "pending",
      })
      .sort({ createdAt: -1 })
      .toArray()

    console.log(`📊 Found ${unprocessedClaims.length} unprocessed paid claims`)

    if (unprocessedClaims.length > 0) {
      console.log("🚀 Triggering automation for unprocessed claims...")

      // Trigger the automation process
      const automationResponse = await fetch(
        `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/admin/process-automation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Claims-Monitor/1.0",
          },
        },
      )

      if (!automationResponse.ok) {
        const errorText = await automationResponse.text()
        console.error("❌ Automation API failed:", errorText)
        throw new Error(`Automation API failed: ${automationResponse.status} - ${errorText}`)
      }

      const automationResult = await automationResponse.json()
      console.log("✅ Automation completed:", automationResult)

      return NextResponse.json({
        success: true,
        message: `Automation triggered for ${unprocessedClaims.length} unprocessed claims`,
        claimsFound: unprocessedClaims.length,
        results: automationResult.results,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json({
        success: true,
        message: "No unprocessed claims found",
        claimsFound: 0,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("❌ Claims monitor error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Claims monitor failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Also handle GET requests
export async function GET() {
  return POST({} as NextRequest)
}
