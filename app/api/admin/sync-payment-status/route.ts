import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting payment status sync...")

    const { db } = await connectToDatabase()
    const claimsCollection = db.collection("claims")
    const transactionsCollection = db.collection("razorpay_transactions")

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 })
    }

    const pendingClaims = await claimsCollection
      .find({
        paymentStatus: "pending",
        razorpayOrderId: { $exists: true },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      })
      .toArray()

    console.log(`Found ${pendingClaims.length} pending claims to check`)

    let fixedCount = 0
    let checkedCount = 0
    const results = []

    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")

    for (const claim of pendingClaims) {
      try {
        checkedCount++
        console.log(`Checking claim ${claim.claimId} with order ${claim.razorpayOrderId}`)

        // Get payments for this order from Razorpay
        const paymentsResponse = await fetch(`https://api.razorpay.com/v1/orders/${claim.razorpayOrderId}/payments`, {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
        })

        if (!paymentsResponse.ok) {
          console.error(`Failed to fetch payments for order ${claim.razorpayOrderId}`)
          continue
        }

        const paymentsData = await paymentsResponse.json()
        const capturedPayment = paymentsData.items?.find((payment: any) => payment.status === "captured")

        if (capturedPayment) {
          console.log(`Found captured payment ${capturedPayment.id} for claim ${claim.claimId}`)

          // Update claim to paid status
          const claimUpdate = await claimsCollection.updateOne(
            { _id: claim._id },
            {
              $set: {
                paymentStatus: "paid",
                paymentId: capturedPayment.id,
                paidAt: new Date(capturedPayment.created_at * 1000),
                updatedAt: new Date(),
                ottStatus: "pending",
                razorpayStatus: "captured",
                razorpayAmount: capturedPayment.amount,
                lastSyncedAt: new Date(),
                syncedFromRazorpay: true,
              },
            },
          )

          // Create/update transaction record
          const transactionData = {
            razorpay_payment_id: capturedPayment.id,
            razorpay_order_id: claim.razorpayOrderId,
            claimId: claim.claimId,
            amount: capturedPayment.amount,
            currency: capturedPayment.currency,
            status: "captured",
            email: claim.email,
            contact: claim.phoneNumber || claim.phone,
            created_at: new Date(capturedPayment.created_at * 1000),
            captured_at: new Date(capturedPayment.created_at * 1000),
            updatedAt: new Date(),
            customerName: `${claim.firstName} ${claim.lastName}`,
            source: "razorpay_sync",
            razorpayData: capturedPayment,
            lastSyncedAt: new Date(),
          }

          await transactionsCollection.updateOne(
            { razorpay_payment_id: capturedPayment.id },
            {
              $set: transactionData,
              $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true },
          )

          fixedCount++
          results.push({
            claimId: claim.claimId,
            email: claim.email,
            paymentId: capturedPayment.id,
            amount: capturedPayment.amount,
            status: "fixed",
          })

          console.log(`✅ Fixed payment status for claim ${claim.claimId}`)

          // Trigger automation for this claim
          try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/webhook/claims-trigger`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ claimId: claim.claimId }),
            })
            console.log(`🤖 Triggered automation for claim ${claim.claimId}`)
          } catch (automationError) {
            console.error(`Failed to trigger automation for ${claim.claimId}:`, automationError)
          }
        } else {
          results.push({
            claimId: claim.claimId,
            email: claim.email,
            status: "still_pending",
          })
        }

        // Rate limiting - wait 100ms between API calls
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error checking claim ${claim.claimId}:`, error)
        results.push({
          claimId: claim.claimId,
          email: claim.email,
          status: "error",
          error: error.message,
        })
      }
    }

    console.log(`✅ Payment sync completed: ${fixedCount}/${checkedCount} claims fixed`)

    return NextResponse.json({
      success: true,
      message: `Payment sync completed: ${fixedCount}/${checkedCount} claims fixed`,
      results: {
        checked: checkedCount,
        fixed: fixedCount,
        details: results,
      },
    })
  } catch (error) {
    console.error("❌ Payment sync failed:", error)
    return NextResponse.json({ error: "Payment sync failed", details: error.message }, { status: 500 })
  }
}
