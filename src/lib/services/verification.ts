import { db } from "@/lib/db";
import { isBefore } from "date-fns";

export interface DiscrepancyFlagResult {
  code: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  evidence?: string;
}

/**
 * Executes advisory automated rule checks on an FDR (TRD §4.5)
 */
export async function runDiscrepancyRules(fdrId: string): Promise<DiscrepancyFlagResult[]> {
  const fdr = await db.fDR.findUnique({
    where: { id: fdrId },
    include: {
      institution: true,
      documents: true,
      bankChecks: { take: 1, orderBy: { checkedAt: "desc" } },
    },
  });

  if (!fdr) return [];

  const flags: DiscrepancyFlagResult[] = [];
  const today = new Date();

  // 1. MISSING_DOC: No PDF document attached
  if (!fdr.documents || fdr.documents.length === 0) {
    flags.push({
      code: "MISSING_DOC",
      severity: "HIGH",
      message: "No electronic Fixed Deposit Receipt (PDF) attached to submission.",
      evidence: "Document count = 0",
    });
  }

  // 2. DATE_INVALID: Maturity <= Issue date
  if (isBefore(new Date(fdr.maturityDate), new Date(fdr.issueDate)) || fdr.maturityDate.getTime() === fdr.issueDate.getTime()) {
    flags.push({
      code: "DATE_INVALID",
      severity: "HIGH",
      message: "Maturity date is earlier than or equal to the issue date.",
      evidence: `Issue: ${fdr.issueDate.toISOString().split("T")[0]}, Maturity: ${fdr.maturityDate.toISOString().split("T")[0]}`,
    });
  }

  // 3. EXPIRED_AT_SUBMIT: Instrument already expired on date of submission
  if (isBefore(new Date(fdr.maturityDate), new Date(fdr.submittedAt))) {
    flags.push({
      code: "EXPIRED_AT_SUBMIT",
      severity: "HIGH",
      message: "Fixed Deposit Receipt had already matured prior to submission to AICTE.",
      evidence: `Maturity: ${fdr.maturityDate.toISOString().split("T")[0]}, Submitted: ${fdr.submittedAt.toISOString().split("T")[0]}`,
    });
  }

  // 4. DUPLICATE_DOCUMENT: Same file hash exists on another FDR
  if (fdr.documents && fdr.documents.length > 0) {
    for (const doc of fdr.documents) {
      const duplicateDoc = await db.fDRDocument.findFirst({
        where: {
          fileHash: doc.fileHash,
          fdrId: { not: fdrId },
        },
        include: {
          fdr: { select: { refNo: true } },
        },
      });

      if (duplicateDoc) {
        flags.push({
          code: "DUPLICATE_DOCUMENT",
          severity: "HIGH",
          message: `Identical document content hash previously attached to FDR ${duplicateDoc.fdr.refNo}. Possible duplicate receipt upload.`,
          evidence: `SHA-256: ${doc.fileHash.substring(0, 16)}...`,
        });
      }
    }
  }

  // 5. AMOUNT_BELOW_REQUIRED: Amount < institution requiredDeposit
  if (fdr.institution.requiredDeposit > 0 && fdr.amount < fdr.institution.requiredDeposit) {
    flags.push({
      code: "AMOUNT_BELOW_REQUIRED",
      severity: "MEDIUM",
      message: `Submitted amount of ₹${(fdr.amount / 100000).toFixed(2)} Lakhs is below the institution's mandatory deposit threshold of ₹${(fdr.institution.requiredDeposit / 100000).toFixed(2)} Lakhs.`,
      evidence: `Shortfall: ₹${((fdr.institution.requiredDeposit - fdr.amount) / 100000).toFixed(2)} Lakhs`,
    });
  }

  // 6. BANK_MISMATCH: Bank check reported discrepancy
  if (fdr.bankChecks && fdr.bankChecks.length > 0 && fdr.bankChecks[0].status === "MISMATCH") {
    flags.push({
      code: "BANK_MISMATCH",
      severity: "HIGH",
      message: "Direct bank verification returned divergence on core fields.",
      evidence: fdr.bankChecks[0].diffsJson || "Core banking data divergence",
    });
  }

  // Persist flags to database
  for (const flag of flags) {
    const existing = await db.discrepancyFlag.findFirst({
      where: { fdrId, code: flag.code, resolved: false },
    });

    if (!existing) {
      await db.discrepancyFlag.create({
        data: {
          fdrId,
          code: flag.code,
          severity: flag.severity,
          message: flag.message,
          evidence: flag.evidence,
        },
      });
    }
  }

  return flags;
}
