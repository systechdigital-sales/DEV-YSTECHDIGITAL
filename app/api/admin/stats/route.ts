export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()

    // Get today's date range (start and end of today in UTC)
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    console.log("Today's date range:", { startOfToday, endOfToday })

    // Get claims statistics
    const claimsStats = await db
      .collection("claims")
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            paid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ["$paymentStatus", "failed"] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $eq: ["$ottCodeStatus", "delivered"] }, 1, 0] } },
          },
        },
      ])
      .toArray()

    const todaysClaimsStats = await db
      .collection("claims")
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfToday,
              $lt: endOfToday,
            },
          },
        },
        {
          $group: {
            _id: null,
            todaysClaims: { $sum: 1 },
            todaysPaidClaims: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] } },
            todaysCollectionAmount: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "paid"] }, { $toDouble: "$amount" }, 0],
              },
            },
          },
        },
      ])
      .toArray()

    // Get sales statistics
    const salesStats = await db
      .collection("salesrecords")
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            available: { $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] } },
            claimed: { $sum: { $cond: [{ $eq: ["$status", "claimed"] }, 1, 0] } },
          },
        },
      ])
      .toArray()

    // Get keys statistics
    const keysStats = await db
      .collection("ottkeys")
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            available: { $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] } },
            assigned: { $sum: { $cond: [{ $eq: ["$status", "assigned"] }, 1, 0] } },
            used: { $sum: { $cond: [{ $eq: ["$status", "used"] }, 1, 0] } },
          },
        },
      ])
      .toArray()

    const claims = claimsStats[0] || { total: 0, paid: 0, pending: 0, failed: 0, delivered: 0 }
    const todaysClaims = todaysClaimsStats[0] || { todaysClaims: 0, todaysPaidClaims: 0, todaysCollectionAmount: 0 }
    const sales = salesStats[0] || { total: 0, available: 0, claimed: 0 }
    const keys = keysStats[0] || { total: 0, available: 0, assigned: 0, used: 0 }

    console.log("[v0] Today's claims data:", todaysClaims)

    return NextResponse.json({
      totalClaims: claims.total,
      paidClaims: claims.paid,
      pendingClaims: claims.pending,
      failedClaims: claims.failed,
      deliveredClaims: claims.delivered,
      successful: claims.delivered,
      todaysClaims: todaysClaims.todaysClaims,
      todaysPaidClaims: todaysClaims.todaysPaidClaims,
      todaysCollectionAmount: todaysClaims.todaysCollectionAmount,
      totalSales: sales.total,
      availableSales: sales.available,
      claimedSales: sales.claimed,
      totalKeys: keys.total,
      availableKeys: keys.available,
      assignedKeys: keys.assigned,
      usedKeys: keys.used,
    })
  } catch (error: any) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      {
        totalClaims: 0,
        paidClaims: 0,
        pendingClaims: 0,
        failedClaims: 0,
        deliveredClaims: 0,
        successful: 0,
        todaysClaims: 0,
        todaysPaidClaims: 0,
        todaysCollectionAmount: 0,
        totalSales: 0,
        availableSales: 0,
        claimedSales: 0,
        totalKeys: 0,
        availableKeys: 0,
        assignedKeys: 0,
        usedKeys: 0,
      },
      { status: 500 },
    )
  }
}
