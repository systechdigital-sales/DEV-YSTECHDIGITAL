import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import ClaimResponse from "@/models/ClaimResponse"
import OTTKey from "@/models/OTTKey"
import { SignupFormSchema } from "@/lib/definitions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate form fields using Zod
    const validatedFields = SignupFormSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { firstName, lastName, email, phoneNumber } = validatedFields.data
    const normalizedEmail = email.toLowerCase().trim()

    // Connect to database
    let db
    try {
      ;({ db } = await connectToDatabase())
      console.log("Database connection established for signup route.")
    } catch (dbError) {
      console.error("Database connection error in signup route:", dbError)
      return NextResponse.json(
        { success: false, message: "Failed to connect to the database. Please try again later." },
        { status: 500 },
      )
    }

    // Check if user already exists in claims collection
    let existingClaim
    try {
      existingClaim = await ClaimResponse.findOne({ email: normalizedEmail })
      if (existingClaim) {
        return NextResponse.json(
          { success: false, message: "An account with this email already exists. Please login instead." },
          { status: 409 },
        )
      }
    } catch (checkError) {
      console.error("Error checking existing claim:", checkError)
      return NextResponse.json(
        { success: false, message: "An error occurred during signup. Please try again later." },
        { status: 500 },
      )
    }

    // Find an available OTT key
    let availableOTTKey
    try {
      availableOTTKey = await OTTKey.findOneAndUpdate(
        { status: "available" },
        { $set: { status: "assigned", assignedTo: normalizedEmail, assignedAt: new Date() } },
        { new: true }, // Return the updated document
      )
      console.log("Found and assigned OTT key:", availableOTTKey?.ottCode)
    } catch (ottKeyError) {
      console.error("Error assigning OTT key:", ottKeyError)
      return NextResponse.json(
        { success: false, message: "Failed to assign an OTT code. Please try again later." },
        { status: 500 },
      )
    }

    if (!availableOTTKey) {
      return NextResponse.json(
        { success: false, message: "No available OTT codes at the moment. Please try again later." },
        { status: 503 },
      )
    }

    // Create a new claim response
    const newClaim = new ClaimResponse({
      firstName,
      lastName,
      email: normalizedEmail,
      phoneNumber,
      activationCode: "SIGNUP-" + Math.random().toString(36).substring(2, 10).toUpperCase(), // Generate a simple activation code
      paymentStatus: "paid", // Assuming signup implies payment is handled or not required for this flow
      ottCode: availableOTTKey.ottCode,
      ottCodeStatus: "delivered", // Mark as delivered since it's assigned
      ottAssignedAt: new Date(),
    })

    try {
      await newClaim.save()
      console.log("New claim saved:", newClaim._id)
    } catch (saveError) {
      console.error("Error saving new claim:", saveError)
      // If saving claim fails, try to revert OTT key status
      await OTTKey.findOneAndUpdate(
        { _id: availableOTTKey._id },
        { $set: { status: "available", assignedTo: null, assignedAt: null } },
      ).catch((revertError) => console.error("Failed to revert OTT key status:", revertError))
      return NextResponse.json(
        { success: false, message: "Failed to create your account. Please try again later." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Account created and OTT code assigned successfully!",
      ottCode: availableOTTKey.ottCode,
    })
  } catch (error) {
    console.error("An unexpected error occurred in signup route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during signup. Please try again later." },
      { status: 500 },
    )
  }
}
