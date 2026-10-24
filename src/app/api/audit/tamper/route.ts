import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeRecordHash } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SENIOR_ADMIN")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "TAMPER"; // TAMPER | RESTORE

    const logs = await db.auditLog.findMany({
      orderBy: { id: "asc" },
    });

    if (logs.length < 3) {
      return NextResponse.json(
        { ok: false, error: "Insufficient audit logs to simulate tampering." },
        { status: 400 }
      );
    }

    // Target record #3 for demonstration
    const target = logs[2];

    if (action === "TAMPER") {
      // Intentionally alter payload to simulate an unauthorized database update without updating HMAC
      const tamperedPayload = JSON.stringify({
        refNo: "TAMPERED_BY_SQL_INJECTION",
        status: "UNAUTHORIZED_MANUAL_OVERRIDE",
        tamperedBy: "Direct SQLite /dev.db Injection",
        originalAmount: 1500000,
        tamperedAmount: 9999999,
      });

      await db.auditLog.update({
        where: { id: target.id },
        data: {
          payload: tamperedPayload,
        },
      });

      return NextResponse.json({
        ok: true,
        message: `Simulated unauthorized DB row modification on Record #${target.id}. HMAC seal is now mismatched. Run 'Verify Chain Integrity' to demonstrate real-time detection to judges.`,
        tamperedRecordId: target.id,
      });
    }

    if (action === "RESTORE") {
      // Re-sign all hashes starting from genesis
      const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";
      let prev = GENESIS_HASH;

      for (const log of logs) {
        // If it was the tampered payload, restore realistic payload
        const cleanPayload =
          log.id === target.id
            ? JSON.stringify({
                refNo: "FDR-PNB-2026-1002",
                status: "VERIFIED",
                amount: 1500000,
                restoredBy: "AICTE Cryptographic Enforcement Protocol",
              })
            : log.payload;

        const newHash = computeRecordHash(
          prev,
          log.actorId,
          log.action,
          log.entity,
          log.entityId,
          cleanPayload,
          log.createdAt.toISOString()
        );

        await db.auditLog.update({
          where: { id: log.id },
          data: {
            payload: cleanPayload,
            prevHash: prev,
            hash: newHash,
          },
        });

        prev = newHash;
      }

      return NextResponse.json({
        ok: true,
        message: "Cryptographic hash chain repaired and re-signed from genesis.",
      });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Tamper demo API error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to process tamper demo" },
      { status: 500 }
    );
  }
}
