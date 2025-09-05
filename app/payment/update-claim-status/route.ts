import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import type { IClaimResponse } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const { claimId, paymentStatus, paymentId, razorpayOrderId } = await request.json()

    console.log("Updating claim status in claims:", {
      claimId,
      paymentStatus,
      paymentId,
      razorpayOrderId,
    })

    // Connect to  database
    const db = await getDatabase("systech_ott_platform")
    const claimsCollection = db.collection<IClaimResponse>("claims")

    // Find the claim
    const claim = await claimsCollection.findOne({ _id: claimId })

    if (!claim) {
      console.error("Claim not found in claims:", claimId)
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 })
    }

    // Update claim status
    const updateResult = await claimsCollection.updateOne(
      { _id: claimId },
      {
        $set: {
          paymentStatus,
          paymentId,
          razorpayOrderId,
          updatedAt: new Date(),
        },
      },
    )

    if (updateResult.matchedCount === 0) {
      console.error("Failed to update claim in claims:", claimId)
      return NextResponse.json({ success: false, error: "Failed to update claim" }, { status: 500 })
    }

    console.log("Successfully updated claim in claims:", claimId)

    // Send payment success email if payment was successful
    if (paymentStatus === "paid") {
      try {
        const customerName = `${claim.firstName} ${claim.lastName}`

        await sendEmail(
          claim.email,
          "🎉 Payment Successful - OTT Code Processing Started - SYSTECH DIGITAL",
          "payment_success",
          claim,
          {
            to: claim.email,
            subject: "🎉 Payment Successful - OTT Code Processing Started - SYSTECH DIGITAL",
            template: "payment_success",
            data: {
              customerName,
              claimId,
              paymentId,
              amount: "99", // You might want to get this from the claim
              activationCode: claim.activationCode,
              email: claim.email,
              phone: claim.phone,
              date: new Date().toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          },
          {
            template: "payment_success",
            data: {
              customerName,
              claimId,
              paymentId,
              amount: "99",
              activationCode: claim.activationCode,
              email: claim.email,
              phone: claim.phone,
              date: new Date().toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            to: "",
            subject: "",
          },
        )

        console.log("Payment success email sent to:", claim.email)
      } catch (emailError) {
        console.error("Failed to send payment success email:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Claim status updated successfully in systech_ott_platform.claims",
    })
  } catch (error: any) {
    console.error("Error updating claim status in claims:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update claim status" },
      { status: 500 },
    )
  }
}
