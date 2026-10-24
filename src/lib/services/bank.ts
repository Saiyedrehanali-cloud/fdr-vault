import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export interface BankVerificationResult {
  ok: boolean;
  status: "MATCH" | "MISMATCH" | "UNAVAILABLE";
  message: string;
  diffs?: string[];
  bankRecord?: {
    bankName: string;
    refNo: string;
    amount: number;
    issueDate: Date;
    maturityDate: Date;
    holderName: string;
  };
}

/**
 * Simulates calling a scheduled commercial bank core banking system (CBS / Finacle / BaNCS)
 * to verify instrument authenticity, balance, and tenure.
 */
export async function verifyFDRWithBank(
  fdrId: string,
  actor: { id: string; name: string; role: string; ipAddress?: string }
): Promise<BankVerificationResult> {
  const fdr = await db.fDR.findUnique({
    where: { id: fdrId },
    include: { institution: true },
  });

  if (!fdr) {
    return {
      ok: false,
      status: "UNAVAILABLE",
      message: "FDR record not found in system.",
    };
  }

  // Query mock bank registry for bankName + refNo
  const bankRecord = await db.mockBankRecord.findUnique({
    where: {
      bankName_refNo: {
        bankName: fdr.bankName,
        refNo: fdr.refNo,
      },
    },
  });

  if (!bankRecord) {
    // Record unavailable check
    await db.bankVerification.create({
      data: {
        fdrId: fdr.id,
        status: "UNAVAILABLE",
        source: "MOCK_BANK_API",
        checkedById: actor.id,
      },
    });

    await logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: "BANK_VERIFICATION_FAILED",
      entityType: "FDR",
      entityId: fdr.id,
      details: {
        reason: "Core Banking API returned: Instrument not found in active CBS records.",
        bankName: fdr.bankName,
        refNo: fdr.refNo,
      },
      ipAddress: actor.ipAddress,
    });

    return {
      ok: true,
      status: "UNAVAILABLE",
      message: `Bank Core System (${fdr.bankName}) could not locate deposit instrument ${fdr.refNo}.`,
    };
  }

  // Cross-examine parameters
  const diffs: string[] = [];

  // 1. Amount match (allowing 0 delta)
  if (Math.abs(bankRecord.amount - fdr.amount) > 0.01) {
    diffs.push("amount");
  }

  // 2. Maturity date match (year-month-day)
  const bankMaturityStr = bankRecord.maturityDate.toISOString().split("T")[0];
  const fdrMaturityStr = fdr.maturityDate.toISOString().split("T")[0];
  if (bankMaturityStr !== fdrMaturityStr) {
    diffs.push("maturityDate");
  }

  const isMatch = diffs.length === 0;

  if (isMatch) {
    // Record MATCH verification
    await db.bankVerification.create({
      data: {
        fdrId: fdr.id,
        status: "MATCH",
        source: "MOCK_BANK_API",
        confirmedJson: JSON.stringify(bankRecord),
        checkedById: actor.id,
      },
    });

    // Update source badge to BANK_CONFIRMED
    await db.fDR.update({
      where: { id: fdr.id },
      data: {
        source: "BANK_CONFIRMED",
      },
    });

    // Resolve any previous BANK_MISMATCH flags
    await db.discrepancyFlag.updateMany({
      where: {
        fdrId: fdr.id,
        code: "BANK_MISMATCH",
      },
      data: {
        resolved: true,
      },
    });

    await logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: "BANK_VERIFICATION_MATCHED",
      entityType: "FDR",
      entityId: fdr.id,
      details: {
        status: "MATCH",
        bankName: fdr.bankName,
        refNo: fdr.refNo,
        amount: fdr.amount,
      },
      ipAddress: actor.ipAddress,
    });

    return {
      ok: true,
      status: "MATCH",
      message: "Bank Core API Response: MATCH. All instrument parameters confirmed by issuing scheduled commercial bank.",
      bankRecord,
    };
  } else {
    // Record MISMATCH
    const diffDetails = {
      submitted: {
        amount: fdr.amount,
        maturityDate: fdrMaturityStr,
      },
      bankConfirmed: {
        amount: bankRecord.amount,
        maturityDate: bankMaturityStr,
      },
      mismatchedFields: diffs,
    };

    await db.bankVerification.create({
      data: {
        fdrId: fdr.id,
        status: "MISMATCH",
        source: "MOCK_BANK_API",
        confirmedJson: JSON.stringify(bankRecord),
        diffsJson: JSON.stringify(diffDetails),
        checkedById: actor.id,
      },
    });

    // Update FDR source to MISMATCH and verificationStatus to DISCREPANCY
    await db.fDR.update({
      where: { id: fdr.id },
      data: {
        source: "MISMATCH",
        verificationStatus: "DISCREPANCY",
      },
    });

    // Add or update DiscrepancyFlag
    await db.discrepancyFlag.create({
      data: {
        fdrId: fdr.id,
        code: "BANK_MISMATCH",
        severity: "HIGH",
        message: `Bank Core System reports divergence in ${diffs.join(", ")}. Submitted amount: ₹${(fdr.amount / 100000).toFixed(2)}L vs Bank: ₹${(bankRecord.amount / 100000).toFixed(2)}L.`,
        evidence: JSON.stringify(diffDetails),
        resolved: false,
      },
    });

    await logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: "BANK_VERIFICATION_MISMATCH",
      entityType: "FDR",
      entityId: fdr.id,
      details: diffDetails,
      ipAddress: actor.ipAddress,
    });

    return {
      ok: true,
      status: "MISMATCH",
      message: `Bank Core System returned divergence on fields: ${diffs.join(", ")}.`,
      diffs,
      bankRecord,
    };
  }
}
