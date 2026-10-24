import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { fdrId, reason, remarks } = body;

    if (!fdrId || !reason) {
      return NextResponse.json(
        { ok: false, error: "FDR ID and reason are required." },
        { status: 400 }
      );
    }

    const fdr = await db.fDR.findUnique({
      where: { id: fdrId },
      include: { institution: true, releaseRequests: true },
    });

    if (!fdr) {
      return NextResponse.json({ ok: false, error: "FDR not found" }, { status: 404 });
    }

    // Authorization check
    if (session.role === "INSTITUTION" && session.institutionId !== fdr.institutionId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Check if eligible
    if (fdr.verificationStatus !== "VERIFIED") {
      return NextResponse.json(
        { ok: false, error: "Only verified FDRs can be submitted for release/refund." },
        { status: 400 }
      );
    }

    if (fdr.releasedAt) {
      return NextResponse.json(
        { ok: false, error: "This deposit has already been released." },
        { status: 400 }
      );
    }

    // Check if open release request exists
    const existingOpen = fdr.releaseRequests.find(
      (r) => r.status === "REQUESTED" || r.status === "UNDER_SCRUTINY" || r.status === "APPROVED"
    );
    if (existingOpen) {
      return NextResponse.json(
        { ok: false, error: "A release application is already active for this instrument." },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    // Create ReleaseRequest
    const releaseReq = await db.releaseRequest.create({
      data: {
        fdrId,
        requestedById: session.userId,
        reason,
        remarks: remarks || "",
        status: "REQUESTED",
      },
    });

    // Update FDR releaseRequested flag
    await db.fDR.update({
      where: { id: fdrId },
      data: { releaseRequested: true },
    });

    // Create Alert for AICTE Admin
    await db.alert.create({
      data: {
        fdrId,
        institutionId: fdr.institutionId,
        type: "RELEASE_UPDATE",
        threshold: 0,
        severity: "INFO",
        audience: "ADMIN",
        title: `Release Request Submitted: FDR ${fdr.refNo}`,
        message: `${fdr.institution.name} has submitted a release application for deposit ₹${(fdr.amount / 100000).toFixed(2)} Lakhs. Reason: ${reason}.`,
        isRead: false,
      },
    });

    // Record Hash-chained Audit Log
    await logAudit({
      actorId: session.userId,
      actorName: session.name,
      actorRole: session.role,
      action: "RELEASE_REQUESTED",
      entityType: "FDR",
      entityId: fdr.id,
      details: {
        refNo: fdr.refNo,
        institution: fdr.institution.name,
        amount: fdr.amount,
        reason,
      },
      ipAddress: ip,
    });

    return NextResponse.json({ ok: true, data: releaseReq });
  } catch (error: any) {
    console.error("Release request error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to create release request" },
      { status: 500 }
    );
  }
}
