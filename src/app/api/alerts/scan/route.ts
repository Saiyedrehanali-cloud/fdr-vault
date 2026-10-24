import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { differenceInCalendarDays } from "date-fns";
import { logAudit } from "@/lib/audit";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const today = new Date();
    const thresholds = [90, 60, 30, 15, 7];

    const activeFdrs = await db.fDR.findMany({
      where: {
        releasedAt: null,
      },
      include: {
        institution: true,
      },
    });

    let createdCount = 0;
    let escalatedCount = 0;

    for (const fdr of activeFdrs) {
      const days = differenceInCalendarDays(new Date(fdr.maturityDate), today);

      // Check if overdue
      if (days < 0) {
        try {
          await db.alert.create({
            data: {
              fdrId: fdr.id,
              institutionId: fdr.institutionId,
              type: "OVERDUE",
              threshold: 0,
              severity: "CRITICAL",
              audience: "SENIOR_ADMIN",
              title: `ESCALATION: FDR ${fdr.refNo} is ${Math.abs(days)} days overdue`,
              message: `${fdr.institution.name} security deposit has matured without renewal submission. Immediate regulatory action required.`,
            },
          });
          createdCount++;
          escalatedCount++;
        } catch (e) {
          // Already created (unique constraint)
        }
      } else {
        // Check standard thresholds
        for (const t of thresholds) {
          if (days <= t) {
            try {
              const severity = t <= 7 ? "CRITICAL" : t <= 30 ? "HIGH" : "WARNING";
              await db.alert.create({
                data: {
                  fdrId: fdr.id,
                  institutionId: fdr.institutionId,
                  type: "EXPIRING",
                  threshold: t,
                  severity,
                  audience: "ADMIN",
                  title: `Approaching Maturity: ${days} days remaining for ${fdr.refNo}`,
                  message: `${fdr.institution.name} deposit of ₹${(fdr.amount / 100000).toFixed(0)} Lakhs matures on ${fdr.maturityDate.toISOString().split("T")[0]}.`,
                },
              });
              createdCount++;
            } catch (e) {
              // Unique constraint (fdrId, type, threshold, audience) guarantees idempotency
            }
          }
        }
      }
    }

    if (session) {
      await logAudit({
        actorId: session.userId,
        action: "ALERT_SCAN_EXECUTED",
        entity: "ALERT",
        entityId: "SCAN",
        payload: { createdCount, escalatedCount, fdrScanned: activeFdrs.length },
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        scanned: activeFdrs.length,
        created: createdCount,
        escalated: escalatedCount,
      },
    });
  } catch (error) {
    console.error("Alert scan error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Failed to run alert scan" } },
      { status: 500 }
    );
  }
}
