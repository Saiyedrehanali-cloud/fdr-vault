"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  PlusCircle,
  FileText,
  CalendarClock,
  AlertTriangle,
  IndianRupee,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Info,
  Clock,
  ArrowRight,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusBadge, SourceBadge } from "@/components/ui/Badge";
import { formatINR, getMaturitySeverity } from "@/lib/utils";

export default function InstitutionPortalPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPortal() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/portal/summary");
        const json = await res.json();
        if (json.ok) {
          setData(json.data);
        }
      } catch (e) {
        console.error("Portal load error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadPortal();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const institution = data?.institution;
  const recentFdrs = data?.recentFdrs || [];

  return (
    <div className="space-y-6">
      {/* College Greeting & AICTE ID Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#006675] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-[#006675]">
                {institution?.name || "Demo Institute of Technology, Bhopal"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E0F5F5] text-[#006675] text-xs font-bold border border-[#00959C]/20">
                AICTE ID: {institution?.aicteId || "1-4829100"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5B7480] mt-1">
              {institution?.city}, {institution?.state} · Region: {institution?.region} · Type: {institution?.type}
            </p>
          </div>
        </div>

        {/* Big Action CTA Button */}
        <Link
          href="/portal/fdrs/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C] shadow-md hover:shadow-lg transition-all active:scale-98 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Submit New FDR</span>
        </Link>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          label="My FDR Deposits"
          value={data?.myTotalFdrs || 0}
          subtext="Total registered instruments"
          subtextChip="Active Guarantee"
          icon={FileText}
          accent="dark-teal"
        />

        <KpiCard
          label="Expiring Soon (≤90d)"
          value={data?.expiringSoon || 0}
          subtext="Requires timely renewal"
          subtextChip="Compliance Priority"
          icon={CalendarClock}
          accent="burnt-orange"
        />

        <KpiCard
          label="Action Needed"
          value={data?.actionNeeded || 0}
          subtext="Discrepancies / In Review"
          subtextChip="Scrutiny Queue"
          icon={AlertTriangle}
          accent="yellow-orange"
        />

        <KpiCard
          label="Total Deposited"
          value={formatINR(data?.totalDeposited || 0, true)}
          subtext={`Required: ${formatINR(data?.requiredDeposit || 0, true)}`}
          subtextChip={formatINR(data?.totalDeposited || 0)}
          icon={IndianRupee}
          accent="teal"
        />
      </div>

      {/* Action Needed Callout if Discrepancies exist */}
      {data?.actionNeeded > 0 && (
        <div className="p-4 rounded-2xl bg-[#FFF1DC] border-l-4 border-[#FF9D2D] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#EB5A11] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-[#9A5A00]">
                Discrepancy Action Required
              </h4>
              <p className="text-xs text-[#0F2A30]">
                AICTE scrutiny officers have highlighted observations or bank data differences on your submissions.
              </p>
            </div>
          </div>
          <Link
            href="/portal/fdrs"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C]"
          >
            <span>Review Observations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* My FDR Repository Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#006675]">
              Institutional Fixed Deposit Receipts
            </h3>
            <p className="text-xs text-[#5B7480] mt-0.5">
              Live status tracking, renewal management, and release eligibility.
            </p>
          </div>
          <Link
            href="/portal/fdrs"
            className="text-xs font-bold text-[#00959C] hover:underline flex items-center gap-1"
          >
            <span>View All Records</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F1F5F9] text-[#5B7480] uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th scope="col" className="py-3 px-4 sm:px-6">FDR Number</th>
                <th scope="col" className="py-3 px-4">Bank & Branch</th>
                <th scope="col" className="py-3 px-4 text-right">Amount (INR)</th>
                <th scope="col" className="py-3 px-4">Maturity Date</th>
                <th scope="col" className="py-3 px-4">Status & Source</th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentFdrs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No FDR records found. Click "+ Submit New FDR" to register your initial deposit.
                  </td>
                </tr>
              ) : (
                recentFdrs.map((item: any) => {
                  const maturityPill = getMaturitySeverity(item.daysLeft);

                  return (
                    <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-semibold">
                        <div className="font-mono text-xs sm:text-[13px] text-[#006675] font-bold">
                          {item.refNo}
                        </div>
                        <span className="text-[11px] text-[#5B7480] font-normal">
                          {item.purpose}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#0F2A30]">{item.bankName}</div>
                        <div className="text-[11px] text-[#5B7480] truncate max-w-[170px]">
                          {item.branch}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-[#0F2A30]">
                        {formatINR(item.amount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-[#0F2A30]">
                          {item.maturityDate}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold mt-1 ${maturityPill.bg} ${maturityPill.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${maturityPill.dot}`} />
                          {maturityPill.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={item.status} />
                          <SourceBadge source={item.source} />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <Link
                          href={`/portal/fdrs/${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#006675] bg-[#E0F5F5] hover:bg-[#00959C] hover:text-white transition-colors"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-3 h-3" />
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
