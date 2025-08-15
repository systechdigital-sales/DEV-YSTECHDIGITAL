export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const paymentStatusFilter = searchParams.get("paymentStatus") || ""
    const ottStatusFilter = searchParams.get("ottStatus") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const db = await getDatabase()
    const collection = db.collection("claims")

    // Build filter query
    const filter: any = {}

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { activationCode: { $regex: search, $options: "i" } },
        { claimId: { $regex: search, $options: "i" } },
      ]
    }

    if (paymentStatusFilter && paymentStatusFilter !== "all") {
      filter.paymentStatus = paymentStatusFilter
    }

    if (ottStatusFilter && ottStatusFilter !== "all") {
      filter.ottStatus = ottStatusFilter
    }

    // Build sort query
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Get total count
    const total = await collection.countDocuments(filter)

    // Get paginated results
    const claims = await collection
      .find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    // Convert ObjectId to string for JSON serialization
    const serializedClaims = claims.map((claim) => ({
      ...claim,
      _id: claim._id.toString(),
    }))

    return NextResponse.json({
      success: true,
      claims: serializedClaims,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching claims:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch claims",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
