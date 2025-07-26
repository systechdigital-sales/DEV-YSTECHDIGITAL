import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { claimId, paymentId, orderId, razorpayPaymentId, razorpayOrderId, status = "paid" } = body

    console.log("Updating claim status:", { claimId, paymentId, orderId, status })

    if (!claimId) {
      return NextResponse.json({ success: false, error: "Claim ID is required" }, { status: 400 })
    }

    const db = await getDatabase()

    const updateData: any = {
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    }

    if (paymentId) updateData.paymentId = paymentId
    if (orderId) updateData.orderId = orderId
    if (razorpayPaymentId) updateData.razorpayPaymentId = razorpayPaymentId
    if (razorpayOrderId) updateData.razorpayOrderId = razorpayOrderId

    const updateResult = await db.collection("claims").updateOne({ id: claimId }, { $set: updateData })

    if (updateResult.matchedCount === 0) {
      console.error("Claim not found for update:", claimId)
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 })
    }

    console.log("Claim status updated successfully")
    return NextResponse.json({ success: true, message: "Claim status updated successfully" })
  } catch (error) {
    console.error("Error updating claim status:", error)
    return NextResponse.json({ success: false, error: "Failed to update claim status" }, { status: 500 })
  }
}
