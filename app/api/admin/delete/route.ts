export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const id = searchParams.get("id")
    const ids = searchParams.get("ids")
    const password = searchParams.get("password")

    console.log("Delete request:", { type, id, ids, password })

    // Validate password
    if (password !== "Admin@12345") {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 })
    }

    // Validate type
    if (!type || !["claims", "sales", "keys"].includes(type)) {
      return NextResponse.json({ error: "Invalid record type" }, { status: 400 })
    }

    const db = await getDatabase()

    // Map type to collection name
    const collectionMap = {
      claims: "claims",
      sales: "salesrecords",
      keys: "ottkeys",
    }

    const collectionName = collectionMap[type as keyof typeof collectionMap]
    const collection = db.collection(collectionName)

    let result
    let deletedCount = 0

    if (ids) {
      // Bulk delete
      const idArray = ids.split(",").map((id) => id.trim())
      console.log("Bulk delete IDs:", idArray)

      // Try to convert to ObjectIds, fallback to string comparison
      const objectIds = idArray.map((id) => {
        try {
          return ObjectId.isValid(id) ? new ObjectId(id) : id
        } catch {
          return id
        }
      })

      result = await collection.deleteMany({
        $or: [
          { _id: { $in: objectIds.filter((id) => id instanceof ObjectId) } },
          { _id: { $in: objectIds.filter((id) => typeof id === "string") } },
        ],
      })

      deletedCount = result.deletedCount
      console.log("Bulk delete result:", result)

      return NextResponse.json({
        message: `Successfully deleted ${deletedCount} ${type} record(s) from systech_ott_platform database`,
        deletedCount,
      })
    } else if (id) {
      // Single delete
      console.log("Single delete ID:", id)

      let query
      try {
        // Try ObjectId first
        if (ObjectId.isValid(id)) {
          query = { _id: new ObjectId(id) }
        } else {
          query = { _id: id }
        }
      } catch {
        query = { _id: id }
      }

      console.log("Delete query:", query)

      result = await collection.deleteOne(query)
      deletedCount = result.deletedCount
      console.log("Single delete result:", result)

      if (deletedCount === 0) {
        return NextResponse.json({ error: "Record not found" }, { status: 404 })
      }

      return NextResponse.json({
        message: `Successfully deleted ${type} record from systech_ott_platform database`,
        deletedCount,
      })
    } else {
      return NextResponse.json({ error: "No ID or IDs provided" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: error.message || "Failed to delete record(s)" }, { status: 500 })
  }
}
