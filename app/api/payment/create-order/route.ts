import { type NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "INR", claimId, customerEmail, customerPhone } = await request.json()

    console.log("Creating order for:", { amount, claimId, customerEmail, customerPhone })

    if (!amount || !claimId || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const options = {
      amount: amount, // Amount should already be in paise
      currency,
      receipt: `receipt_${claimId}`,
      notes: {
        claimId,
        customerEmail,
        customerPhone,
      },
    }

    const order = await razorpay.orders.create(options)
    console.log("Order created successfully:", order.id)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
