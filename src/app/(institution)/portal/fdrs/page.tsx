"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { StatusBadge, SourceBadge } from "@/components/ui/Badge";
import { formatINR, getMaturitySeverity } from "@/lib/utils";

export default function InstitutionFdrListPage() {
  const [fdrs, setFdrs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFdrs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      params.set("limit", "50");

      const res = await fetch(`/api/fdrs?${params.toString()}`);
      const json = await res.json();

      if (json.ok) {
        setFdrs(json.data.items);
      }
    } catch (e) {
      console.error("Failed to load college FDRs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFdrs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5B7480]">
            <Link href="/portal" className="hover:text-[#006675]">
              Institution Portal
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#006675]">My Security Deposits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#006675] tracking-tight mt-1">
            My FDR Repository
          </h1>
          <p className="text-xs sm:text-sm text-[#5B7480]">
            Manage all active, expiring, and renewed Fixed Deposit Receipts registered with AICTE.
          </p>
        </div>

        <Link
          href="/portal/fdrs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C] shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Submit New FDR</span>
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchFdrs()}
              placeholder="Search by FDR number or purpose..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#00959C] focus:bg-white focus:outline-hidden"
            />
          </div>

          <span className="text-xs font-semibold text-[#5B7480]">
            Total: {fdrs.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F1F5F9] text-[#5B7480] uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th scope="col" className="py-3 px-4 sm:px-6">FDR Reference</th>
                <th scope="col" className="py-3 px-4">Bank & Branch</th>
                <th scope="col" className="py-3 px-4 text-right">Amount (INR)</th>
                <th scope="col" className="py-3 px-4">Maturity Date</th>
                <th scope="col" className="py-3 px-4">Status & Source</th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Loading your security deposit receipts...
                  </td>
                </tr>
              ) : fdrs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No matching FDR records found.
                  </td>
                </tr>
              ) : (
                fdrs.map((item) => {
                  const maturityPill = getMaturitySeverity(item.daysToMaturity);

                  return (
                    <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-semibold">
                        <Link
                          href={`/portal/fdrs/${item.id}`}
                          className="font-mono text-xs sm:text-[13px] text-[#006675] font-bold hover:underline"
                        >
                          {item.refNo}
                        </Link>
                        <span className="text-[11px] text-[#5B7480] block font-normal">
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
                          <StatusBadge status={item.verificationStatus} />
                          <SourceBadge source={item.source} />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <Link
                          href={`/portal/fdrs/${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#006675] bg-[#E0F5F5] hover:bg-[#00959C] hover:text-white transition-colors"
                        >
                          <span>View Detail</span>
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
