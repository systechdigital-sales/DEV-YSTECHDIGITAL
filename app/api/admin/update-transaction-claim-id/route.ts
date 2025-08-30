import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI is not defined")
}

const client = new MongoClient(uri)

export async function POST(request: NextRequest) {
  try {
    const { transactionId, claimId } = await request.json()

    console.log("Bytewise Updating transaction claim ID:", { transactionId, claimId })

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    await client.connect()
    const db = client.db("systech_digital")
    const transactionsCollection = db.collection("razorpay_transactions")

    let query
    try {
      query = { _id: new ObjectId(transactionId) }
    } catch (error) {
      // If it's not a valid ObjectId, try as string
      query = { _id: transactionId }
    }

    console.log("Bytewise Query:", query)

    // Update the transaction with the new claim ID
    const result = await transactionsCollection.updateOne(query, {
      $set: {
        claimId: claimId || null,
        updatedAt: new Date(),
      },
    })

    console.log("Bytewise Update result:", result)

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Claim ID updated successfully",
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error updating transaction claim ID:", error)
    return NextResponse.json(
      {
        error: "Failed to update claim ID",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  } finally {
    await client.close()
  }
}
