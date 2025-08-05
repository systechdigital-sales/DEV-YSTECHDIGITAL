import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("📧 Fetching claims for emails page...")

    const { searchParams } = new URL(request.url)
    const claimId = searchParams.get("claimId")

    const db = await getDatabase()
    const claimsCollection = db.collection("claims")

    if (claimId) {
      console.log(`🔍 Fetching specific claim: ${claimId}`)

      // Fetch specific claim
      const claim = await claimsCollection.findOne({
        $or: [{ claimId: claimId }, { _id: claimId }],
      })

      if (!claim) {
        console.log(`❌ Claim not found: ${claimId}`)
        return NextResponse.json(
          {
            success: false,
            error: "Claim not found",
          },
          { status: 404 },
        )
      }

      console.log(`✅ Found claim: ${claim.claimId || claim._id}`)

      return NextResponse.json({
        success: true,
        claim: {
          _id: claim._id?.toString(),
          claimId: claim.claimId || claim._id?.toString(),
          firstName: claim.firstName || "",
          lastName: claim.lastName || "",
          email: claim.email || "",
          phoneNumber: claim.phoneNumber || claim.phone || "",
          address: claim.address || "",
          state: claim.state || "",
          city: claim.city || "",
          pincode: claim.pincode || "",
          activationCode: claim.activationCode || "",
          paymentStatus: claim.paymentStatus || "pending",
          ottStatus: claim.ottStatus || claim.ottCodeStatus || "pending",
          ottCode: claim.ottCode || "",
          paymentId: claim.paymentId || "",
          razorpayOrderId: claim.razorpayOrderId || "",
          createdAt: claim.createdAt,
          updatedAt: claim.updatedAt,
          amount: claim.amount || 99,
        },
      })
    } else {
      console.log("📋 Fetching all claims...")

      // Fetch all claims with proper sorting
      const claims = await claimsCollection.find({}).sort({ createdAt: -1 }).toArray()

      console.log(`📊 Found ${claims.length} total claims`)

      const formattedClaims = claims.map((claim) => ({
        _id: claim._id?.toString(),
        claimId: claim.claimId || claim._id?.toString(),
        firstName: claim.firstName || "",
        lastName: claim.lastName || "",
        email: claim.email || "",
        phoneNumber: claim.phoneNumber || claim.phone || "",
        address: claim.address || "",
        state: claim.state || "",
        city: claim.city || "",
        pincode: claim.pincode || "",
        activationCode: claim.activationCode || "",
        paymentStatus: claim.paymentStatus || "pending",
        ottStatus: claim.ottStatus || claim.ottCodeStatus || "pending",
        ottCode: claim.ottCode || "",
        paymentId: claim.paymentId || "",
        razorpayOrderId: claim.razorpayOrderId || "",
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
        amount: claim.amount || 99,
      }))

      console.log(`✅ Returning ${formattedClaims.length} formatted claims`)
      console.log("Sample claim:", formattedClaims[0])

      return NextResponse.json({
        success: true,
        claims: formattedClaims,
        total: formattedClaims.length,
      })
    }
  } catch (error: any) {
    console.error("❌ Error fetching claims:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch claims",
        claims: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    console.log("📧 POST request to claims API...")

    const db = await getDatabase()
    const claimsCollection = db.collection("claims")

    // Get all claims for admin dashboard
    const claims = await claimsCollection.find({}).sort({ createdAt: -1 }).toArray()

    console.log(`📊 Found ${claims.length} claims via POST`)

    const formattedClaims = claims.map((claim) => ({
      _id: claim._id?.toString(),
      claimId: claim.claimId || claim._id?.toString(),
      firstName: claim.firstName || "",
      lastName: claim.lastName || "",
      email: claim.email || "",
      phoneNumber: claim.phoneNumber || claim.phone || "",
      address: claim.address || "",
      state: claim.state || "",
      city: claim.city || "",
      pincode: claim.pincode || "",
      activationCode: claim.activationCode || "",
      paymentStatus: claim.paymentStatus || "pending",
      ottStatus: claim.ottStatus || claim.ottCodeStatus || "pending",
      ottCode: claim.ottCode || "",
      paymentId: claim.paymentId || "",
      razorpayOrderId: claim.razorpayOrderId || "",
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
      amount: claim.amount || 99,
    }))

    console.log(`✅ Admin POST returning ${formattedClaims.length} claims`)

    return NextResponse.json({
      success: true,
      claims: formattedClaims,
      total: formattedClaims.length,
    })
  } catch (error: any) {
    console.error("❌ Error in POST claims:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch claims",
        claims: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}
