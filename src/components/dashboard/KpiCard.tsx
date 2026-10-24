import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiAccent = "dark-teal" | "burnt-orange" | "yellow-orange" | "teal";

export interface KpiCardProps {
  label: string;
  value: string | number;
  subtext: string;
  subtextChip?: string;
  icon: LucideIcon;
  accent: KpiAccent;
  href?: string;
  onClick?: () => void;
}

const accentStyles: Record<
  KpiAccent,
  {
    borderTop: string;
    iconBg: string;
    iconColor: string;
    chipBg: string;
    chipText: string;
  }
> = {
  "dark-teal": {
    borderTop: "border-t-[#006675]",
    iconBg: "bg-[#006675]/10",
    iconColor: "text-[#006675]",
    chipBg: "bg-[#E0F5F5]",
    chipText: "text-[#006675]",
  },
  "burnt-orange": {
    borderTop: "border-t-[#EB5A11]",
    iconBg: "bg-[#EB5A11]/10",
    iconColor: "text-[#EB5A11]",
    chipBg: "bg-[#FDE3D6]",
    chipText: "text-[#B2400A]",
  },
  "yellow-orange": {
    borderTop: "border-t-[#FF9D2D]",
    iconBg: "bg-[#FF9D2D]/15",
    iconColor: "text-[#FF9D2D]",
    chipBg: "bg-[#FFF1DC]",
    chipText: "text-[#9A5A00]",
  },
  teal: {
    borderTop: "border-t-[#00959C]",
    iconBg: "bg-[#00959C]/10",
    iconColor: "text-[#00959C]",
    chipBg: "bg-[#E0F5F5]",
    chipText: "text-[#006675]",
  },
};

export function KpiCard({
  label,
  value,
  subtext,
  subtextChip,
  icon: Icon,
  accent,
  onClick,
}: KpiCardProps) {
  const styles = accentStyles[accent];

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative bg-white rounded-2xl p-5 border border-slate-200 border-t-4 shadow-card hover:-translate-y-0.5 hover:shadow-pop transition-all duration-200 cursor-pointer select-none",
        styles.borderTop
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs md:text-[13px] font-semibold text-[#5B7480] uppercase tracking-wider">
          {label}
        </span>
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            styles.iconBg
          )}
        >
          <Icon className={cn("w-5 h-5 stroke-[2.2]", styles.iconColor)} />
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2A30] font-sans">
          {value}
        </h3>
      </div>

      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
        {subtextChip && (
          <span
            className={cn(
              "px-2 py-0.5 rounded-md text-[11px] font-bold tracking-tight",
              styles.chipBg,
              styles.chipText
            )}
          >
            {subtextChip}
          </span>
        )}
        <span className="text-xs text-[#5B7480] font-medium">{subtext}</span>
      </div>
    </div>
  );
}
