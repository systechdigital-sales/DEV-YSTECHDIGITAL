import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Manual trigger for auto-processing initiated")

    // Call the webhook endpoint to process any pending claims
    const webhookResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/webhook/claims-trigger`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    const result = await webhookResponse.json()

    return NextResponse.json({
      success: true,
      message: "Auto-processing triggered successfully",
      result,
    })
  } catch (error) {
    console.error("❌ Error triggering auto-processing:", error)
    return NextResponse.json(
      {
        error: "Failed to trigger auto-processing",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
