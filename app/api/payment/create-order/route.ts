import { type NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

export async function POST(request: NextRequest) {
  try {
    // Ensure the env vars exist at runtime
    const KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID
    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
    if (!KEY_ID || !KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay environment variables are not configured" }, { status: 500 })
    }

    // Create the client at request time (avoids build-time crashes)
    const razorpay = new Razorpay({
      key_id: KEY_ID,
      key_secret: KEY_SECRET,
    })

    const body = await request.json()
    const { amount, currency = "INR", receipt, notes } = body

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes,
      payment_capture: 1,
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
