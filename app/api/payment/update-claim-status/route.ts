import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { claimId, paymentStatus, paymentId, razorpayOrderId } = await request.json()

    if (!claimId || !paymentStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const claimsCollection = db.collection("claims")

    const updateData: any = {
      paymentStatus,
      updatedAt: new Date(),
    }

    if (paymentId) updateData.paymentId = paymentId
    if (razorpayOrderId) updateData.razorpayOrderId = razorpayOrderId
    if (paymentStatus === "paid") updateData.paidAt = new Date()

    const result = await claimsCollection.updateOne({ claimId }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating claim status:", error)
    return NextResponse.json({ error: "Failed to update claim status" }, { status: 500 })
  }
}
