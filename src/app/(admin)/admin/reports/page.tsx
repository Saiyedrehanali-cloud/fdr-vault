"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Calendar,
  AlertTriangle,
  Undo2,
  Building2,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

const REPORT_TYPES = [
  {
    id: "ACTIVE",
    title: "All Active FDRs Register",
    description: "Complete statutory ledger of all active security deposits across nationwide institutions.",
    icon: FileText,
    color: "text-[#006675]",
    bg: "bg-[#E0F5F5]",
  },
  {
    id: "EXPIRING",
    title: "90-Day Expiring Deposits",
    description: "Deposits maturing in the next 90 days requiring renewal or statutory action.",
    icon: Calendar,
    color: "text-[#FF9D2D]",
    bg: "bg-amber-50",
  },
  {
    id: "OVERDUE",
    title: "Overdue / Default Register",
    description: "Deposits that have surpassed maturity date without submitted renewal.",
    icon: AlertTriangle,
    color: "text-[#EB5A11]",
    bg: "bg-rose-50",
  },
  {
    id: "DISCREPANCIES",
    title: "Discrepancy & Anomaly Ledger",
    description: "All advisory rule violations, bank core system divergence, and manual flags.",
    icon: AlertTriangle,
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  {
    id: "RELEASES",
    title: "Release & Refund Log",
    description: "Discharged security deposits, NOC references, and settlement voucher audit records.",
    icon: Undo2,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    id: "INSTITUTIONS",
    title: "Institution Deficit / Compliance",
    description: "Institutional deposit totals vs AICTE mandatory minimum security requirements.",
    icon: Building2,
    color: "text-[#00959C]",
    bg: "bg-[#E0F5F5]",
  },
];

export default function AdminReportsPage() {
  const [selectedType, setSelectedType] = useState("ACTIVE");
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadReportPreview = async (typeId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/reports?type=${typeId}&format=json`);
      const json = await res.json();
      if (json.ok) {
        setPreviewData(json.data);
      }
    } catch (e) {
      console.error("Failed to load report preview:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportPreview(selectedType);
  }, [selectedType]);

  const activeMeta = REPORT_TYPES.find((r) => r.id === selectedType) || REPORT_TYPES[0];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#00959C]">
            <BarChart3 className="w-4 h-4" />
            <span>AICTE Statutory Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#006675] tracking-tight mt-0.5">
            Compliance Reports &amp; Exports
          </h1>
          <p className="text-xs sm:text-sm text-[#5B7480] mt-1">
            Generate and export official audit ledgers, default schedules, discrepancy records, and institutional compliance digests.
          </p>
        </div>

        <a
          href={`/api/reports?type=${selectedType}&format=csv`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C] shadow-sm transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export {activeMeta.title} (CSV)</span>
        </a>
      </div>

      {/* 6 Report Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map((rep) => {
          const isSelected = rep.id === selectedType;
          const IconComp = rep.icon;

          return (
            <button
              key={rep.id}
              onClick={() => setSelectedType(rep.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? "bg-white border-[#006675] shadow-md ring-2 ring-[#006675]/20"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-card"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl ${rep.bg} flex items-center justify-center ${rep.color}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#006675] text-white">
                      Selected
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-[#0F2A30] mt-3">{rep.title}</h3>
                <p className="text-xs text-[#5B7480] mt-1 leading-relaxed">
                  {rep.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#006675] font-semibold">
                <span>View Preview Table</span>
                <span>→</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#006675]" />
              <h3 className="text-base font-bold text-[#006675]">
                {activeMeta.title} Preview
              </h3>
            </div>
            <p className="text-xs text-[#5B7480] mt-0.5">
              Showing {previewData?.total || 0} total records compiled from repository.
            </p>
          </div>

          <a
            href={`/api/reports?type=${selectedType}&format=csv`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#00959C] text-[#006675] bg-white hover:bg-[#E0F5F5] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#00959C]" />
            <span>Download CSV</span>
          </a>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-100 z-10 text-[#5B7480] font-bold">
              <tr>
                {previewData?.headers?.map((h: any) => (
                  <th key={h.key} className="py-3 px-3 whitespace-nowrap">
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={previewData?.headers?.length || 6}
                    className="py-16 text-center text-slate-400"
                  >
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#00959C]" />
                      <span>Generating report preview...</span>
                    </div>
                  </td>
                </tr>
              ) : previewData?.rows?.length === 0 ? (
                <tr>
                  <td
                    colSpan={previewData?.headers?.length || 6}
                    className="py-16 text-center text-slate-400"
                  >
                    No matching records found for this report.
                  </td>
                </tr>
              ) : (
                previewData?.rows?.slice(0, 50).map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    {previewData.headers.map((h: any) => {
                      const val = row[h.key];
                      const isAmount = h.key.toLowerCase().includes("amount") || h.key.toLowerCase().includes("deposit");
                      const isRef = h.key === "refNo" || h.key === "releaseRef";

                      return (
                        <td
                          key={h.key}
                          className={`py-2.5 px-3 ${
                            isRef ? "font-mono font-bold text-[#006675]" : ""
                          } ${isAmount ? "font-semibold text-[#0F2A30]" : ""}`}
                        >
                          {isAmount && typeof val === "number"
                            ? formatINR(val)
                            : val !== null && val !== undefined
                            ? String(val)
                            : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {previewData?.rows?.length > 50 && (
          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-100">
            Preview limited to first 50 rows. Download the full CSV export for all {previewData.total} records.
          </div>
        )}
      </div>
    </div>
  );
}
