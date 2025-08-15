export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const statusFilter = searchParams.get("status") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const db = await getDatabase()
    const collection = db.collection("ottkeys")

    // Build filter query
    const filter: any = {}

    if (search) {
      filter.$or = [
        { activationCode: { $regex: search, $options: "i" } },
        { product: { $regex: search, $options: "i" } },
        { productSubCategory: { $regex: search, $options: "i" } },
        { assignedTo: { $regex: search, $options: "i" } },
      ]
    }

    if (statusFilter && statusFilter !== "all") {
      filter.status = statusFilter
    }

    // Build sort query
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Get total count
    const total = await collection.countDocuments(filter)

    // Get paginated results
    const keys = await collection
      .find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    // Convert ObjectId to string for JSON serialization
    const serializedKeys = keys.map((key) => ({
      ...key,
      _id: key._id.toString(),
    }))

    return NextResponse.json({
      success: true,
      keys: serializedKeys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching keys:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch keys",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
