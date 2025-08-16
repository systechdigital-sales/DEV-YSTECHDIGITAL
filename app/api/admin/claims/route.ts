export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const claimId = searchParams.get("claimId")
    const paymentStatus = searchParams.get("paymentStatus")
    const ottStatus = searchParams.get("ottStatus")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

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
          streetAddress: claim.streetAddress || claim.address || "",
          addressLine2: claim.addressLine2 || "",
          state: claim.state || "",
          city: claim.city || "",
          pincode: claim.pincode || claim.postalCode || "",
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
    const query: any = {}

    // Add search conditions
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { activationCode: { $regex: search, $options: "i" } },
        { claimId: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ]
    }

    // Add payment status filter
    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus
    }

    // Add OTT status filter
    if (ottStatus && ottStatus !== "all") {
      // Handle both ottStatus and ottCodeStatus fields
      query.$and = query.$and || []
      query.$and.push({
        $or: [{ ottStatus: ottStatus }, { ottCodeStatus: ottStatus }],
      })
    }

    if (startDate || endDate) {
      const dateQuery: any = {}

      if (startDate) {
        dateQuery.$gte = new Date(startDate)
      }

      if (endDate) {
        // Add one day to endDate to include the entire end date
        const endDateTime = new Date(endDate)
        endDateTime.setDate(endDateTime.getDate() + 1)
        dateQuery.$lt = endDateTime
      }

      if (Object.keys(dateQuery).length > 0) {
        query.createdAt = dateQuery
      }
    }

    console.log("Claims query:", JSON.stringify(query, null, 2))

    // Build sort object
    const sortObj: any = {}
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1

    // Get total count for pagination
    const total = await claimsCollection.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    console.log(`Claims pagination: page=${page}, limit=${limit}, skip=${skip}, total=${total}`)

    // Fetch paginated data
    const claims = await claimsCollection.find(query).sort(sortObj).skip(skip).limit(limit).toArray()

    console.log(`Found ${claims.length} claims`)

    const formattedClaims = claims.map((claim) => ({
      _id: claim._id?.toString(),
      id: claim._id?.toString(),
      claimId: claim.claimId || claim._id?.toString(),
      firstName: claim.firstName || "",
      lastName: claim.lastName || "",
      email: claim.email || "",
      phoneNumber: claim.phoneNumber || claim.phone || "",
      streetAddress: claim.streetAddress || claim.address || "",
      addressLine2: claim.addressLine2 || "",
      state: claim.state || "",
      city: claim.city || "",
      pincode: claim.pincode || claim.postalCode || "",
      activationCode: claim.activationCode || "",
      paymentStatus: claim.paymentStatus || "pending",
      ottStatus: claim.ottStatus || claim.ottCodeStatus || "pending",
      ottCode: claim.ottCode || "",
      paymentId: claim.paymentId || "",
      razorpayOrderId: claim.razorpayOrderId || "",
      createdAt: claim.createdAt ? claim.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: claim.updatedAt ? claim.updatedAt.toISOString() : new Date().toISOString(),
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
      id: claim._id?.toString(),
      claimId: claim.claimId || claim._id?.toString(),
      firstName: claim.firstName || "",
      lastName: claim.lastName || "",
      email: claim.email || "",
      phoneNumber: claim.phoneNumber || claim.phone || "",
      streetAddress: claim.streetAddress || claim.address || "",
      addressLine2: claim.addressLine2 || "",
      state: claim.state || "",
      city: claim.city || "",
      pincode: claim.pincode || claim.postalCode || "",
      activationCode: claim.activationCode || "",
      paymentStatus: claim.paymentStatus || "pending",
      ottStatus: claim.ottStatus || claim.ottCodeStatus || "pending",
      ottCode: claim.ottCode || "",
      paymentId: claim.paymentId || "",
      razorpayOrderId: claim.razorpayOrderId || "",
      createdAt: claim.createdAt ? claim.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: claim.updatedAt ? claim.updatedAt.toISOString() : new Date().toISOString(),
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
