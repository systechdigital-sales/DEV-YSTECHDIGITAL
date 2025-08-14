import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Find new paid claims that haven't been processed yet
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
        newClaims: 0,
        claimIds: [],
      })
    }

    // Mark claims as being processed to prevent duplicate processing
    const claimIds = newClaims.map((claim) => claim._id)
    await db
      .collection("claims")
      .updateMany({ _id: { $in: claimIds } }, { $set: { automationProcessed: true, processedAt: new Date() } })

    // Trigger the automation process
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const automationResponse = await fetch(`${baseUrl}/api/admin/process-automation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const automationResult = await automationResponse.json()

    return NextResponse.json({
      success: true,
      message: `Found and processed ${newClaims.length} new claims`,
      newClaims: newClaims.length,
      claimIds: claimIds.map((id) => id.toString()),
      automationResult,
    })
  } catch (error) {
    console.error("Claims monitor error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to monitor claims",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
