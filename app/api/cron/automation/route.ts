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

    const now = new Date()
    const currentRunNumber = (settings.totalRuns || 0) + 1

    console.log(`🚀 Running automation #${currentRunNumber}...`)

    // Update run statistics BEFORE running automation
    const nextRunTime = new Date(now.getTime() + (settings.intervalMinutes || 1) * 60 * 1000)

    await settingsCollection.findOneAndUpdate(
      {},
      {
        $inc: { totalRuns: 1 },
        $set: {
          lastRun: now,
          nextRun: nextRunTime,
          updatedAt: now,
          isRunning: true,
        },
      },
      { upsert: true },
    )

    try {
      // Run the automation process
      const automationResponse = await fetch(
        `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/admin/process-automation`,
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

      // Update with successful result
      await settingsCollection.findOneAndUpdate(
        {},
        {
          $set: {
            lastRunResult: automationResult.results,
            isRunning: false,
            lastError: null,
            updatedAt: new Date(),
          },
        },
      )

      console.log(`📊 Run #${currentRunNumber} completed successfully`)
      console.log(`⏰ Next run scheduled for: ${nextRunTime.toISOString()}`)

      return NextResponse.json({
        success: true,
        message: "Automation completed successfully",
        results: automationResult.results,
        runNumber: currentRunNumber,
        nextRun: nextRunTime.toISOString(),
        timestamp: now.toISOString(),
      })
    } catch (automationError) {
      // Update with error but keep the run count
      await settingsCollection.findOneAndUpdate(
        {},
        {
          $set: {
            isRunning: false,
            lastError: {
              message: automationError instanceof Error ? automationError.message : "Unknown error",
              timestamp: now,
            },
            updatedAt: new Date(),
          },
        },
      )
      throw automationError
    }
  } catch (error) {
    console.error("💥 Cron automation error:", error)

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
