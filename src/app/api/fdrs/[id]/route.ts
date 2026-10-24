import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeLifecycle, computeDaysToMaturity } from "@/lib/services/fdr";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHENTICATED", message: "Login required" } },
        { status: 401 }
      );
    }

    const fdrId = params.id;

    const fdr = await db.fDR.findUnique({
      where: { id: fdrId },
      include: {
        institution: true,
        documents: {
          orderBy: { version: "desc" },
        },
        bankChecks: {
          orderBy: { checkedAt: "desc" },
        },
        flags: {
          orderBy: { createdAt: "desc" },
        },
        remarks: {
          include: {
            author: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        releaseRequests: {
          orderBy: { requestedAt: "desc" },
        },
        renewalOf: {
          select: {
            id: true,
            refNo: true,
            amount: true,
            maturityDate: true,
            verificationStatus: true,
          },
        },
        renewedBy: {
          select: {
            id: true,
            refNo: true,
            amount: true,
            maturityDate: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!fdr) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "FDR record not found" } },
        { status: 404 }
      );
    }

    // Enforce Tenant Access: Institution can only view own FDR
    if (session.role === "INSTITUTION") {
      if (session.institutionId && fdr.institutionId !== session.institutionId) {
        return NextResponse.json(
          { ok: false, error: { code: "FORBIDDEN", message: "Unauthorized access to another institution's record" } },
          { status: 403 }
        );
      }
    }

    // Fetch related audit logs for this entity
    const auditLogs = await db.auditLog.findMany({
      where: {
        entity: "FDR",
        entityId: fdr.id,
      },
      include: {
        actor: { select: { name: true, role: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const today = new Date();
    const daysToMaturity = computeDaysToMaturity(fdr.maturityDate, today);
    const lifecycleStatus = computeLifecycle(fdr, today);

    // Parse confirmed fields if available
    let bankConfirmedData = null;
    let bankDiffs = null;
    let source: "SUBMITTED" | "BANK_CONFIRMED" | "MISMATCH" = "SUBMITTED";

    if (fdr.bankChecks && fdr.bankChecks.length > 0) {
      const latestCheck = fdr.bankChecks[0];
      if (latestCheck.status === "MATCH") source = "BANK_CONFIRMED";
      if (latestCheck.status === "MISMATCH") source = "MISMATCH";

      if (latestCheck.confirmedJson) {
        try {
          bankConfirmedData = JSON.parse(latestCheck.confirmedJson);
        } catch (e) {}
      }

      if (latestCheck.diffsJson) {
        try {
          bankDiffs = JSON.parse(latestCheck.diffsJson);
        } catch (e) {}
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        fdr: {
          id: fdr.id,
          refNo: fdr.refNo,
          bankName: fdr.bankName,
          branch: fdr.branch,
          amount: fdr.amount,
          issueDate: fdr.issueDate.toISOString().split("T")[0],
          maturityDate: fdr.maturityDate.toISOString().split("T")[0],
          purpose: fdr.purpose,
          academicYear: fdr.academicYear,
          verificationStatus: fdr.verificationStatus,
          lifecycleStatus,
          daysToMaturity,
          discrepancyReason: fdr.discrepancyReason,
          verifiedAt: fdr.verifiedAt ? fdr.verifiedAt.toISOString() : null,
          releaseRequested: fdr.releaseRequested,
          releasedAt: fdr.releasedAt ? fdr.releasedAt.toISOString() : null,
          renewedAt: fdr.renewedAt ? fdr.renewedAt.toISOString() : null,
          submittedAt: fdr.submittedAt.toISOString(),
          source,
        },
        institution: fdr.institution,
        documents: fdr.documents.map((d) => ({
          id: d.id,
          kind: d.kind,
          fileName: d.fileName,
          mimeType: d.mimeType,
          sizeBytes: d.sizeBytes,
          fileHash: d.fileHash,
          version: d.version,
          uploadedAt: d.uploadedAt.toISOString(),
        })),
        bankChecks: fdr.bankChecks,
        bankConfirmedData,
        bankDiffs,
        flags: fdr.flags,
        remarks: fdr.remarks,
        renewalOf: fdr.renewalOf,
        renewedBy: fdr.renewedBy,
        releaseRequests: fdr.releaseRequests,
        auditLogs: auditLogs.map((a) => ({
          id: a.id,
          action: a.action,
          actorName: a.actor?.name || "System Automated Engine",
          actorRole: a.actor?.role || "SYSTEM",
          createdAt: a.createdAt.toISOString(),
          prevHash: a.prevHash,
          hash: a.hash,
          payload: a.payload ? JSON.parse(a.payload) : null,
        })),
      },
    });
  } catch (error) {
    console.error("FDR detail error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Failed to load FDR record" } },
      { status: 500 }
    );
  }
}
