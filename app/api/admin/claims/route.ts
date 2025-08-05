export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { IClaimResponse, ClaimResponse } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()

    // Sort by createdAt in descending order (-1)
    const claims = await db.collection<IClaimResponse>("claims").find({}).sort({ createdAt: -1 }).toArray()

    const formattedClaims: ClaimResponse[] = claims.map((claim) => ({
      ...claim,
      id: claim._id?.toString() || "",
      _id: claim._id?.toString() || "",
      createdAt: claim.createdAt ? claim.createdAt.toString() : new Date().toISOString(),
      updatedAt: claim.updatedAt ? claim.updatedAt.toString() : "",
    }))

    console.log(`Fetched ${formattedClaims.length} claims from systech_ott_platform`)

    return NextResponse.json(formattedClaims)
  } catch (error: any) {
    console.error("Error fetching claims:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch claims" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const db = await getDatabase()

    // Get all claims for admin dashboard
    const claims = await db.collection<IClaimResponse>("claims").find({}).sort({ createdAt: -1 }).toArray()

    const formattedClaims: ClaimResponse[] = claims.map((claim) => ({
      ...claim,
      id: claim._id?.toString() || "",
      _id: claim._id?.toString() || "",
      createdAt: claim.createdAt ? claim.createdAt.toString() : new Date().toISOString(),
      updatedAt: claim.updatedAt ? claim.updatedAt.toString() : "",
      // Ensure all required fields are present
      firstName: claim.firstName || "",
      lastName: claim.lastName || "",
      email: claim.email || "",
      phoneNumber: claim.phoneNumber || claim.phone || "",
      address: claim.address || "",
      state: claim.state || "",
      city: claim.city || "",
      pincode: claim.pincode || "",
      activationCode: claim.activationCode || "",
      paymentStatus: claim.paymentStatus || "pending",
      ottCodeStatus: claim.ottCodeStatus || claim.ottStatus || "pending",
      ottCode: claim.ottCode || "",
      razorpayOrderId: claim.razorpayOrderId || "",
      paymentId: claim.paymentId || "",
      claimId: claim.claimId || "",
    }))

    console.log(`Admin fetched ${formattedClaims.length} claims from systech_ott_platform`)

    return NextResponse.json({
      success: true,
      claims: formattedClaims,
      total: formattedClaims.length,
    })
  } catch (error: any) {
    console.error("Error fetching admin claims:", error)
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
