import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
      },
      orderBy: { requestedAt: "desc" },
    });

    const userIds = Array.from(
      new Set(
        items.flatMap((i) => [i.requestedById, i.decisionById].filter(Boolean) as string[])
      )
    );
    const users = userIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true, role: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const enrichedItems = items.map((i) => ({
      ...i,
      requestedBy: userMap.get(i.requestedById) || null,
      decisionBy: i.decisionById ? userMap.get(i.decisionById) || null : null,
    }));

    const stats = {
      total: enrichedItems.length,
      requested: enrichedItems.filter((i) => i.status === "REQUESTED").length,
      underScrutiny: enrichedItems.filter((i) => i.status === "UNDER_SCRUTINY").length,
      approved: enrichedItems.filter((i) => i.status === "APPROVED").length,
      released: enrichedItems.filter((i) => i.status === "RELEASED").length,
      rejected: enrichedItems.filter((i) => i.status === "REJECTED").length,
    };

    return NextResponse.json({ ok: true, data: { items: enrichedItems, stats } });
  } catch (error: any) {
    console.error("List releases error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to load release requests" },
      { status: 500 }
    );
  }
}
