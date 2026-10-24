import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { differenceInDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SENIOR_ADMIN")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "ALL"; // ALL | PENDING | UNDER_REVIEW | DISCREPANCY

    const statusFilter =
      filter === "PENDING"
        ? ["PENDING"]
        : filter === "UNDER_REVIEW"
        ? ["UNDER_REVIEW"]
        : filter === "DISCREPANCY"
        ? ["DISCREPANCY"]
        : ["PENDING", "UNDER_REVIEW", "DISCREPANCY"];

    const fdrs = await db.fDR.findMany({
      where: {
        verificationStatus: { in: statusFilter },
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            aicteId: true,
            city: true,
            state: true,
            requiredDeposit: true,
          },
        },
        flags: {
          where: { resolved: false },
          select: { id: true, code: true, severity: true, message: true },
        },
        bankChecks: {
          take: 1,
          orderBy: { checkedAt: "desc" },
          select: { status: true, checkedAt: true },
        },
      },
      orderBy: {
        submittedAt: "asc", // FIFO queue
      },
    });

    const today = new Date();

    const items = fdrs.map((fdr) => {
      const queueDays = differenceInDays(today, new Date(fdr.submittedAt));
      let slaTier: "GREEN" | "YELLOW" | "RED" = "GREEN";
      if (queueDays > 5) slaTier = "RED";
      else if (queueDays >= 2) slaTier = "YELLOW";

      return {
        id: fdr.id,
        refNo: fdr.refNo,
        amount: fdr.amount,
        bankName: fdr.bankName,
        branch: fdr.branch,
        issueDate: fdr.issueDate.toISOString().split("T")[0],
        maturityDate: fdr.maturityDate.toISOString().split("T")[0],
        submittedAt: fdr.submittedAt.toISOString(),
        verificationStatus: fdr.verificationStatus,
        source: fdr.source,
        institution: fdr.institution,
        unresolvedFlagsCount: fdr.flags.length,
        flags: fdr.flags,
        latestBankCheck: fdr.bankChecks[0] || null,
        queueDays,
        slaTier,
      };
    });

    // Summary statistics for KPI header
    const stats = {
      totalInQueue: items.length,
      pending: items.filter((i) => i.verificationStatus === "PENDING").length,
      underReview: items.filter((i) => i.verificationStatus === "UNDER_REVIEW").length,
      discrepancy: items.filter((i) => i.verificationStatus === "DISCREPANCY").length,
      withinSla: items.filter((i) => i.slaTier === "GREEN").length,
      atRisk: items.filter((i) => i.slaTier === "YELLOW").length,
      breached: items.filter((i) => i.slaTier === "RED").length,
    };

    return NextResponse.json({ ok: true, data: { items, stats } });
  } catch (error: any) {
    console.error("Verification queue API error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to load queue" },
      { status: 500 }
    );
  }
}
