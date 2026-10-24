import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SENIOR_ADMIN")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";

    const where: any = {};
    if (status !== "ALL") {
      where.status = status;
    }

    const items = await db.releaseRequest.findMany({
      where,
      include: {
        fdr: {
          include: {
            institution: {
              select: {
                id: true,
                name: true,
                aicteId: true,
                city: true,
                state: true,
              },
            },
            flags: {
              where: { resolved: false },
              select: { id: true, severity: true, code: true, message: true },
            },
            documents: {
              take: 1,
              select: { id: true, fileName: true },
            },
          },
        },
        requestedBy: {
          select: { name: true, email: true },
        },
        decisionBy: {
          select: { name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: items.length,
      requested: items.filter((i) => i.status === "REQUESTED").length,
      underScrutiny: items.filter((i) => i.status === "UNDER_SCRUTINY").length,
      approved: items.filter((i) => i.status === "APPROVED").length,
      released: items.filter((i) => i.status === "RELEASED").length,
      rejected: items.filter((i) => i.status === "REJECTED").length,
    };

    return NextResponse.json({ ok: true, data: { items, stats } });
  } catch (error: any) {
    console.error("List releases error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to load release requests" },
      { status: 500 }
    );
  }
}
