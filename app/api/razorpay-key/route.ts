import { NextResponse } from "next/server"

export async function GET() {
  try {
    const key = process.env.RAZORPAY_KEY_ID

    if (!key) {
      return NextResponse.json({ error: "Razorpay key not configured" }, { status: 500 })
    }

    return NextResponse.json({ key })
  } catch (error) {
    console.error("Error fetching Razorpay key:", error)
    return NextResponse.json({ error: "Failed to fetch payment configuration" }, { status: 500 })
  }
}
