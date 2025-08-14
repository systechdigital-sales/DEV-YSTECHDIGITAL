import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const claimId = searchParams.get("claimId")

    const db = await getDatabase()
    const claimsCollection = db.collection("claims")

    // If specific claim ID is requested
    if (claimId) {
      const claim = await claimsCollection.findOne({
        $or: [{ claimId: claimId }, { _id: claimId }],
      })

      if (!claim) {
        return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 })
      }

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
    }

    // Build search query
    let query = {}
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { activationCode: { $regex: search, $options: "i" } },
          { claimId: { $regex: search, $options: "i" } },
        ],
      }
    }

    // Get total count for pagination
    const total = await claimsCollection.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    // Fetch paginated data
    const claims = await claimsCollection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()

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

    return NextResponse.json({
      data: formattedClaims,
      total,
      page,
      totalPages,
      limit,
    })
  } catch (error: any) {
    console.error("❌ Error fetching claims:", error)
    return NextResponse.json(
      {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
        limit: 10,
        error: error.message || "Failed to fetch claims",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    const db = await getDatabase()
    const claimsCollection = db.collection("claims")

    // Get all claims for admin dashboard
    const claims = await claimsCollection.find({}).sort({ createdAt: -1 }).toArray()

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
