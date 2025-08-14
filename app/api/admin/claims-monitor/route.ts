import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Find new paid claims that haven't been processed by automation
    const newClaims = await db
      .collection("claims")
      .find({
        paymentStatus: "paid",
        ottStatus: "pending",
        automationProcessed: { $ne: true },
      })
      .toArray()

    if (newClaims.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new claims to process",
        claimsFound: 0,
        claimIds: [],
      })
    }

    // Mark claims as being processed to prevent duplicate processing
    const claimIds = newClaims.map((claim) => claim._id)
    await db
      .collection("claims")
      .updateMany(
        { _id: { $in: claimIds } },
        { $set: { automationProcessed: true, automationTriggeredAt: new Date() } },
      )

    // Trigger the automation process
    const baseUrl = request.nextUrl.origin
    const automationResponse = await fetch(`${baseUrl}/api/admin/process-automation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const automationResult = await automationResponse.json()

    return NextResponse.json({
      success: true,
      message: `Found ${newClaims.length} new claims and triggered automation`,
      claimsFound: newClaims.length,
      claimIds: claimIds.map((id) => id.toString()),
      automationResult,
    })
  } catch (error) {
    console.error("Claims monitor error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error monitoring claims",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  // Allow POST method as well for manual triggering
  return GET(request)
}
