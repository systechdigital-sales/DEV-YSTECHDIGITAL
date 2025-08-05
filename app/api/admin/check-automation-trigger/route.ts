import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()
    const settingsCollection = db.collection("automationsettings")

    // Get current settings
    const settings = await settingsCollection.findOne({})

    if (!settings || !settings.isEnabled) {
      return NextResponse.json({
        shouldRun: false,
        reason: "Automation disabled",
      })
    }

    const now = new Date()
    const nextRun = new Date(settings.nextRun)

    // Check if it's time to run
    const shouldRun = now >= nextRun && !settings.isRunning

    if (shouldRun) {
      // Update the next run time and set running status
      const newNextRun = new Date(now.getTime() + settings.intervalMinutes * 60 * 1000)

      await settingsCollection.findOneAndUpdate(
        { _id: settings._id },
        {
          $set: {
            isRunning: true,
            nextRun: newNextRun,
            updatedAt: now,
          },
          $inc: { totalRuns: 1 },
        },
      )

      return NextResponse.json({
        shouldRun: true,
        runNumber: settings.totalRuns + 1,
        nextRun: newNextRun.toISOString(),
      })
    }

    return NextResponse.json({
      shouldRun: false,
      reason: "Not time yet",
      nextRun: nextRun.toISOString(),
      timeRemaining: nextRun.getTime() - now.getTime(),
    })
  } catch (error) {
    console.error("Error checking automation trigger:", error)
    return NextResponse.json(
      {
        shouldRun: false,
        error: "Failed to check automation trigger",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
