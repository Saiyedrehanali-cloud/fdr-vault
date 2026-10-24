import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SENIOR_ADMIN")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const fdrId = params.id;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason;

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "A detailed justification is mandatory when flagging a discrepancy." },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const fdr = await db.fDR.findUnique({
      where: { id: fdrId },
      include: { institution: true },
    });

    if (!fdr) {
      return NextResponse.json({ ok: false, error: "FDR not found" }, { status: 404 });
    }

    // Update FDR status
    const updated = await db.fDR.update({
      where: { id: fdrId },
      data: {
        verificationStatus: "DISCREPANCY",
      },
    });

    // Create DiscrepancyFlag
    await db.discrepancyFlag.create({
      data: {
        fdrId,
        code: "MANUAL_SCRUTINY",
        severity: "HIGH",
        message: reason.trim(),
        evidence: `Flagged by Scrutiny Officer: ${session.name}`,
        resolved: false,
      },
    });

    // Add remark
    await db.remark.create({
      data: {
        fdrId,
        authorId: session.userId,
        text: `[DISCREPANCY FLAGGED] ${reason.trim()}`,
      },
    });

    // Create high-severity Alert for the institution
    await db.alert.create({
      data: {
        fdrId,
        institutionId: fdr.institutionId,
        type: "DISCREPANCY_UNRESOLVED",
        threshold: 0,
        severity: "CRITICAL",
        audience: "INSTITUTION",
        title: `Discrepancy Flagged: FDR ${fdr.refNo}`,
        message: `AICTE Scrutiny Committee has raised an objection: "${reason.trim()}". Please review and submit a rectified certificate immediately.`,
        isRead: false,
      },
    });

    // Hash-chained audit entry
    await logAudit({
      actorId: session.userId,
      actorName: session.name,
      actorRole: session.role,
      action: "DISCREPANCY_FLAGGED",
      entityType: "FDR",
      entityId: fdr.id,
      details: {
        refNo: fdr.refNo,
        institution: fdr.institution.name,
        reason: reason.trim(),
      },
      ipAddress: ip,
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (error: any) {
    console.error("Flag discrepancy API error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to flag discrepancy" },
      { status: 500 }
    );
  }
}
