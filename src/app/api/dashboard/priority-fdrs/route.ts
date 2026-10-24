import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { differenceInCalendarDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const today = new Date();

    // Query 10 highest priority FDRs: Discrepancies first, then Pending, then closest to maturity
    const fdrs = await db.fDR.findMany({
      where: {
        releasedAt: null,
      },
      include: {
        institution: {
          select: {
            name: true,
            aicteId: true,
          },
        },
        bankChecks: {
          take: 1,
          orderBy: { checkedAt: "desc" },
          select: { status: true },
        },
      },
      orderBy: [
        { maturityDate: "asc" },
      ],
      take: 10,
    });

    const priorityItems = fdrs.map((item) => {
      const daysLeft = differenceInCalendarDays(new Date(item.maturityDate), today);

      // Determine source badge state
      let source: "SUBMITTED" | "BANK_CONFIRMED" | "MISMATCH" = "SUBMITTED";
      if (item.bankChecks && item.bankChecks.length > 0) {
        if (item.bankChecks[0].status === "MISMATCH") {
          source = "MISMATCH";
        } else if (item.bankChecks[0].status === "MATCH") {
          source = "BANK_CONFIRMED";
        }
      }

      return {
        id: item.id,
        refNo: item.refNo,
        institution: item.institution.name,
        aicteId: item.institution.aicteId,
        bank: item.bankName,
        branch: item.branch,
        amount: item.amount,
        issueDate: item.issueDate.toISOString().split("T")[0],
        maturityDate: item.maturityDate.toISOString().split("T")[0],
        daysLeft,
        status: item.verificationStatus,
        source,
        purpose: item.purpose,
      };
    });

    return NextResponse.json({
      ok: true,
      data: priorityItems,
    });
  } catch (error) {
    console.error("Priority FDRs error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Failed to fetch priority FDRs" } },
      { status: 500 }
    );
  }
}
