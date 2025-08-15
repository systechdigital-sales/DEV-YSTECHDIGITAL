export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ISalesRecord, SalesRecord } from "@/lib/models"

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
    const salesCollection = db.collection<ISalesRecord>("salesrecords")

    // Build search query
    const query: any = {}
    if (search) {
      query.$or = [
        { activationCode: { $regex: search, $options: "i" } },
        { product: { $regex: search, $options: "i" } },
        { productSubCategory: { $regex: search, $options: "i" } },
        { claimedBy: { $regex: search, $options: "i" } },
      ]
    }

    if (status && status !== "all") {
      query.status = status
    }

    console.log("Sales query:", JSON.stringify(query, null, 2))

    // Build sort object
    const sortObj: any = {}
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1

    // Get total count for pagination
    const total = await salesCollection.countDocuments(query)
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    console.log(`Sales pagination: page=${page}, limit=${limit}, skip=${skip}, total=${total}`)

    // Fetch paginated data
    const sales = await salesCollection.find(query).sort(sortObj).skip(skip).limit(limit).toArray()

    console.log(`Found ${sales.length} sales records`)

    const formattedSales: SalesRecord[] = sales.map((sale) => ({
      ...sale,
      id: sale._id?.toString() || "",
      _id: sale._id?.toString() || "",
      createdAt: sale.createdAt ? sale.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: sale.updatedAt ? sale.updatedAt.toISOString() : new Date().toISOString(),
      claimedDate: sale.claimedDate ? sale.claimedDate.toISOString() : undefined,
    }))

    return NextResponse.json({
      data: formattedSales,
      total,
      page,
      totalPages,
      limit,
    })
  } catch (error: any) {
    console.error("Error fetching sales records:", error)
    return NextResponse.json(
      {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
        limit: 10,
        error: error.message || "Failed to fetch sales records",
      },
      { status: 500 },
    )
  }
}
