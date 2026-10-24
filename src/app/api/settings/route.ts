import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SENIOR_ADMIN")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    let rules = await db.alertRule.findMany();

    if (rules.length === 0) {
      // Seed default rule if missing
      const defaultRule = await db.alertRule.create({
        data: {
          type: "EXPIRING",
          thresholdsJson: JSON.stringify([90, 60, 30, 15, 7]),
          escalateAfterDays: 7,
          enabled: true,
        },
      });
      rules = [defaultRule];
    }

    return NextResponse.json({
      ok: true,
      data: {
        rules,
        system: {
          encryptionStandard: "AES-256-GCM (Enforced at Rest)",
          auditHmacAlgorithm: "HMAC-SHA256 (Chained with Genesis Zero)",
          sessionEngine: "Stateless Encrypted JWT (fdr_session)",
          storagePath: "/storage/fdr-documents (Private isolated store)",
          bankAdapterStatus: "CONNECTED (Simulated CBS Finacle / BaNCS)",
        },
      },
    });
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SENIOR_ADMIN")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { thresholds, escalateAfterDays, enabled } = body;

    const updated = await db.alertRule.upsert({
      where: { type: "EXPIRING" },
      update: {
        thresholdsJson: JSON.stringify(thresholds || [90, 60, 30, 15, 7]),
        escalateAfterDays: parseInt(escalateAfterDays || "7", 10),
        enabled: enabled !== undefined ? enabled : true,
      },
      create: {
        type: "EXPIRING",
        thresholdsJson: JSON.stringify(thresholds || [90, 60, 30, 15, 7]),
        escalateAfterDays: parseInt(escalateAfterDays || "7", 10),
        enabled: enabled !== undefined ? enabled : true,
      },
    });

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await logAudit({
      actorId: session.userId,
      actorName: session.name,
      actorRole: session.role,
      action: "SETTINGS_UPDATED",
      entityType: "SYSTEM_CONFIG",
      entityId: "ALERT_RULES",
      details: { thresholds, escalateAfterDays, enabled },
      ipAddress: ip,
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (error: any) {
    console.error("Settings POST error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
