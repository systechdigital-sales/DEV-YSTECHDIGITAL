import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()
    const settingsCollection = db.collection("automationsettings")

    // Get or create default settings
    let settings = await settingsCollection.findOne({})

    if (!settings) {
      // Create default settings
      const defaultSettings = {
        isEnabled: true,
        intervalMinutes: 1,
        totalRuns: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await settingsCollection.insertOne(defaultSettings)
      settings = defaultSettings
    }

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error("Error fetching automation settings:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch automation settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isEnabled, intervalMinutes } = await request.json()

    if (typeof isEnabled !== "boolean" || typeof intervalMinutes !== "number") {
      return NextResponse.json({ error: "Invalid settings data" }, { status: 400 })
    }

    // Validate interval options
    const validIntervals = [1, 5, 30, 60, 360, 1440] // 1min, 5min, 30min, 1hour, 6hours, 1day
    if (!validIntervals.includes(intervalMinutes)) {
      return NextResponse.json({ error: "Invalid interval value" }, { status: 400 })
    }

    const db = await getDatabase()
    const settingsCollection = db.collection("automationsettings")

    // Update or create settings
    const result = await settingsCollection.findOneAndUpdate(
      {},
      {
        $set: {
          isEnabled,
          intervalMinutes,
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    )

    // If automation is enabled, schedule the next run
    if (isEnabled) {
      await scheduleNextRun(intervalMinutes)
    }

    return NextResponse.json({
      success: true,
      message: "Automation settings updated successfully",
      settings: result,
    })
  } catch (error) {
    console.error("Error updating automation settings:", error)
    return NextResponse.json(
      {
        error: "Failed to update automation settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { incrementRuns, lastRun, nextRun } = await request.json()

    const db = await getDatabase()
    const settingsCollection = db.collection("automationsettings")

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (incrementRuns) {
      updateData.$inc = { totalRuns: 1 }
    }

    if (lastRun) {
      updateData.lastRun = new Date(lastRun)
    }

    if (nextRun) {
      updateData.nextRun = new Date(nextRun)
    }

    const result = await settingsCollection.findOneAndUpdate({}, updateData, {
      upsert: true,
      returnDocument: "after",
    })

    return NextResponse.json({
      success: true,
      settings: result,
    })
  } catch (error) {
    console.error("Error updating automation run stats:", error)
    return NextResponse.json(
      {
        error: "Failed to update automation run stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Helper function to schedule next run using Vercel Cron or external service
async function scheduleNextRun(intervalMinutes: number) {
  try {
    const nextRunTime = new Date(Date.now() + intervalMinutes * 60 * 1000)

    // Update the next run time in database
    const db = await getDatabase()
    const settingsCollection = db.collection("automationsettings")

    await settingsCollection.findOneAndUpdate(
      {},
      {
        $set: {
          nextRun: nextRunTime,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    console.log(`Next automation run scheduled for: ${nextRunTime.toISOString()}`)
  } catch (error) {
    console.error("Error scheduling next run:", error)
  }
}
