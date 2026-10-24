import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SENIOR_ADMIN")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const releaseId = params.id;
    const body = await req.json().catch(() => ({}));
    const { action, remarks } = body;

    const releaseReq = await db.releaseRequest.findUnique({
      where: { id: releaseId },
      include: {
        fdr: {
          include: { institution: true },
        },
      },
    });

    if (!releaseReq) {
      return NextResponse.json({ ok: false, error: "Release request not found" }, { status: 404 });
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const now = new Date();

    if (action === "START_SCRUTINY") {
      const updated = await db.releaseRequest.update({
        where: { id: releaseId },
        data: {
          status: "UNDER_SCRUTINY",
          decisionById: session.userId,
        },
      });

      await logAudit({
        actorId: session.userId,
        actorName: session.name,
        actorRole: session.role,
        action: "RELEASE_SCRUTINY_STARTED",
        entityType: "RELEASE_REQUEST",
        entityId: releaseId,
        details: { fdrRef: releaseReq.fdr.refNo, institution: releaseReq.fdr.institution.name },
        ipAddress: ip,
      });

      return NextResponse.json({ ok: true, data: updated });
    }

    if (action === "APPROVE") {
      const updated = await db.releaseRequest.update({
        where: { id: releaseId },
        data: {
          status: "APPROVED",
          decisionById: session.userId,
          decisionRemarks: remarks || "Statutory clearance completed. Approved for release.",
          decidedAt: now,
        },
      });

      await db.alert.create({
        data: {
          fdrId: releaseReq.fdrId,
          institutionId: releaseReq.fdr.institutionId,
          type: "RELEASE_UPDATE",
          threshold: 0,
          severity: "INFO",
          audience: "INSTITUTION",
          title: `Release Approved: FDR ${releaseReq.fdr.refNo}`,
          message: `Your release application has been APPROVED by the AICTE Competent Authority. Final remittance / refund voucher is being scheduled.`,
          isRead: false,
        },
      });

      await logAudit({
        actorId: session.userId,
        actorName: session.name,
        actorRole: session.role,
        action: "RELEASE_APPROVED",
        entityType: "RELEASE_REQUEST",
        entityId: releaseId,
        details: {
          fdrRef: releaseReq.fdr.refNo,
          amount: releaseReq.fdr.amount,
          remarks: remarks || "Approved",
        },
        ipAddress: ip,
      });

      return NextResponse.json({ ok: true, data: updated });
    }

    if (action === "REJECT") {
      if (!remarks || !remarks.trim()) {
        return NextResponse.json(
          { ok: false, error: "A detailed official justification is mandatory for rejecting a release request." },
          { status: 400 }
        );
      }

      const updated = await db.releaseRequest.update({
        where: { id: releaseId },
        data: {
          status: "REJECTED",
          decisionById: session.userId,
          decisionRemarks: remarks.trim(),
          decidedAt: now,
        },
      });

      // Clear releaseRequested flag on FDR
      await db.fDR.update({
        where: { id: releaseReq.fdrId },
        data: { releaseRequested: false },
      });

      await db.alert.create({
        data: {
          fdrId: releaseReq.fdrId,
          institutionId: releaseReq.fdr.institutionId,
          type: "RELEASE_UPDATE",
          threshold: 0,
          severity: "HIGH",
          audience: "INSTITUTION",
          title: `Release Request Rejected: FDR ${releaseReq.fdr.refNo}`,
          message: `Reason: ${remarks.trim()}. Please address deficiencies and contact regional office.`,
          isRead: false,
        },
      });

      await logAudit({
        actorId: session.userId,
        actorName: session.name,
        actorRole: session.role,
        action: "RELEASE_REJECTED",
        entityType: "RELEASE_REQUEST",
        entityId: releaseId,
        details: {
          fdrRef: releaseReq.fdr.refNo,
          reason: remarks.trim(),
        },
        ipAddress: ip,
      });

      return NextResponse.json({ ok: true, data: updated });
    }

    if (action === "MARK_RELEASED") {
      const releaseRef = `AICTE/REL/2026/${Math.floor(1000 + Math.random() * 9000)}`;

      const updated = await db.releaseRequest.update({
        where: { id: releaseId },
        data: {
          status: "RELEASED",
          releaseRef,
          releasedAt: now,
          decisionById: session.userId,
          decisionRemarks: remarks || "Deposit released and settlement voucher registered.",
        },
      });

      // Update FDR lifecycle state to RELEASED
      await db.fDR.update({
        where: { id: releaseReq.fdrId },
        data: {
          releasedAt: now,
          releaseRequested: false,
        },
      });

      await db.alert.create({
        data: {
          fdrId: releaseReq.fdrId,
          institutionId: releaseReq.fdr.institutionId,
          type: "RELEASE_UPDATE",
          threshold: 0,
          severity: "INFO",
          audience: "INSTITUTION",
          title: `Deposit Released: Ref ${releaseRef}`,
          message: `Fixed Deposit ${releaseReq.fdr.refNo} (₹${(releaseReq.fdr.amount / 100000).toFixed(2)} Lakhs) has been officially released. AICTE endorsement has been discharged.`,
          isRead: false,
        },
      });

      await logAudit({
        actorId: session.userId,
        actorName: session.name,
        actorRole: session.role,
        action: "FDR_RELEASED",
        entityType: "FDR",
        entityId: releaseReq.fdrId,
        details: {
          refNo: releaseReq.fdr.refNo,
          releaseRef,
          amount: releaseReq.fdr.amount,
        },
        ipAddress: ip,
      });

      return NextResponse.json({ ok: true, data: updated });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Update release request error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to update release request" },
      { status: 500 }
    );
  }
}
