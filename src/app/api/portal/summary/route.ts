import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { addDays, differenceInCalendarDays } from "date-fns";
import { computeLifecycle } from "@/lib/services/fdr";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHENTICATED", message: "Login required" } },
        { status: 401 }
      );
    }

    let institutionId = session.institutionId;

    // Fallback if accessed by admin for demo
    if (!institutionId) {
      const firstInst = await db.institution.findFirst();
      institutionId = firstInst?.id || null;
    }

    if (!institutionId) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Institution not found" } },
        { status: 404 }
      );
    }

    const institution = await db.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Institution not found" } },
        { status: 404 }
      );
    }

    const today = new Date();
    const ninetyDays = addDays(today, 90);

    const [totalFdrs, expiringSoon, actionNeeded, amountAgg, fdrs] = await Promise.all([
      db.fDR.count({ where: { institutionId } }),
      db.fDR.count({
        where: {
          institutionId,
          maturityDate: { lte: ninetyDays, gte: today },
          releasedAt: null,
          renewedAt: null,
        },
      }),
      db.fDR.count({
        where: {
          institutionId,
          verificationStatus: { in: ["PENDING", "DISCREPANCY"] },
          releasedAt: null,
        },
      }),
      db.fDR.aggregate({
        _sum: { amount: true },
        where: { institutionId, releasedAt: null },
      }),
      db.fDR.findMany({
        where: { institutionId },
        include: {
          bankChecks: { take: 1, orderBy: { checkedAt: "desc" } },
          flags: { where: { resolved: false } },
        },
        orderBy: { maturityDate: "asc" },
        take: 10,
      }),
    ]);

    const formattedFdrs = fdrs.map((item) => {
      const daysLeft = differenceInCalendarDays(new Date(item.maturityDate), today);
      const lifecycle = computeLifecycle(item, today);

      let source: "SUBMITTED" | "BANK_CONFIRMED" | "MISMATCH" = "SUBMITTED";
      if (item.bankChecks && item.bankChecks.length > 0) {
        if (item.bankChecks[0].status === "MISMATCH") source = "MISMATCH";
        else if (item.bankChecks[0].status === "MATCH") source = "BANK_CONFIRMED";
      }

      return {
        id: item.id,
        refNo: item.refNo,
        bankName: item.bankName,
        branch: item.branch,
        amount: item.amount,
        issueDate: item.issueDate.toISOString().split("T")[0],
        maturityDate: item.maturityDate.toISOString().split("T")[0],
        daysLeft,
        status: item.verificationStatus,
        lifecycle,
        source,
        purpose: item.purpose,
        hasDiscrepancy: item.verificationStatus === "DISCREPANCY",
        discrepancyReason: item.discrepancyReason,
      };
    });

    return NextResponse.json({
      ok: true,
      data: {
        institution,
        myTotalFdrs: totalFdrs,
        expiringSoon,
        actionNeeded,
        totalDeposited: amountAgg._sum.amount || 0,
        requiredDeposit: institution.requiredDeposit,
        recentFdrs: formattedFdrs,
      },
    });
  } catch (error) {
    console.error("Portal summary error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Failed to load institution summary" } },
      { status: 500 }
    );
  }
}
