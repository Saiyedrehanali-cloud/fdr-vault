import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Rupees format (e.g. ₹ 42.6 Cr or ₹ 15,00,000)
 */
export function formatINR(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0";

  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date in standard Indian institutional format: DD MMM YYYY
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Severity colors and styles based on days to maturity (04_UI_UX_DESIGN.md)
 */
export function getMaturitySeverity(days: number): {
  severity: "ok" | "warning" | "high" | "critical";
  bg: string;
  text: string;
  dot: string;
  label: string;
} {
  if (days < 0) {
    return {
      severity: "critical",
      bg: "bg-[#FDE3D6]",
      text: "text-[#B2400A]",
      dot: "bg-[#EB5A11]",
      label: `Overdue by ${Math.abs(days)}d`,
    };
  }
  if (days <= 7) {
    return {
      severity: "critical",
      bg: "bg-[#FDE3D6]",
      text: "text-[#B2400A]",
      dot: "bg-[#EB5A11]",
      label: `${days} days left`,
    };
  }
  if (days <= 30) {
    return {
      severity: "high",
      bg: "bg-[#FFE8D6]",
      text: "text-[#B3470C]",
      dot: "bg-[#F87C2B]",
      label: `${days} days left`,
    };
  }
  if (days <= 90) {
    return {
      severity: "warning",
      bg: "bg-[#FFF1DC]",
      text: "text-[#9A5A00]",
      dot: "bg-[#FF9D2D]",
      label: `${days} days left`,
    };
  }
  return {
    severity: "ok",
    bg: "bg-[#E0F5F5]",
    text: "text-[#006675]",
    dot: "bg-[#00959C]",
    label: `${days} days left`,
  };
}
