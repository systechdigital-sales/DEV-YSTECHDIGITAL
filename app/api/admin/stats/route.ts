import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    // Get counts from all collections in parallel
    const [claimsStats, salesStats, keysStats] = await Promise.all([
      // Claims stats
      db
        .collection("claims")
        .aggregate([
          {
            $group: {
              _id: null,
              totalClaims: { $sum: 1 },
              paidClaims: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0],
                },
              },
              pendingClaims: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0],
                },
              },
              failedClaims: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", "failed"] }, 1, 0],
                },
              },
            },
          },
        ])
        .toArray(),

      // Sales stats
      db
        .collection("salesrecords")
        .aggregate([
          {
            $group: {
              _id: null,
              totalSales: { $sum: 1 },
              claimedSales: {
                $sum: {
                  $cond: [{ $eq: ["$status", "claimed"] }, 1, 0],
                },
              },
            },
          },
        ])
        .toArray(),

      // Keys stats
      db
        .collection("ottkeys")
        .aggregate([
          {
            $group: {
              _id: null,
              totalKeys: { $sum: 1 },
              availableKeys: {
                $sum: {
                  $cond: [{ $eq: ["$status", "available"] }, 1, 0],
                },
              },
              assignedKeys: {
                $sum: {
                  $cond: [{ $eq: ["$status", "assigned"] }, 1, 0],
                },
              },
              usedKeys: {
                $sum: {
                  $cond: [{ $eq: ["$status", "used"] }, 1, 0],
                },
              },
            },
          },
        ])
        .toArray(),
    ])

    const stats = {
      totalClaims: claimsStats[0]?.totalClaims || 0,
      paidClaims: claimsStats[0]?.paidClaims || 0,
      pendingClaims: claimsStats[0]?.pendingClaims || 0,
      failedClaims: claimsStats[0]?.failedClaims || 0,
      totalSales: salesStats[0]?.totalSales || 0,
      claimedSales: salesStats[0]?.claimedSales || 0,
      availableKeys: keysStats[0]?.availableKeys || 0,
      assignedKeys: keysStats[0]?.assignedKeys || 0,
      usedKeys: keysStats[0]?.usedKeys || 0,
      totalKeys: keysStats[0]?.totalKeys || 0,
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error("❌ Error fetching stats:", error)
    return NextResponse.json(
      {
        totalClaims: 0,
        paidClaims: 0,
        pendingClaims: 0,
        failedClaims: 0,
        totalSales: 0,
        claimedSales: 0,
        availableKeys: 0,
        assignedKeys: 0,
        usedKeys: 0,
        totalKeys: 0,
      },
      { status: 200 },
    )
  }
}
