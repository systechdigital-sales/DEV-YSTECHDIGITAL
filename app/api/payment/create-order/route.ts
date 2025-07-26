import { type NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "INR", claimId, customerName, customerEmail } = await request.json()

    console.log("Creating order for:", { amount, claimId, customerName, customerEmail })

    if (!amount || !claimId || !customerName || !customerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${claimId}`,
      notes: {
        claimId,
        customerName,
        customerEmail,
      },
    }

    const order = await razorpay.orders.create(options)
    console.log("Order created successfully:", order.id)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
