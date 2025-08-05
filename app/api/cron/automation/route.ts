import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("Cron automation triggered at:", new Date().toISOString())

    const db = await getDatabase()
    const settingsCollection = db.collection("automationsettings")

    // Get current settings
    const settings = await settingsCollection.findOne({})

    if (!settings || !settings.isEnabled) {
      console.log("Automation is disabled, skipping...")
      return NextResponse.json({
        success: true,
        message: "Automation is disabled",
      })
    }

    // Check if it's time to run (with 30 second tolerance)
    const now = new Date()
    const nextRun = settings.nextRun ? new Date(settings.nextRun) : new Date(0)
    const timeDiff = now.getTime() - nextRun.getTime()

    if (timeDiff < -30000) {
      // More than 30 seconds early
      console.log("Not time to run yet, skipping...")
      return NextResponse.json({
        success: true,
        message: "Not time to run yet",
      })
    }

    // Run the automation
    const automationResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/admin/process-automation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    const automationResult = await automationResponse.json()

    if (automationResponse.ok) {
      // Update run statistics and schedule next run
      const nextRunTime = new Date(now.getTime() + settings.intervalMinutes * 60 * 1000)

      await settingsCollection.findOneAndUpdate(
        {},
        {
          $inc: { totalRuns: 1 },
          $set: {
            lastRun: now,
            nextRun: nextRunTime,
            updatedAt: now,
          },
        },
      )

      console.log(`Automation completed successfully. Next run: ${nextRunTime.toISOString()}`)

      return NextResponse.json({
        success: true,
        message: "Automation completed successfully",
        results: automationResult.results,
        nextRun: nextRunTime.toISOString(),
      })
    } else {
      console.error("Automation failed:", automationResult.error)
      return NextResponse.json(
        {
          success: false,
          error: "Automation failed",
          details: automationResult.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Cron automation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Cron automation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Also handle POST requests for manual triggers
export async function POST() {
  return GET()
}
