import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const claimId = searchParams.get("claimId")

    const db = await getDatabase()
    const claimsCollection = db.collection("claims")

    if (claimId) {
      // Fetch specific claim
      const claim = await claimsCollection.findOne({ claimId })

      if (!claim) {
        return NextResponse.json(
          {
            success: false,
            error: "Claim not found",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        claim: {
          _id: claim._id?.toString(),
          claimId: claim.claimId,
          firstName: claim.firstName || "",
          lastName: claim.lastName || "",
          email: claim.email || "",
          phoneNumber: claim.phoneNumber || claim.phone || "",
          activationCode: claim.activationCode || "",
          paymentStatus: claim.paymentStatus || "pending",
          ottStatus: claim.ottStatus || claim.ottCodeStatus || "pending",
          ottCode: claim.ottCode || "",
          paymentId: claim.paymentId || "",
          razorpayOrderId: claim.razorpayOrderId || "",
          createdAt: claim.createdAt,
          updatedAt: claim.updatedAt,
        },
      })
    } else {
      // Fetch all claims
      const claims = await claimsCollection.find({}).sort({ createdAt: -1 }).toArray()

      const formattedClaims = claims.map((claim) => ({
        _id: claim._id?.toString(),
        claimId: claim.claimId,
        firstName: claim.firstName || "",
        lastName: claim.lastName || "",
        email: claim.email || "",
        phoneNumber: claim.phoneNumber || claim.phone || "",
        activationCode: claim.activationCode || "",
        paymentStatus: claim.paymentStatus || "pending",
        ottStatus: claim.ottStatus || claim.ottCodeStatus || "pending",
        ottCode: claim.ottCode || "",
        paymentId: claim.paymentId || "",
        razorpayOrderId: claim.razorpayOrderId || "",
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
      }))

      return NextResponse.json({
        success: true,
        claims: formattedClaims,
        total: formattedClaims.length,
      })
    }
  } catch (error) {
    console.error("Error fetching claims:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch claims",
      },
      { status: 500 },
    )
  }
}
