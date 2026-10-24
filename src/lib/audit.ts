import crypto from "crypto";
import { db } from "./db";

const AUDIT_SECRET =
  process.env.AUDIT_KEY || "fdr-vault-tamper-evident-audit-hmac-key-2026";
const GENESIS_HASH =
  "0000000000000000000000000000000000000000000000000000000000000000";

export interface LogAuditParams {
  actorId?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  action: string;
  entity?: string;
  entityType?: string;
  entityId: string;
  payload?: any;
  details?: any;
  ipAddress?: string;
}

/**
 * Compute HMAC-SHA256 hash for an audit record
 */
export function computeRecordHash(
  prevHash: string,
  actorId: string | null | undefined,
  action: string,
  entity: string,
  entityId: string,
  payloadStr: string | null,
  timestampStr: string
): string {
  const content = [
    prevHash,
    actorId || "SYSTEM",
    action,
    entity,
    entityId,
    payloadStr || "",
    timestampStr,
  ].join("|");

  return crypto.createHmac("sha256", AUDIT_SECRET).update(content).digest("hex");
}

/**
 * Append a hash-chained audit entry
 */
export async function logAudit(params: LogAuditParams) {
  try {
    const actorId = params.actorId || null;
    const action = params.action;
    const entity = params.entity || params.entityType || "SYSTEM";
    const entityId = params.entityId;
    const payloadData = params.payload !== undefined ? params.payload : params.details;
    const payloadStr = payloadData ? JSON.stringify(payloadData) : null;
    const now = new Date();
    const timestampStr = now.toISOString();

    // Query latest audit log entry to get previous hash
    const lastLog = await db.auditLog.findFirst({
      orderBy: { id: "desc" },
    });

    const prevHash = lastLog?.hash || GENESIS_HASH;
    const hash = computeRecordHash(
      prevHash,
      actorId,
      action,
      entity,
      entityId,
      payloadStr,
      timestampStr
    );

    return await db.auditLog.create({
      data: {
        actorId: actorId || null,
        action,
        entity,
        entityId,
        payload: payloadStr,
        prevHash,
        hash,
        createdAt: now,
      },
    });
  } catch (error) {
    console.error("Failed to write hash-chained audit log:", error);
    return null;
  }
}

/**
 * Verify integrity of the entire audit hash chain
 * Returns { ok: true, count } or { ok: false, brokenAt, expected, actual }
 */
export async function verifyAuditChain(): Promise<{
  ok: boolean;
  totalChecked: number;
  brokenAtIndex?: number;
  brokenRecordId?: number;
  expectedHash?: string;
  actualHash?: string;
  error?: string;
}> {
  const logs = await db.auditLog.findMany({
    orderBy: { id: "asc" },
  });

  if (logs.length === 0) {
    return { ok: true, totalChecked: 0 };
  }

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];

    // Check link to previous hash
    if (log.prevHash !== expectedPrevHash) {
      return {
        ok: false,
        totalChecked: i,
        brokenAtIndex: i + 1,
        brokenRecordId: log.id,
        expectedHash: expectedPrevHash,
        actualHash: log.prevHash,
        error: `Broken hash link at record #${log.id}: prevHash does not match previous node hash.`,
      };
    }

    // Check recomputed HMAC hash
    const recomputedHash = computeRecordHash(
      log.prevHash,
      log.actorId,
      log.action,
      log.entity,
      log.entityId,
      log.payload,
      log.createdAt.toISOString()
    );

    if (recomputedHash !== log.hash) {
      return {
        ok: false,
        totalChecked: i,
        brokenAtIndex: i + 1,
        brokenRecordId: log.id,
        expectedHash: recomputedHash,
        actualHash: log.hash,
        error: `Content tampering detected at record #${log.id}: recomputed hash does not match stored hash.`,
      };
    }

    expectedPrevHash = log.hash;
  }

  return { ok: true, totalChecked: logs.length };
}
