import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { connectToDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  let session = null
  let retryCount = 0
  const maxRetries = 3
  let razorpay_order_id: string
  let razorpay_payment_id: string
  let razorpay_signature: string
  let claimId: string

  while (retryCount < maxRetries) {
    try {
      console.log(`BytewiseTestingpoint Payment verification started (attempt ${retryCount + 1}/${maxRetries})`)

      const body = await request.json()
      razorpay_order_id = body.razorpay_order_id
      razorpay_payment_id = body.razorpay_payment_id
      razorpay_signature = body.razorpay_signature
      claimId = body.claimId

      console.log("BytewiseTestingpoint Payment verification data:", {
        razorpay_order_id,
        razorpay_payment_id,
        claimId,
        signature_received: !!razorpay_signature,
        attempt: retryCount + 1,
      })

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !claimId) {
        console.error("BytewiseTestingpoint Missing required payment verification fields")
        return NextResponse.json(
          {
            success: false,
            error: "Missing required payment verification fields",
          },
          { status: 400 },
        )
      }

      const razorpayKeyId = process.env.RAZORPAY_KEY_ID
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

      if (!razorpayKeySecret || !razorpayKeyId) {
        console.error("BytewiseTestingpoint Razorpay credentials not configured")
        return NextResponse.json(
          {
            success: false,
            error: "Payment configuration error",
          },
          { status: 500 },
        )
      }

      let razorpayPaymentData = null
      let razorpayVerificationAttempts = 0
      const maxRazorpayAttempts = 3

      while (razorpayVerificationAttempts < maxRazorpayAttempts) {
        try {
          console.log(
            `BytewiseTestingpoint Razorpay API verification attempt ${razorpayVerificationAttempts + 1}/${maxRazorpayAttempts}`,
          )

          const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")
          const razorpayResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
          })

          if (razorpayResponse.ok) {
            razorpayPaymentData = await razorpayResponse.json()
            console.log("BytewiseTestingpoint Razorpay payment status:", razorpayPaymentData.status)

            // If payment is not captured in Razorpay, retry the API call
            if (razorpayPaymentData.status !== "captured") {
              console.log(`BytewiseTestingpoint Payment status is ${razorpayPaymentData.status}, retrying API call...`)
              razorpayVerificationAttempts++

              if (razorpayVerificationAttempts < maxRazorpayAttempts) {
                // Wait before retrying (exponential backoff)
                await new Promise((resolve) => setTimeout(resolve, Math.pow(2, razorpayVerificationAttempts) * 1000))
                continue
              } else {
                console.error(
                  "BytewiseTestingpoint Payment not captured after all API attempts:",
                  razorpayPaymentData.status,
                )
                return NextResponse.json(
                  {
                    success: false,
                    error: `Payment status is ${razorpayPaymentData.status}, not captured after ${maxRazorpayAttempts} verification attempts`,
                  },
                  { status: 400 },
                )
              }
            }
            break // Success, exit the retry loop
          } else {
            razorpayVerificationAttempts++
            if (razorpayVerificationAttempts >= maxRazorpayAttempts) {
              console.error("BytewiseTestingpoint Failed to verify with Razorpay API after all attempts")
              // Continue with signature verification as fallback
              break
            }
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, razorpayVerificationAttempts) * 1000))
          }
        } catch (apiError) {
          console.error(
            `BytewiseTestingpoint Razorpay API error (attempt ${razorpayVerificationAttempts + 1}):`,
            apiError,
          )
          razorpayVerificationAttempts++

          if (razorpayVerificationAttempts >= maxRazorpayAttempts) {
            console.error("BytewiseTestingpoint Failed to verify with Razorpay API after all attempts")
            // Continue with signature verification as fallback
            break
          }
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, razorpayVerificationAttempts) * 1000))
        }
      }

      const body_string = razorpay_order_id + "|" + razorpay_payment_id
      const expectedSignature = crypto.createHmac("sha256", razorpayKeySecret).update(body_string).digest("hex")

      const isAuthentic = expectedSignature === razorpay_signature

      if (!isAuthentic) {
        console.error("BytewiseTestingpoint Invalid payment signature")
        return NextResponse.json(
          {
            success: false,
            error: "Invalid payment signature",
          },
          { status: 400 },
        )
      }

      console.log("BytewiseTestingpoint Payment signature verified successfully")

      const { client, db } = await connectToDatabase()
      session = client.startSession()

      let claimUpdateResult = null
      let transactionInsertResult = null
      let claim = null

      await session.withTransaction(
        async () => {
          const claimsCollection = db.collection("claims")
          const transactionsCollection = db.collection("razorpay_transactions")

          claim = await claimsCollection.findOne({ claimId }, { session })

          if (!claim) {
            console.error("BytewiseTestingpoint Claim not found:", claimId)
            throw new Error(`Claim not found: ${claimId}`)
          }

          console.log("BytewiseTestingpoint Found claim for payment update:", claim.claimId)

          const existingTransaction = await transactionsCollection.findOne(
            { razorpay_payment_id: razorpay_payment_id },
            { session },
          )

          if (existingTransaction && claim.paymentStatus === "paid") {
            console.log("BytewiseTestingpoint Payment already processed, skipping duplicate")
            throw new Error("DUPLICATE_PAYMENT")
          }

          claimUpdateResult = await claimsCollection.updateOne(
            { claimId },
            {
              $set: {
                paymentStatus: "paid",
                paymentId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                razorpaySignature: razorpay_signature,
                paidAt: new Date(),
                updatedAt: new Date(),
                ottStatus: "pending",
                verificationAttempt: retryCount + 1,
                verificationTimestamp: new Date(),
                razorpayStatus: razorpayPaymentData?.status || "captured",
                razorpayAmount: razorpayPaymentData?.amount || 9900,
                lastSyncedAt: new Date(),
                razorpayVerificationAttempts: razorpayVerificationAttempts,
              },
            },
            { session },
          )

          if (claimUpdateResult.matchedCount === 0) {
            console.error("BytewiseTestingpoint Failed to update claim payment status")
            throw new Error("Failed to update payment status - claim not matched")
          }

          console.log("BytewiseTestingpoint Claim updated successfully:", {
            matched: claimUpdateResult.matchedCount,
            modified: claimUpdateResult.modifiedCount,
          })

          const transactionData = {
            razorpay_payment_id: razorpay_payment_id,
            razorpay_order_id: razorpay_order_id,
            razorpay_signature: razorpay_signature,
            claimId: claimId,
            amount: razorpayPaymentData?.amount || 9900,
            currency: "INR",
            status: "captured",
            email: claim.email,
            contact: claim.phoneNumber || claim.phone,
            created_at: new Date(),
            captured_at: new Date(),
            updatedAt: new Date(),
            verificationAttempt: retryCount + 1,
            verificationTimestamp: new Date(),
            customerName: `${claim.firstName} ${claim.lastName}`,
            source: "payment_verification",
            razorpayData: razorpayPaymentData,
            lastSyncedAt: new Date(),
            razorpayVerificationAttempts: razorpayVerificationAttempts,
          }

          transactionInsertResult = await transactionsCollection.updateOne(
            { razorpay_payment_id: razorpay_payment_id },
            {
              $set: transactionData,
              $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true, session },
          )

          console.log("BytewiseTestingpoint Transaction record saved:", {
            upserted: transactionInsertResult.upsertedCount,
            modified: transactionInsertResult.modifiedCount,
            matched: transactionInsertResult.matchedCount,
          })

          const verifyClaimUpdate = await claimsCollection.findOne({ claimId, paymentStatus: "paid" }, { session })

          const verifyTransactionUpdate = await transactionsCollection.findOne(
            { razorpay_payment_id: razorpay_payment_id },
            { session },
          )

          if (!verifyClaimUpdate || !verifyTransactionUpdate) {
            console.error("BytewiseTestingpoint Verification failed after update:", {
              claimVerified: !!verifyClaimUpdate,
              transactionVerified: !!verifyTransactionUpdate,
            })
            throw new Error("Data verification failed after update")
          }

          console.log("BytewiseTestingpoint Both claim and transaction verified successfully")

          const paymentAttemptsCollection = db.collection("payment_attempts")
          const userIdentifier = `${claim.email}_${claim.phoneNumber || claim.phone}`

          await paymentAttemptsCollection.updateOne(
            { userIdentifier, claimId },
            {
              $set: {
                attemptCount: 0,
                lastSuccessfulPayment: new Date(),
                updatedAt: new Date(),
              },
              $unset: { cooldownUntil: "" },
            },
          )

          console.log("BytewiseTestingpoint Payment attempts reset for successful payment")
        },
        {
          readConcern: { level: "majority" },
          writeConcern: { w: "majority", j: true },
          maxCommitTimeMS: 30000,
        },
      )

      console.log("BytewiseTestingpoint Database transaction completed successfully")

      try {
        console.log("BytewiseTestingpoint Sending payment success email...")
        const customerName = `${claim.firstName} ${claim.lastName}`

        await sendEmail({
          to: claim.email,
          subject: "🎉 Payment Successful - OTT Code Processing Started - SYSTECH IT SOLUTIONS",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0fdf4;">
              <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Payment Successful!</h1>
                <p style="color: #dcfce7; margin: 10px 0 0 0; font-size: 16px;">Your OTT code is being processed</p>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #22c55e;">
                  <h2 style="color: #15803d; margin: 0 0 10px 0; font-size: 20px;">Payment Details</h2>
                  <p style="margin: 5px 0; color: #374151;"><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
                  <p style="margin: 5px 0; color: #374151;"><strong>Order ID:</strong> ${razorpay_order_id}</p>
                  <p style="margin: 5px 0; color: #374151;"><strong>Claim ID:</strong> ${claimId}</p>
                  <p style="margin: 5px 0; color: #374151;"><strong>Customer:</strong> ${customerName}</p>
                  <p style="margin: 5px 0; color: #374151;"><strong>Amount Paid:</strong> ₹99</p>
                  <p style="margin: 5px 0; color: #374151;"><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">Successful</span></p>
                  <p style="margin: 5px 0; color: #374151;"><strong>OTT Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Processing</span></p>
                </div>

                <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
                  <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">What Happens Next?</h3>
                  <ol style="color: #374151; margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Your Coupon code, Product Serial Number, or IMEI Number will be verified.</li>
                    <li style="margin-bottom: 8px;">Once your claim is submitted and successfully verified, your OTTplay Coupon code will be generated and sent to your registered email ID.</li>
                    <li style="margin-bottom: 8px;">You'll receive the code within 24-48 hours</li>
                    <li>Start enjoying your premium OTTplay subscription!</li>
                  </ol>
                </div>

                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #92400e; margin: 0; font-size: 14px; text-align: center;">
                    <strong>Processing Time:</strong> Your OTTplay Coupon code will be delivered to this email address within 24-48 hours. Please check your inbox and spam folder.
                  </p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    Need help? Contact us at <a href="mailto:sales.systechdigital@gmail.com" style="color: #3b82f6;">sales.systechdigital@gmail.com</a>
                  </p>
                </div>
              </div>
            </div>
          `,
        })

        console.log("BytewiseTestingpoint Payment success email sent successfully")
      } catch (emailError) {
        console.error("BytewiseTestingpoint Failed to send payment success email:", emailError)
        try {
          await db.collection("email_failures").insertOne({
            claimId,
            razorpay_payment_id,
            email: claim.email,
            error: emailError.message,
            timestamp: new Date(),
            type: "payment_success",
          })
        } catch (logError) {
          console.error("BytewiseTestingpoint Failed to log email failure:", logError)
        }
      }

      try {
        console.log("BytewiseTestingpoint Triggering automation for claim:", claimId)
        const automationResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/webhook/claims-trigger`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ claimId }),
          },
        )

        if (automationResponse.ok) {
          console.log("BytewiseTestingpoint Automation triggered successfully")
        } else {
          const errorText = await automationResponse.text()
          console.error("BytewiseTestingpoint Failed to trigger automation:", errorText)

          await db.collection("automation_failures").insertOne({
            claimId,
            razorpay_payment_id,
            error: errorText,
            timestamp: new Date(),
            status: automationResponse.status,
          })
        }
      } catch (automationError) {
        console.error("BytewiseTestingpoint Error triggering automation:", automationError)

        try {
          await db.collection("automation_failures").insertOne({
            claimId,
            razorpay_payment_id,
            error: automationError.message,
            timestamp: new Date(),
            type: "network_error",
          })
        } catch (logError) {
          console.error("BytewiseTestingpoint Failed to log automation failure:", logError)
        }
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified and claim updated successfully",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        claimId,
        attempt: retryCount + 1,
        razorpayVerificationAttempts: razorpayVerificationAttempts,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`BytewiseTestingpoint Payment verification error (attempt ${retryCount + 1}):`, error)

      if (error.message === "DUPLICATE_PAYMENT") {
        return NextResponse.json({
          success: true,
          message: "Payment already processed successfully",
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          claimId,
          duplicate: true,
        })
      }

      if (retryCount < maxRetries - 1 && isRetryableError(error)) {
        retryCount++
        console.log(`BytewiseTestingpoint Retrying payment verification (attempt ${retryCount + 1}/${maxRetries})`)

        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
        continue
      }

      try {
        const { db } = await connectToDatabase()

        // Log the verification failure
        await db.collection("payment_verification_failures").insertOne({
          razorpay_payment_id,
          razorpay_order_id,
          claimId,
          error: error.message,
          stack: error.stack,
          attempts: retryCount + 1,
          timestamp: new Date(),
          finalFailure: true,
        })

        // Update payment attempts with failure information
        if (claimId) {
          const claimsCollection = db.collection("claims")
          const claim = await claimsCollection.findOne({ claimId })

          if (claim) {
            const paymentAttemptsCollection = db.collection("payment_attempts")
            const userIdentifier = `${claim.email}_${claim.phoneNumber || claim.phone}`

            await paymentAttemptsCollection.updateOne(
              { userIdentifier, claimId },
              {
                $set: {
                  lastFailedAttempt: new Date(),
                  lastFailureReason: error.message,
                  updatedAt: new Date(),
                },
              },
            )
          }
        }
      } catch (logError) {
        console.error("BytewiseTestingpoint Failed to log payment verification failure:", logError)
      }

      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Payment verification failed",
          attempts: retryCount + 1,
        },
        { status: 500 },
      )
    } finally {
      if (session) {
        await session.endSession()
      }
    }
  }
}

function isRetryableError(error: any): boolean {
  const retryableErrors = [
    "MongoNetworkError",
    "MongoTimeoutError",
    "MongoWriteConcernError",
    "Connection",
    "timeout",
    "ECONNRESET",
    "ENOTFOUND",
    "ETIMEDOUT",
  ]

  const errorMessage = error.message || error.toString()
  return retryableErrors.some(
    (retryableError) => errorMessage.includes(retryableError) || error.name?.includes(retryableError),
  )
}
