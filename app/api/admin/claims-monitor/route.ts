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
        processed: { $ne: true },
      })
      .toArray()

    if (newClaims.length > 0) {
      console.log(`Found ${newClaims.length} new claims to process`)

      // Trigger automation for these claims
      const automationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/process-automation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trigger: "claims-monitor",
          claimIds: newClaims.map((claim) => claim._id),
        }),
      })

      if (automationResponse.ok) {
        // Mark claims as being processed
        await db
          .collection("claims")
          .updateMany(
            { _id: { $in: newClaims.map((claim) => claim._id) } },
            { $set: { processed: true, processedAt: new Date() } },
          )

        return NextResponse.json({
          success: true,
          message: `Triggered automation for ${newClaims.length} new claims`,
          claimsProcessed: newClaims.length,
          claimIds: newClaims.map((claim) => claim._id),
        })
      } else {
        return NextResponse.json({
          success: false,
          message: "Failed to trigger automation",
          claimsFound: newClaims.length,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "No new claims found",
      claimsFound: 0,
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
