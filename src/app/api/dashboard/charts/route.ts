import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { format, addMonths, startOfMonth, endOfMonth } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const today = new Date();

    // 1. Next 12 months maturity distribution
    const maturityByMonth = [];
    for (let m = 0; m < 12; m++) {
      const monthStart = startOfMonth(addMonths(today, m));
      const monthEnd = endOfMonth(addMonths(today, m));

      const count = await db.fDR.count({
        where: {
          maturityDate: {
            gte: monthStart,
            lte: monthEnd,
          },
          releasedAt: null,
          renewedAt: null,
        },
      });

      const amountAgg = await db.fDR.aggregate({
        _sum: { amount: true },
        where: {
          maturityDate: {
            gte: monthStart,
            lte: monthEnd,
          },
          releasedAt: null,
          renewedAt: null,
        },
      });

      maturityByMonth.push({
        month: format(monthStart, "MMM yy"),
        count,
        amount: amountAgg._sum.amount || 0,
        // Severity coloring
        fillColor: m <= 1 ? "#EB5A11" : m <= 3 ? "#FF9D2D" : "#00959C",
      });
    }

    // 2. Status Mix breakdown
    const verifiedActive = await db.fDR.count({
      where: {
        verificationStatus: "VERIFIED",
        releasedAt: null,
        renewedAt: null,
        maturityDate: { gte: today },
      },
    });

    const pendingReview = await db.fDR.count({
      where: {
        verificationStatus: { in: ["PENDING", "UNDER_REVIEW"] },
      },
    });

    const discrepancies = await db.fDR.count({
      where: {
        verificationStatus: "DISCREPANCY",
      },
    });

    const maturedOverdue = await db.fDR.count({
      where: {
        maturityDate: { lt: today },
        releasedAt: null,
        renewedAt: null,
      },
    });

    const releasedCount = await db.fDR.count({
      where: {
        releasedAt: { not: null },
      },
    });

    const renewedCount = await db.fDR.count({
      where: {
        renewedAt: { not: null },
      },
    });

    const statusMix = [
      { name: "Active Verified", value: verifiedActive, color: "#00959C" },
      { name: "Pending Scrutiny", value: pendingReview, color: "#FF9D2D" },
      { name: "Discrepancy Flagged", value: discrepancies, color: "#EB5A11" },
      { name: "Matured / Overdue", value: maturedOverdue, color: "#F87C2B" },
      { name: "Released / Refunded", value: releasedCount, color: "#006675" },
      { name: "Renewed", value: renewedCount, color: "#4DC2C2" },
    ];

    return NextResponse.json({
      ok: true,
      data: {
        maturityByMonth,
        statusMix,
      },
    });
  } catch (error) {
    console.error("Dashboard charts error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Failed to generate chart metrics" } },
      { status: 500 }
    );
  }
}
