import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { IClaimResponse } from "@/lib/models"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const { claimId, paymentId, orderId } = await request.json()

    if (!claimId || !paymentId || !orderId) {
      return NextResponse.json({ success: false, error: "Missing required payment details." }, { status: 400 })
    }

    const db = await getDatabase()

    const result = await db.collection<IClaimResponse>("claims").updateOne(
      { _id: new ObjectId(claimId) },
      {
        $set: {
          paymentStatus: "completed",
          paymentId: paymentId, // This is razorpay_payment_id
          razorpayOrderId: orderId, // This is razorpay_order_id
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Claim not found." }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Claim payment status updated successfully." })
  } catch (error: any) {
    console.error("Error updating claim payment status:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
