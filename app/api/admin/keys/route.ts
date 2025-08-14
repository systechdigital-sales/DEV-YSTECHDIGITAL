export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { IOTTKey, OTTKey } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const db = await getDatabase()
    const keysCollection = db.collection<IOTTKey>("ottkeys")

    // Build search query
    const query: any = {}
    if (search) {
      query.$or = [
        { activationCode: { $regex: search, $options: "i" } },
        { product: { $regex: search, $options: "i" } },
        { productSubCategory: { $regex: search, $options: "i" } },
        { assignedEmail: { $regex: search, $options: "i" } },
      ]
    }

    if (status && status !== "all") {
      query.status = status
    }

    // Build sort object
    const sortObj: any = {}
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1

    // Get total count for pagination
    const total = await keysCollection.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    // Fetch paginated data
    const keys = await keysCollection.find(query).sort(sortObj).skip(skip).limit(limit).toArray()

    const formattedKeys: OTTKey[] = keys.map((key) => ({
      ...key,
      id: key._id?.toString() || "",
      _id: key._id?.toString() || "",
      createdAt: key.createdAt ? key.createdAt.toISOString() : undefined,
      updatedAt: key.updatedAt ? key.updatedAt.toISOString() : undefined,
      assignedDate: key.assignedDate ? key.assignedDate.toISOString() : undefined,
    }))

    return NextResponse.json({
      data: formattedKeys,
      total,
      page,
      totalPages,
      limit,
    })
  } catch (error: any) {
    console.error("Error fetching OTT keys:", error)
    return NextResponse.json(
      {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
        limit: 10,
        error: error.message || "Failed to fetch OTT keys",
      },
      { status: 500 },
    )
  }
}
