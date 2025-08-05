import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("🤖 Cron automation triggered at:", new Date().toISOString())

    const db = await getDatabase()
    const settingsCollection = db.collection("automationsettings")

    // Get current settings
    const settings = await settingsCollection.findOne({})

    if (!settings || !settings.isEnabled) {
      console.log("⏸️ Automation is disabled, skipping...")
      return NextResponse.json({
        success: true,
        message: "Automation is disabled",
        skipped: true,
      })
    }

    console.log(`🚀 Running automation #${(settings.totalRuns || 0) + 1}...`)

    // Run the automation process
    const automationResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/admin/process-automation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Vercel-Cron/1.0",
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

    // Update run statistics and schedule next run
    const now = new Date()
    const nextRunTime = new Date(now.getTime() + (settings.intervalMinutes || 1) * 60 * 1000)

    const updateResult = await settingsCollection.findOneAndUpdate(
      {},
      {
        $inc: { totalRuns: 1 },
        $set: {
          lastRun: now,
          nextRun: nextRunTime,
          updatedAt: now,
          lastRunResult: automationResult.results,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    )

    console.log(`📊 Updated run count to: ${updateResult?.totalRuns || 0}`)
    console.log(`⏰ Next run scheduled for: ${nextRunTime.toISOString()}`)

    return NextResponse.json({
      success: true,
      message: "Automation completed successfully",
      results: automationResult.results,
      runNumber: updateResult?.totalRuns || 0,
      nextRun: nextRunTime.toISOString(),
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error("💥 Cron automation error:", error)

    // Log the error to database for debugging
    try {
      const db = await getDatabase()
      const settingsCollection = db.collection("automationsettings")

      await settingsCollection.findOneAndUpdate(
        {},
        {
          $set: {
            lastError: {
              message: error instanceof Error ? error.message : "Unknown error",
              timestamp: new Date(),
            },
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      )
    } catch (dbError) {
      console.error("Failed to log error to database:", dbError)
    }

    return NextResponse.json(
      {
        success: false,
        error: "Cron automation failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Also handle POST requests for manual triggers
export async function POST() {
  return GET()
}
