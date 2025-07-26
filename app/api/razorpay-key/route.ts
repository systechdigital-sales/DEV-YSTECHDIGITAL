import { NextResponse } from "next/server"

export async function GET() {
  try {
    const razorpayKey = process.env.RAZORPAY_KEY_ID

    if (!razorpayKey) {
      return NextResponse.json({ error: "Razorpay key not configured" }, { status: 500 })
    }

    return NextResponse.json({ key: razorpayKey })
  } catch (error) {
    console.error("Error fetching Razorpay key:", error)
    return NextResponse.json({ error: "Failed to fetch Razorpay key" }, { status: 500 })
  }
}
