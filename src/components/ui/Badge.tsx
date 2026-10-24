import React from "react";
import { UserRound, BadgeCheck, AlertTriangle, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "VERIFIED"
  | "ACTIVE"
  | "PENDING"
  | "UNDER_REVIEW"
  | "EXPIRING"
  | "CRITICAL"
  | "OVERDUE"
  | "DISCREPANCY"
  | "MATURED"
  | "RELEASED"
  | "RENEWED";

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
  label?: string;
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const norm = (status || "").toUpperCase();

  let bg = "bg-[#EEF2F6]";
  let text = "text-[#475569]";
  let dot = "bg-[#94A3B8]";
  let displayLabel = label || norm.replace(/_/g, " ");

  if (norm === "VERIFIED" || norm === "ACTIVE") {
    bg = "bg-[#E0F5F5]";
    text = "text-[#006675]";
    dot = "bg-[#00959C]";
  } else if (norm === "PENDING" || norm === "UNDER_REVIEW") {
    bg = "bg-[#FFF1DC]";
    text = "text-[#9A5A00]";
    dot = "bg-[#FF9D2D]";
  } else if (norm === "EXPIRING") {
    bg = "bg-[#FFE8D6]";
    text = "text-[#B3470C]";
    dot = "bg-[#F87C2B]";
  } else if (norm === "CRITICAL" || norm === "OVERDUE" || norm === "DISCREPANCY") {
    bg = "bg-[#FDE3D6]";
    text = "text-[#B2400A]";
    dot = "bg-[#EB5A11]";
  } else if (norm === "RELEASED" || norm === "RENEWED") {
    bg = "bg-[#E6F7F7]";
    text = "text-[#006675]";
    dot = "bg-[#4DC2C2]";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-transparent shadow-sm",
        bg,
        text,
        className
      )}
    >
      <span className={cn("w-2 h-2 rounded-full", dot)} />
      {displayLabel}
    </span>
  );
}

interface SourceBadgeProps {
  source: "SUBMITTED" | "BANK_CONFIRMED" | "MISMATCH";
  className?: string;
}

export function SourceBadge({ source, className }: SourceBadgeProps) {
  if (source === "BANK_CONFIRMED") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#E0F5F5] text-[#006675] border border-[#00959C]/20 shadow-xs",
          className
        )}
        title="Verified and confirmed directly by core banking record"
      >
        <BadgeCheck className="w-3.5 h-3.5 text-[#00959C]" />
        Bank-confirmed
      </span>
    );
  }

  if (source === "MISMATCH") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FDE3D6] text-[#B2400A] border border-[#EB5A11]/30 animate-pulse",
          className
        )}
        title="Divergence detected between submitted data and bank record"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-[#EB5A11]" />
        Mismatch
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200",
        className
      )}
      title="Value submitted by institution nodal officer"
    >
      <UserRound className="w-3.5 h-3.5 text-slate-500" />
      Submitted
    </span>
  );
}
