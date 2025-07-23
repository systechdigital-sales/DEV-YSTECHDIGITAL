import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Fetch all required data
    const [claimsResponse, salesResponse, keysResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/admin/claims`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/admin/sales`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/admin/keys`),
    ])

    const claims = await claimsResponse.json()
    const sales = await salesResponse.json()
    const keys = await keysResponse.json()

    let processed = 0
    let ottCodesSent = 0
    let waitEmails = 0
    let alreadyClaimed = 0

    // Process only claims with completed payments
    const paidClaims = claims.filter(
      (claim: any) => claim.paymentStatus === "completed" && claim.ottCodeStatus === "pending",
    )

    for (const claim of paidClaims) {
      processed++

      // Check if activation code exists in sales records
      const salesRecord = sales.find((sale: any) => sale.activationCode === claim.activationCode)

      if (!salesRecord) {
        // Code not found in sales - send wait email
        console.log(`Sending wait email to ${claim.email} for code ${claim.activationCode}`)
        // In production: send email with "Wait 48 hours" message
        waitEmails++
        continue
      }

      // Check if code was already used for OTT claim
      const alreadyUsed = claims.find(
        (c: any) => c.activationCode === claim.activationCode && c.ottCodeStatus === "sent" && c.id !== claim.id,
      )

      if (alreadyUsed) {
        // Code already claimed - send already claimed email
        console.log(`Sending already claimed email to ${claim.email} for code ${claim.activationCode}`)
        // In production: send email with "Already claimed. Contact sales..." message
        alreadyClaimed++
        continue
      }

      // Find available OTT code
      const availableKey = keys.find((key: any) => key.status === "available")

      if (availableKey) {
        // Assign OTT code and send email
        console.log(`Assigning OTT code ${availableKey.activationCode} to ${claim.email}`)

        // In production:
        // 1. Update claim record with OTT code and status
        // 2. Update OTT key as used
        // 3. Send email with OTT code

        // Mock update operations
        claim.ottCodeStatus = "sent"
        claim.ottCode = availableKey.activationCode

        availableKey.status = "used"
        availableKey.assignedEmail = claim.email
        availableKey.assignedDate = new Date().toISOString()

        ottCodesSent++
      } else {
        // No available OTT codes - send wait email
        console.log(`No available OTT codes for ${claim.email}`)
        waitEmails++
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      ottCodesSent,
      waitEmails,
      alreadyClaimed,
      message: "Automation completed successfully",
    })
  } catch (error) {
    console.error("Error processing automation:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process automation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
