import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // EXPIRING | OVERDUE | PENDING_STALE | DISCREPANCY_UNRESOLVED | ESCALATION | ALL
    const severity = searchParams.get("severity"); // CRITICAL | HIGH | WARNING | INFO
    const isRead = searchParams.get("isRead");

    const where: any = {};

    // Role filtering: Institution sees only their own alerts
    if (session.role === "INSTITUTION") {
      if (!session.institutionId) {
        return NextResponse.json({ ok: true, data: { items: [], unreadCount: 0 } });
      }
      where.institutionId = session.institutionId;
      where.audience = { in: ["INSTITUTION", "ALL"] };
    } else if (session.role === "ADMIN") {
      where.audience = { in: ["ADMIN", "ALL"] };
    } else if (session.role === "SENIOR_ADMIN") {
      where.audience = { in: ["ADMIN", "SENIOR_ADMIN", "ALL"] };
    }

    if (type && type !== "ALL") {
      if (type === "ESCALATION") {
        where.audience = "SENIOR_ADMIN";
      } else {
        where.type = type;
      }
    }

    if (severity && severity !== "ALL") {
      where.severity = severity;
    }

    if (isRead !== null && isRead !== undefined && isRead !== "") {
      where.isRead = isRead === "true";
    }

    const items = await db.alert.findMany({
      where,
      include: {
        fdr: {
          select: {
            id: true,
            refNo: true,
            amount: true,
            bankName: true,
            maturityDate: true,
            verificationStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const unreadCount = await db.alert.count({
      where: {
        ...where,
        isRead: false,
      },
    });

    return NextResponse.json({ ok: true, data: { items, unreadCount } });
  } catch (error: any) {
    console.error("Alerts GET error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // Bulk mark as read
    if (body.action === "MARK_ALL_READ") {
      const where: any = { isRead: false };
      if (session.role === "INSTITUTION") {
        where.institutionId = session.institutionId;
      } else if (session.role === "ADMIN") {
        where.audience = { in: ["ADMIN", "ALL"] };
      } else if (session.role === "SENIOR_ADMIN") {
        where.audience = { in: ["ADMIN", "SENIOR_ADMIN", "ALL"] };
      }

      await db.alert.updateMany({
        where,
        data: { isRead: true },
      });

      return NextResponse.json({ ok: true, message: "All alerts marked as read." });
    }

    // Single mark as read
    if (body.alertId) {
      await db.alert.update({
        where: { id: body.alertId },
        data: { isRead: true },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Alerts POST error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to update alerts" },
      { status: 500 }
    );
  }
}
