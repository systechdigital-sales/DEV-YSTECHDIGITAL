import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { OTTKey } from "@/lib/models"

// Mock OTT keys database
const mockOTTKeys = [
  {
    id: "1",
    productSubCategory: "Streaming",
    product: "Netflix",
    activationCode: "NFLX-PREM-12345",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    productSubCategory: "Streaming",
    product: "Amazon Prime",
    activationCode: "AMZN-PRIME-67890",
    status: "assigned",
    assignedEmail: "john.doe@example.com",
    assignedDate: "2025-07-20T10:35:00Z",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    productSubCategory: "Streaming",
    product: "Disney+",
    activationCode: "DSNY-PLUS-54321",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    productSubCategory: "Music",
    product: "Spotify Premium",
    activationCode: "SPTFY-PREM-98765",
    status: "available",
    assignedEmail: null,
    assignedDate: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    productSubCategory: "Gaming",
    product: "Xbox Game Pass",
    activationCode: "XBOX-PASS-13579",
    status: "assigned",
    assignedEmail: "jane.smith@example.com",
    assignedDate: "2025-07-22T14:20:00Z",
    createdAt: new Date().toISOString(),
  },
]

export async function GET() {
  try {
    const db = await getDatabase()
    const keys = await db.collection<OTTKey>("ott_keys").find({}).sort({ createdAt: -1 }).toArray()

    // Convert MongoDB _id to string and ensure id field exists
    const formattedKeys = keys.map((key) => ({
      ...key,
      id: key.id || key._id?.toString() || "",
      _id: undefined,
    }))

    return NextResponse.json(formattedKeys)
  } catch (error) {
    console.error("Error fetching OTT keys:", error)
    return NextResponse.json({ error: "Failed to fetch OTT keys" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const keysData = await request.json()
    const db = await getDatabase()

    if (!Array.isArray(keysData)) {
      return NextResponse.json({ success: false, error: "Invalid data format" }, { status: 400 })
    }

    // Add IDs and default values to new keys
    const keysWithIds: OTTKey[] = keysData.map((key, index) => ({
      id: `key_${Date.now()}_${index}`,
      productSubCategory: key.productSubCategory,
      product: key.product,
      activationCode: key.activationCode,
      status: key.status || "available",
      assignedEmail: key.assignedEmail || null,
      assignedDate: key.assignedDate || null,
      createdAt: new Date().toISOString(),
    }))

    // Insert all keys
    const result = await db.collection<OTTKey>("ott_keys").insertMany(keysWithIds)

    return NextResponse.json({
      success: true,
      count: result.insertedCount,
      message: `Successfully saved ${result.insertedCount} OTT keys`,
    })
  } catch (error) {
    console.error("Error saving OTT keys:", error)
    return NextResponse.json({ success: false, error: "Failed to save OTT keys" }, { status: 500 })
  }
}
