import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import ClaimResponse from "@/models/ClaimResponse"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ success: false, message: "Email parameter is required" }, { status: 400 })
    }

    await dbConnect()

    // Find all claims for the specific email
    const claims = await ClaimResponse.find({
      email: email.toLowerCase(),
    }).sort({ createdAt: -1 }) // Sort by newest first

    if (!claims || claims.length === 0) {
      return NextResponse.json({
        success: true,
        claims: [],
        message: "No claims found for this email address",
      })
    }

    // Format the response data
    const formattedClaims = claims.map((claim) => ({
      _id: claim._id.toString(),
      firstName: claim.firstName,
      lastName: claim.lastName,
      email: claim.email,
      phoneNumber: claim.phoneNumber,
      activationCode: claim.activationCode,
      purchaseDate: claim.createdAt, // Using createdAt as purchase date for now
      ottCodeStatus: claim.ottCodeStatus,
      paymentStatus: claim.paymentStatus,
      ottCode: claim.ottCode || null,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      claims: formattedClaims,
      total: formattedClaims.length,
    })
  } catch (error) {
    console.error("Error fetching customer claims:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch claims. Please try again later." },
      { status: 500 },
    )
  }
}
