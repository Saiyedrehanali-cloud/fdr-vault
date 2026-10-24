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
    const action = searchParams.get("action");
    const entity = searchParams.get("entity");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);

    const where: any = {};
    if (action && action !== "ALL") where.action = action;
    if (entity && entity !== "ALL") where.entity = entity;

    const [items, totalCount] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          actor: {
            select: { id: true, name: true, role: true, email: true },
          },
        },
        orderBy: { id: "desc" },
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        items,
        totalCount,
      },
    });
  } catch (error: any) {
    console.error("Audit GET error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to load audit logs" },
      { status: 500 }
    );
  }
}
