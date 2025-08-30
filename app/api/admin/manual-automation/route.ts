import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { claimId } = await request.json()

    if (!claimId) {
      return NextResponse.json({ error: "Claim ID is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const claimsCollection = db.collection("claims")
    const salesRecordsCollection = db.collection("salesrecords")
    const ottKeysCollection = db.collection("ottkeys")

    // Find the claim
    const claim = await claimsCollection.findOne({ claimId })
    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 })
    }

    // Check if payment is completed
    if (claim.paymentStatus !== "paid") {
      return NextResponse.json({ error: "Payment must be completed before processing" }, { status: 400 })
    }

    // Find sales record
    const salesRecord = await salesRecordsCollection.findOne({ activationCode: claim.activationCode })
    if (!salesRecord) {
      return NextResponse.json({ error: "Sales record not found for activation code" }, { status: 400 })
    }

    // Find available OTT key
    const ottKey = await ottKeysCollection.findOne({
      platform: salesRecord.platform,
      status: "available",
    })

    if (!ottKey) {
      // Update claim with failure
      await claimsCollection.updateOne(
        { claimId },
        {
          $set: {
            ottStatus: "failed",
            failureReason: "No OTT keys available for platform",
            emailSent: "no_keys_failed",
            updatedAt: new Date(),
          },
        },
      )
      return NextResponse.json({ error: "No OTT keys available for this platform" }, { status: 400 })
    }

    // Update claim with OTT code
    await claimsCollection.updateOne(
      { claimId },
      {
        $set: {
          ottCode: ottKey.activationCode,
          ottStatus: "delivered",
          platform: salesRecord.platform,
          automationProcessed: true,
          emailSent: "success_delivered",
          updatedAt: new Date(),
        },
      },
    )

    // Mark OTT key as used
    await ottKeysCollection.updateOne(
      { _id: ottKey._id },
      {
        $set: {
          status: "used",
          usedBy: claim.email,
          usedDate: new Date(),
          claimId: claimId,
        },
      },
    )

    // Update sales record
    await salesRecordsCollection.updateOne(
      { activationCode: claim.activationCode },
      {
        $set: {
          ottCodeAssigned: ottKey.activationCode,
          ottAssignedDate: new Date(),
          status: "completed",
        },
      },
    )

    return NextResponse.json({
      success: true,
      result: {
        message: `OTT code ${ottKey.activationCode} assigned successfully`,
        ottCode: ottKey.activationCode,
        platform: salesRecord.platform,
      },
    })
  } catch (error: any) {
    console.error("Manual automation error:", error)
    return NextResponse.json({ error: error.message || "Failed to process automation" }, { status: 500 })
  }
}
