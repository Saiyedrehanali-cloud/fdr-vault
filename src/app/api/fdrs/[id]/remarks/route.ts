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
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const fdrId = params.id;
    const body = await req.json().catch(() => ({}));
    const text = body.text;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "Remark text cannot be empty." },
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

    const remark = await db.remark.create({
      data: {
        fdrId,
        authorId: session.userId,
        text: text.trim(),
      },
      include: {
        author: {
          select: { name: true, role: true },
        },
      },
    });

    await logAudit({
      actorId: session.userId,
      actorName: session.name,
      actorRole: session.role,
      action: "REMARK_ADDED",
      entityType: "FDR",
      entityId: fdr.id,
      details: {
        refNo: fdr.refNo,
        remark: text.trim().substring(0, 100),
      },
      ipAddress: ip,
    });

    return NextResponse.json({ ok: true, data: remark });
  } catch (error: any) {
    console.error("Add remark API error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to add remark" },
      { status: 500 }
    );
  }
}
