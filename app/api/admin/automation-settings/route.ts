import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()
    const settingsCollection = db.collection("automationsettings")

    // Get or create default settings
    let settings = await settingsCollection.findOne({})

    if (!settings) {
      // Create default settings with next run time
      const now = new Date()
      const nextRunTime = new Date(now.getTime() + 60 * 1000) // Next run in 1 minute

      const defaultSettings = {
        isEnabled: true,
        intervalMinutes: 1,
        totalRuns: 0,
        createdAt: now,
        updatedAt: now,
        nextRun: nextRunTime,
        isRunning: false,
      }

      const result = await settingsCollection.insertOne(defaultSettings)
      settings = { ...defaultSettings, _id: result.insertedId }
    } else {
      // Ensure nextRun is set if missing
      if (!settings.nextRun && settings.isEnabled) {
        const now = new Date()
        const nextRunTime = new Date(now.getTime() + (settings.intervalMinutes || 1) * 60 * 1000)

        await settingsCollection.findOneAndUpdate(
          { _id: settings._id },
          {
            $set: {
              nextRun: nextRunTime,
              updatedAt: now,
            },
          },
        )
        settings.nextRun = nextRunTime
      }
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

    const now = new Date()
    const nextRunTime = isEnabled ? new Date(now.getTime() + intervalMinutes * 60 * 1000) : null

    // Update or create settings
    const result = await settingsCollection.findOneAndUpdate(
      {},
      {
        $set: {
          isEnabled,
          intervalMinutes,
          updatedAt: now,
          nextRun: nextRunTime,
          isRunning: false,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    )

    console.log(`⚙️ Settings updated: ${isEnabled ? "ENABLED" : "DISABLED"} - Interval: ${intervalMinutes} minutes`)
    if (nextRunTime) {
      console.log(`⏰ Next run scheduled for: ${nextRunTime.toISOString()}`)
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
    const { incrementRuns, lastRun, nextRun, isRunning } = await request.json()

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

    if (typeof isRunning === "boolean") {
      updateData.isRunning = isRunning
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
