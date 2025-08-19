import { connectToDatabase } from "../lib/mongodb.js"

async function fixMissingPaymentData() {
  try {
    console.log("[v0] Starting comprehensive data recovery for missing payment records...")

    const { db } = await connectToDatabase()
    const claimsCollection = db.collection("claims")
    const transactionsCollection = db.collection("razorpay_transactions")

    // Find claims with payment status "paid" but missing transaction records
    const paidClaimsWithoutTransactions = await claimsCollection
      .find({
        paymentStatus: "paid",
        $or: [
          { paymentId: { $exists: true, $ne: null, $ne: "" } },
          { razorpayOrderId: { $exists: true, $ne: null, $ne: "" } },
        ],
      })
      .toArray()

    console.log("[v0] Found", paidClaimsWithoutTransactions.length, "paid claims to check")

    let recoveredCount = 0
    let alreadyExistsCount = 0
    let updatedCount = 0

    for (const claim of paidClaimsWithoutTransactions) {
      // Check if transaction record exists
      let existingTransaction = null

      if (claim.paymentId) {
        existingTransaction = await transactionsCollection.findOne({
          razorpay_payment_id: claim.paymentId,
        })
      }

      if (!existingTransaction && claim.razorpayOrderId) {
        existingTransaction = await transactionsCollection.findOne({
          razorpay_order_id: claim.razorpayOrderId,
        })
      }

      if (!existingTransaction) {
        const transactionData = {
          razorpay_payment_id: claim.paymentId || `recovered_${claim.claimId}_${Date.now()}`,
          razorpay_order_id: claim.razorpayOrderId || "",
          razorpay_signature: claim.razorpaySignature || "",
          claimId: claim.claimId,
          amount: 9900, // 99 rupees in paise
          currency: "INR",
          status: "captured",
          email: claim.email,
          contact: claim.phoneNumber || claim.phone || "",
          created_at: claim.paidAt || claim.createdAt || new Date(),
          captured_at: claim.paidAt || claim.createdAt || new Date(),
          updatedAt: new Date(),
          createdAt: new Date(),
          recovered: true, // Mark as recovered for tracking
          recoveryTimestamp: new Date(),
          customerName: `${claim.firstName || ""} ${claim.lastName || ""}`.trim(),
          source: "data_recovery_script",
        }

        await transactionsCollection.insertOne(transactionData)
        recoveredCount++

        console.log("[v0] Recovered transaction for claim:", claim.claimId)
      } else {
        const updates = {}

        if (!existingTransaction.claimId) {
          updates.claimId = claim.claimId
        }

        if (!existingTransaction.email && claim.email) {
          updates.email = claim.email
        }

        if (!existingTransaction.contact && (claim.phoneNumber || claim.phone)) {
          updates.contact = claim.phoneNumber || claim.phone
        }

        if (!existingTransaction.customerName && (claim.firstName || claim.lastName)) {
          updates.customerName = `${claim.firstName || ""} ${claim.lastName || ""}`.trim()
        }

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = new Date()
          updates.dataEnhanced = true

          await transactionsCollection.updateOne({ _id: existingTransaction._id }, { $set: updates })
          updatedCount++
          console.log("[v0] Enhanced transaction data for claim:", claim.claimId)
        }

        alreadyExistsCount++
      }
    }

    const orphanedTransactions = await transactionsCollection
      .find({
        $or: [{ claimId: { $exists: false } }, { claimId: null }, { claimId: "" }],
        status: { $in: ["captured", "authorized"] }, // Only process successful payments
      })
      .toArray()

    console.log("[v0] Found", orphanedTransactions.length, "orphaned transactions")

    let matchedOrphansCount = 0

    for (const transaction of orphanedTransactions) {
      let matchingClaim = null

      // Strategy 1: Match by razorpay_order_id
      if (transaction.razorpay_order_id) {
        matchingClaim = await claimsCollection.findOne({
          razorpayOrderId: transaction.razorpay_order_id,
        })
      }

      // Strategy 2: Match by paymentId
      if (!matchingClaim && transaction.razorpay_payment_id) {
        matchingClaim = await claimsCollection.findOne({
          paymentId: transaction.razorpay_payment_id,
        })
      }

      // Strategy 3: Match by email and contact with time proximity
      if (!matchingClaim && transaction.email && transaction.contact) {
        const transactionTime = transaction.created_at || transaction.createdAt
        const timeWindow = 6 * 60 * 60 * 1000 // 6 hours window

        matchingClaim = await claimsCollection.findOne({
          $and: [
            { email: transaction.email },
            {
              $or: [{ phoneNumber: transaction.contact }, { phone: transaction.contact }],
            },
            { paymentStatus: "paid" },
            {
              $or: [
                {
                  createdAt: {
                    $gte: new Date(transactionTime.getTime() - timeWindow),
                    $lte: new Date(transactionTime.getTime() + timeWindow),
                  },
                },
                {
                  paidAt: {
                    $gte: new Date(transactionTime.getTime() - timeWindow),
                    $lte: new Date(transactionTime.getTime() + timeWindow),
                  },
                },
              ],
            },
          ],
        })
      }

      // Strategy 4: Match by email only with stricter time window
      if (!matchingClaim && transaction.email) {
        const transactionTime = transaction.created_at || transaction.createdAt
        const strictWindow = 2 * 60 * 60 * 1000 // 2 hours for email-only matching

        matchingClaim = await claimsCollection.findOne({
          email: transaction.email,
          paymentStatus: "paid",
          $or: [{ razorpayOrderId: { $exists: false } }, { razorpayOrderId: null }, { razorpayOrderId: "" }],
          $or: [
            {
              createdAt: {
                $gte: new Date(transactionTime.getTime() - strictWindow),
                $lte: new Date(transactionTime.getTime() + strictWindow),
              },
            },
            {
              paidAt: {
                $gte: new Date(transactionTime.getTime() - strictWindow),
                $lte: new Date(transactionTime.getTime() + strictWindow),
              },
            },
          ],
        })
      }

      if (matchingClaim) {
        await transactionsCollection.updateOne(
          { _id: transaction._id },
          {
            $set: {
              claimId: matchingClaim.claimId,
              updatedAt: new Date(),
              matchedAt: new Date(),
              matchStrategy: getMatchStrategy(transaction, matchingClaim),
            },
          },
        )

        // Update claim if missing payment details
        const claimUpdates = {}
        if (!matchingClaim.paymentId && transaction.razorpay_payment_id) {
          claimUpdates.paymentId = transaction.razorpay_payment_id
        }
        if (!matchingClaim.razorpayOrderId && transaction.razorpay_order_id) {
          claimUpdates.razorpayOrderId = transaction.razorpay_order_id
        }

        if (Object.keys(claimUpdates).length > 0) {
          claimUpdates.updatedAt = new Date()
          claimUpdates.matchedAt = new Date()

          await claimsCollection.updateOne({ claimId: matchingClaim.claimId }, { $set: claimUpdates })
        }

        matchedOrphansCount++
        console.log(
          "[v0] Matched orphaned transaction:",
          transaction.razorpay_payment_id,
          "with claim:",
          matchingClaim.claimId,
        )
      }
    }

    const recoveryReport = {
      timestamp: new Date(),
      recoveredTransactions: recoveredCount,
      alreadyExistingTransactions: alreadyExistsCount,
      enhancedTransactions: updatedCount,
      matchedOrphanedTransactions: matchedOrphansCount,
      totalClaimsProcessed: paidClaimsWithoutTransactions.length,
      totalOrphanedTransactions: orphanedTransactions.length,
      success: true,
    }

    // Store recovery report
    await db.collection("recovery_reports").insertOne(recoveryReport)

    console.log("[v0] Data recovery completed successfully:")
    console.log("- Recovered missing transactions:", recoveredCount)
    console.log("- Already existing transactions:", alreadyExistsCount)
    console.log("- Enhanced existing transactions:", updatedCount)
    console.log("- Matched orphaned transactions:", matchedOrphansCount)
    console.log("- Total claims processed:", paidClaimsWithoutTransactions.length)
    console.log("- Total orphaned transactions found:", orphanedTransactions.length)

    return recoveryReport
  } catch (error) {
    console.error("[v0] Error in data recovery:", error)
    throw error
  }
}

function getMatchStrategy(transaction, claim) {
  if (claim.razorpayOrderId === transaction.razorpay_order_id) return "order_id"
  if (claim.paymentId === transaction.razorpay_payment_id) return "payment_id"
  if (
    claim.email === transaction.email &&
    (claim.phoneNumber === transaction.contact || claim.phone === transaction.contact)
  )
    return "email_contact"
  if (claim.email === transaction.email) return "email_time_proximity"
  return "unknown"
}

// Run the recovery
fixMissingPaymentData()
  .then((result) => {
    console.log("[v0] Recovery completed successfully:", result)
    process.exit(0)
  })
  .catch((error) => {
    console.error("[v0] Recovery failed:", error)
    process.exit(1)
  })
