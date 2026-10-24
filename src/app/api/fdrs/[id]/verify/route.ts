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
    const remarkText = body.remarks || "Instrument verified following regulatory scrutiny and core bank confirmation.";
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
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        verifiedById: session.userId,
      },
    });

    // If this FDR is a renewal of an earlier FDR, transition the old FDR to RENEWED
    if (fdr.renewalOfId) {
      await db.fDR.update({
        where: { id: fdr.renewalOfId },
        data: {
          renewedAt: new Date(),
        },
      });
    }

    // Add remark
    await db.remark.create({
      data: {
        fdrId,
        authorId: session.userId,
        text: `[OFFICIAL VERIFICATION] ${remarkText}`,
      },
    });

    // Create Alert for the institution
    await db.alert.create({
      data: {
        fdrId,
        institutionId: fdr.institutionId,
        type: "RELEASE_UPDATE",
        threshold: 0,
        severity: "INFO",
        audience: "INSTITUTION",
        title: `FDR ${fdr.refNo} Verified by AICTE`,
        message: `Your deposit instrument of ₹${(fdr.amount / 100000).toFixed(2)} Lakhs has been verified by the AICTE Scrutiny Committee.`,
        isRead: false,
      },
    });

    // Hash-chained audit entry
    await logAudit({
      actorId: session.userId,
      actorName: session.name,
      actorRole: session.role,
      action: "FDR_VERIFIED",
      entityType: "FDR",
      entityId: fdr.id,
      details: {
        refNo: fdr.refNo,
        institution: fdr.institution.name,
        amount: fdr.amount,
        remark: remarkText,
      },
      ipAddress: ip,
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (error: any) {
    console.error("Mark verified API error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to mark FDR as verified" },
      { status: 500 }
    );
  }
}
