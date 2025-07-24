import { type NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const { amount, claimId, customerName, customerEmail, customerPhone } = await request.json()

    if (!amount || !claimId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const options = {
      amount: amount, // amount in paise
      currency: "INR",
      receipt: `receipt_${claimId}`,
      notes: {
        claimId,
        customerName,
        customerEmail,
        customerPhone,
      },
    }

    const order = await razorpay.orders.create(options)

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
    return NextResponse.json({ success: false, error: "Failed to create payment order" }, { status: 500 })
  }
}
