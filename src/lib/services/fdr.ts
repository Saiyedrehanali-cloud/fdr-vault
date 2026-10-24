import { differenceInCalendarDays } from "date-fns";

export type LifecycleStatus =
  | "ACTIVE"
  | "EXPIRING"
  | "MATURED"
  | "RENEWED"
  | "RELEASE_REQUESTED"
  | "RELEASED";

export type VerificationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "DISCREPANCY";

export interface FdrWithRelations {
  id: string;
  refNo: string;
  bankName: string;
  branch: string;
  amount: number;
  issueDate: Date;
  maturityDate: Date;
  purpose: string;
  academicYear: string;
  verificationStatus: string;
  discrepancyReason?: string | null;
  releaseRequested: boolean;
  releasedAt?: Date | null;
  renewedAt?: Date | null;
  renewalOfId?: string | null;
}

/**
 * Computes dynamic lifecycle status based on dates and workflow state (TRD §4.2)
 */
export function computeLifecycle(
  fdr: {
    maturityDate: Date;
    releasedAt?: Date | null;
    releaseRequested?: boolean | null;
    renewedAt?: Date | null;
  },
  today: Date = new Date()
): LifecycleStatus {
  if (fdr.releasedAt) return "RELEASED";
  if (fdr.releaseRequested) return "RELEASE_REQUESTED";
  if (fdr.renewedAt) return "RENEWED";

  const days = differenceInCalendarDays(new Date(fdr.maturityDate), today);
  if (days < 0) return "MATURED";
  if (days <= 90) return "EXPIRING";
  return "ACTIVE";
}

/**
 * Computes exact integer days remaining until maturity
 */
export function computeDaysToMaturity(
  maturityDate: Date | string,
  today: Date = new Date()
): number {
  return differenceInCalendarDays(new Date(maturityDate), today);
}

/**
 * Categorize severity for expiry alerts & badges
 */
export function getExpirySeverityCategory(days: number): {
  severity: "OK" | "WARNING" | "HIGH" | "CRITICAL";
  colorToken: string;
  badgeBg: string;
  badgeText: string;
} {
  if (days < 0 || days <= 7) {
    return {
      severity: "CRITICAL",
      colorToken: "brand-burnt-orange",
      badgeBg: "#FDE3D6",
      badgeText: "#B2400A",
    };
  }
  if (days <= 30) {
    return {
      severity: "HIGH",
      colorToken: "brand-orange",
      badgeBg: "#FFE8D6",
      badgeText: "#B3470C",
    };
  }
  if (days <= 90) {
    return {
      severity: "WARNING",
      colorToken: "brand-yellow-orange",
      badgeBg: "#FFF1DC",
      badgeText: "#9A5A00",
    };
  }
  return {
    severity: "OK",
    colorToken: "brand-teal",
    badgeBg: "#E0F5F5",
    badgeText: "#006675",
  };
}
