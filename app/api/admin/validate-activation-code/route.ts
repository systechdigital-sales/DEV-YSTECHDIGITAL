import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { activationCode } = await request.json()

    if (!activationCode) {
      return NextResponse.json({
        isValid: false,
        message: "Activation code is required",
      })
    }

    const { db } = await connectToDatabase()

    // Check if activation code exists in salesrecords
    const salesRecord = await db.collection("salesrecords").findOne({
      activationCode: activationCode,
    })

    if (!salesRecord) {
      return NextResponse.json({
        isValid: false,
        message: "Activation code not found in sales records",
      })
    }

    // Check if already claimed
    const existingClaim = await db.collection("claims").findOne({
      activationCode: activationCode,
    })

    if (existingClaim) {
      return NextResponse.json({
        isValid: false,
        message: "Activation code has already been claimed",
      })
    }

    return NextResponse.json({
      isValid: true,
      message: `Valid activation code for ${salesRecord.platform || "OTT platform"}`,
    })
  } catch (error) {
    console.error("Validation error:", error)
    return NextResponse.json({
      isValid: false,
      message: "Error validating activation code",
    })
  }
}
