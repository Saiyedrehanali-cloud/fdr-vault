import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addDays, differenceInCalendarDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const ninetyDaysLater = addDays(today, 90);
    const thirtyDaysLater = addDays(today, 30);

    // 1. Total FDRs
    const totalFdrs = await db.fDR.count();

    // 2. Institutions count
    const institutionCount = await db.institution.count();

    // 3. Expiring Soon (<= 90 days, not released/renewed)
    const expiringSoon = await db.fDR.count({
      where: {
        maturityDate: {
          lte: ninetyDaysLater,
          gte: today,
        },
        releasedAt: null,
        renewedAt: null,
      },
    });

    // Expiring within 30 days
    const expiring30 = await db.fDR.count({
      where: {
        maturityDate: {
          lte: thirtyDaysLater,
          gte: today,
        },
        releasedAt: null,
        renewedAt: null,
      },
    });

    // 4. Pending Verification
    const pendingVerification = await db.fDR.count({
      where: {
        verificationStatus: {
          in: ["PENDING", "UNDER_REVIEW"],
        },
      },
    });

    // Oldest pending FDR
    const oldestPending = await db.fDR.findFirst({
      where: {
        verificationStatus: "PENDING",
      },
      orderBy: {
        submittedAt: "asc",
      },
      select: {
        submittedAt: true,
      },
    });

    const oldestPendingDays = oldestPending
      ? differenceInCalendarDays(today, oldestPending.submittedAt)
      : 0;

    // 5. Total Amount (Aggregate sum of amount)
    const amountAggregate = await db.fDR.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        releasedAt: null,
      },
    });

    const totalAmount = amountAggregate._sum.amount || 0;

    // 6. Active Alerts Count
    const unreadAlertsCount = await db.alert.count({
      where: { isRead: false },
    });

    return NextResponse.json({
      ok: true,
      data: {
        totalFdrs,
        expiringSoon,
        expiring30,
        pendingVerification,
        oldestPendingDays,
        totalAmount,
        institutionCount,
        unreadAlertsCount,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Failed to compute dashboard metrics" } },
      { status: 500 }
    );
  }
}
