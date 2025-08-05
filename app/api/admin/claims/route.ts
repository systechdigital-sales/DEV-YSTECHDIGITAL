import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const claimId = searchParams.get("claimId")

    if (!claimId) {
      return NextResponse.json(
        {
          success: false,
          error: "Claim ID is required",
        },
        { status: 400 },
      )
    }

    const { db } = await connectToDatabase()
    const claimsCollection = db.collection("claims")

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
      claim,
    })
  } catch (error) {
    console.error("Error fetching claim:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch claim",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page = 1, limit = 10, status, search } = body

    const { db } = await connectToDatabase()
    const claimsCollection = db.collection("claims")

    // Build query
    const query: any = {}
    if (status && status !== "all") {
      query.paymentStatus = status
    }
    if (search) {
      query.$or = [
        { claimId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { activationCode: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count
    const total = await claimsCollection.countDocuments(query)

    // Get claims with pagination
    const claims = await claimsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      success: true,
      claims,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
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
