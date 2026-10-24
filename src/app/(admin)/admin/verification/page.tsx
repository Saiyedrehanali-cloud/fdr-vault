"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
  RefreshCw,
  Search,
  Building2,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { StatusBadge, SourceBadge } from "@/components/ui/Badge";
import { formatINR, formatDate } from "@/lib/utils";

export default function VerificationQueuePage() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalInQueue: 0,
    withinSla: 0,
    atRisk: 0,
    breached: 0,
    pending: 0,
    underReview: 0,
    discrepancy: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "UNDER_REVIEW" | "DISCREPANCY">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const loadQueue = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/verification/queue?filter=${filter}`);
      const json = await res.json();
      if (json.ok) {
        setItems(json.data.items);
        setStats(json.data.stats);
      }
    } catch (e) {
      console.error("Failed to load queue:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [filter]);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/alerts/scan", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        loadQueue();
      }
    } catch (e) {
      console.error("Scan error:", e);
    } finally {
      setIsScanning(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.refNo.toLowerCase().includes(q) ||
      item.institution.name.toLowerCase().includes(q) ||
      item.institution.aicteId.toLowerCase().includes(q) ||
      item.bankName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#00959C]">
            <ShieldCheck className="w-4 h-4" />
            <span>AICTE Regulatory Workflow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#006675] tracking-tight mt-0.5">
            Deposit Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#5B7480] mt-1">
            Prioritized FIFO queue of institutional deposit certificates awaiting statutory verification and core bank cross-check.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#006675] text-white hover:bg-[#005562] shadow-sm disabled:opacity-75 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-[#4DC2C2]" : ""}`} />
          <span>{isScanning ? "Running Automated Scan..." : "Run Advisory Scan"}</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total In Queue */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5B7480]">Total Awaiting Action</span>
            <div className="w-8 h-8 rounded-xl bg-[#E0F5F5] flex items-center justify-center text-[#006675]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#0F2A30]">
              {stats.totalInQueue}
            </span>
            <span className="text-[11px] text-[#5B7480]">Instruments</span>
          </div>
        </div>

        {/* Within SLA (< 2d) */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Within SLA (&lt; 2 Days)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {stats.withinSla}
            </span>
            <span className="text-[11px] text-emerald-600">Optimal</span>
          </div>
        </div>

        {/* Approaching SLA (2-5d) */}
        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">At Risk (2–5 Days)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600">
              {stats.atRisk}
            </span>
            <span className="text-[11px] text-amber-600">Expedite</span>
          </div>
        </div>

        {/* SLA Breached (> 5d) */}
        <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">SLA Breached (&gt; 5 Days)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#EB5A11]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#EB5A11]">
              {stats.breached}
            </span>
            <span className="text-[11px] text-rose-600">Urgent</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                filter === "ALL"
                  ? "bg-[#006675] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Items ({stats.totalInQueue})
            </button>

            <button
              onClick={() => setFilter("PENDING")}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                filter === "PENDING"
                  ? "bg-[#FF9D2D] text-[#0F2A30] shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Pending ({stats.pending})
            </button>

            <button
              onClick={() => setFilter("UNDER_REVIEW")}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                filter === "UNDER_REVIEW"
                  ? "bg-[#00959C] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Under Review ({stats.underReview})
            </button>

            <button
              onClick={() => setFilter("DISCREPANCY")}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                filter === "DISCREPANCY"
                  ? "bg-[#EB5A11] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Discrepancies ({stats.discrepancy})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by college, ref no, bank..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00959C]"
            />
          </div>
        </div>

        {/* Verification Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[#5B7480] font-bold">
                <th className="py-3 px-4">Priority / Instrument</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Deposit Amount</th>
                <th className="py-3 px-4">Issuing Bank</th>
                <th className="py-3 px-4">Queue SLA Ageing</th>
                <th className="py-3 px-4">Status & Source</th>
                <th className="py-3 px-4">Advisory Flags</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#00959C]" />
                      <span>Loading verification queue...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                        🎉
                      </div>
                      <h4 className="text-sm font-bold text-[#0F2A30]">All Caught Up!</h4>
                      <p className="text-xs text-[#5B7480]">
                        No deposit instruments pending statutory review in this view.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Ref No & Queue Rank */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-400 w-5">
                            #{idx + 1}
                          </span>
                          <span className="font-mono font-bold text-[#006675]">
                            {item.refNo}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Sub: {formatDate(item.submittedAt)}
                        </div>
                      </td>

                      {/* Institution */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0F2A30] truncate max-w-[220px]">
                          {item.institution.name}
                        </div>
                        <div className="text-[11px] text-[#5B7480]">
                          {item.institution.city}, {item.institution.state} · {item.institution.aicteId}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-bold text-[#0F2A30]">
                        {formatINR(item.amount)}
                      </td>

                      {/* Bank */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#0F2A30]">{item.bankName}</div>
                        <div className="text-[11px] text-[#5B7480] truncate max-w-[140px]">
                          {item.branch}
                        </div>
                      </td>

                      {/* SLA Ageing Chip */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            item.slaTier === "GREEN"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.slaTier === "YELLOW"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-rose-50 text-[#EB5A11] border border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.slaTier === "GREEN"
                                ? "bg-emerald-500"
                                : item.slaTier === "YELLOW"
                                ? "bg-amber-500"
                                : "bg-[#EB5A11]"
                            }`}
                          />
                          <span>{item.queueDays}d in queue</span>
                        </span>
                      </td>

                      {/* Status & Source Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={item.verificationStatus} />
                          <SourceBadge source={item.source} />
                        </div>
                      </td>

                      {/* Advisory Flags */}
                      <td className="py-3.5 px-4">
                        {item.unresolvedFlagsCount > 0 ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-[#EB5A11] text-[11px] font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{item.unresolvedFlagsCount} Flag{item.unresolvedFlagsCount > 1 ? "s" : ""}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Passed</span>
                          </div>
                        )}
                      </td>

                      {/* Action CTA */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/fdrs/${item.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#006675] hover:bg-[#005562] transition-colors shadow-xs"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
