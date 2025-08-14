import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Claims monitor: Starting check for new claims...")

    const { db } = await connectToDatabase()

    // Find new paid claims that haven't been processed by automation
    const newClaims = await db
      .collection("claims")
      .find({
        paymentStatus: "paid",
        ottStatus: "pending",
        automationProcessed: { $ne: true },
      })
      .sort({ createdAt: -1 })
      .toArray()

    console.log(`📊 Claims monitor: Found ${newClaims.length} unprocessed claims`)

    if (newClaims.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new claims to process",
        claimsFound: 0,
        claimIds: [],
        timestamp: new Date().toISOString(),
      })
    }

    // Mark claims as being processed to prevent duplicate processing
    const claimIds = newClaims.map((claim) => claim._id)
    await db.collection("claims").updateMany(
      { _id: { $in: claimIds } },
      {
        $set: {
          automationProcessed: true,
          automationTriggeredAt: new Date(),
          automationTrigger: "claims-monitor",
        },
      },
    )

    console.log(`✅ Claims monitor: Marked ${claimIds.length} claims as processing`)

    // Trigger the automation process
    const baseUrl = request.nextUrl.origin
    console.log(`🚀 Claims monitor: Triggering automation at ${baseUrl}/api/admin/process-automation`)

    const automationResponse = await fetch(`${baseUrl}/api/admin/process-automation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Claims-Monitor/1.0",
      },
      body: JSON.stringify({
        trigger: "claims-monitor",
        claimIds: claimIds.map((id) => id.toString()),
      }),
    })

    let automationResult = null
    if (automationResponse.ok) {
      automationResult = await automationResponse.json()
      console.log(`✅ Claims monitor: Automation completed successfully`, automationResult)
    } else {
      const errorText = await automationResponse.text()
      console.error(`❌ Claims monitor: Automation failed with status ${automationResponse.status}:`, errorText)
      automationResult = {
        success: false,
        error: `Automation API returned ${automationResponse.status}`,
        details: errorText,
      }
    }

    return NextResponse.json({
      success: true,
      message: `Found ${newClaims.length} new claims and triggered automation`,
      claimsFound: newClaims.length,
      claimIds: claimIds.map((id) => id.toString()),
      automationResult,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Claims monitor error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error monitoring claims",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  // Allow POST method as well for manual triggering
  return GET(request)
}
