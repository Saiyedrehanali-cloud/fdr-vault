"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  Download,
  Building2,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { StatusBadge, SourceBadge } from "@/components/ui/Badge";
import { formatINR, getMaturitySeverity } from "@/lib/utils";

const BANKS_FILTER = [
  "All Banks",
  "State Bank of India",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "HDFC Bank Ltd.",
  "ICICI Bank Ltd.",
  "Union Bank of India",
  "Bank of India",
];

const STATUS_FILTER = [
  "All Statuses",
  "VERIFIED",
  "PENDING",
  "UNDER_REVIEW",
  "DISCREPANCY",
];

export default function AdminFdrListPage() {
  const [fdrs, setFdrs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState("All Banks");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFdrs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedBank !== "All Banks") params.set("bank", selectedBank);
      if (selectedStatus !== "All Statuses") params.set("verification", selectedStatus);
      params.set("page", page.toString());
      params.set("limit", "25");

      const res = await fetch(`/api/fdrs?${params.toString()}`);
      const json = await res.json();

      if (json.ok) {
        setFdrs(json.data.items);
        setTotalPages(json.data.pagination.totalPages);
        setTotalCount(json.data.pagination.total);
      }
    } catch (e) {
      console.error("Failed to fetch FDRs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFdrs();
  }, [selectedBank, selectedStatus, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFdrs();
  };

  // CSV Export utility
  const handleExportCsv = () => {
    if (fdrs.length === 0) return;
    const headers = [
      "FDR Ref",
      "Institution",
      "AICTE ID",
      "Bank",
      "Branch",
      "Amount",
      "Maturity Date",
      "Status",
      "Source",
    ];
    const rows = fdrs.map((f) => [
      `"${f.refNo}"`,
      `"${f.institutionName}"`,
      `"${f.aicteId}"`,
      `"${f.bankName}"`,
      `"${f.branch}"`,
      f.amount,
      f.maturityDate,
      f.verificationStatus,
      f.source,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AICTE_FDR_Registry_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5B7480]">
            <Link href="/admin" className="hover:text-[#006675]">
              AICTE Regulation Bureau
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#006675]">All Fixed Deposit Receipts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#006675] tracking-tight mt-1">
            Centralized FDR Repository
          </h1>
          <p className="text-xs sm:text-sm text-[#5B7480]">
            National database of financial security deposit receipts across all approved technical institutions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-[#00959C] text-[#006675] bg-white hover:bg-[#E0F5F5] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-[#00959C]" />
            <span>Export Registry (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by FDR reference number, college name, or AICTE ID..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#00959C] focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Bank Filter */}
          <select
            value={selectedBank}
            onChange={(e) => {
              setSelectedBank(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#00959C] focus:bg-white focus:outline-hidden"
          >
            {BANKS_FILTER.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#00959C] focus:bg-white focus:outline-hidden"
          >
            {STATUS_FILTER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 text-xs sm:text-sm font-bold bg-[#006675] text-white hover:bg-[#005562] rounded-xl shadow-xs"
          >
            Filter
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-[#5B7480] pt-1">
          <span>
            Showing <strong className="text-[#0F2A30]">{fdrs.length}</strong> of{" "}
            <strong className="text-[#0F2A30]">{totalCount}</strong> recorded instruments
          </span>
          {(selectedBank !== "All Banks" || selectedStatus !== "All Statuses" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedBank("All Banks");
                setSelectedStatus("All Statuses");
                setSearchQuery("");
                setPage(1);
              }}
              className="text-[#EB5A11] hover:underline font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main FDR Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F1F5F9] text-[#5B7480] uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th scope="col" className="py-3 px-4 sm:px-6">FDR Reference</th>
                <th scope="col" className="py-3 px-4">Institution</th>
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
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#006675] border-t-transparent rounded-full animate-spin" />
                      <span>Loading institutional deposit records...</span>
                    </div>
                  </td>
                </tr>
              ) : fdrs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No FDR records matched the active filter criteria.
                  </td>
                </tr>
              ) : (
                fdrs.map((item) => {
                  const maturityPill = getMaturitySeverity(item.daysToMaturity);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                    >
                      {/* Ref No */}
                      <td className="py-3.5 px-4 sm:px-6 font-semibold">
                        <Link
                          href={`/admin/fdrs/${item.id}`}
                          className="font-mono text-xs sm:text-[13px] text-[#006675] font-bold hover:underline"
                        >
                          {item.refNo}
                        </Link>
                        <span className="text-[11px] text-[#5B7480] font-normal block truncate max-w-[180px]">
                          {item.purpose}
                        </span>
                      </td>

                      {/* Institution */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0F2A30] line-clamp-1 max-w-[210px]">
                          {item.institutionName}
                        </div>
                        <div className="text-[11px] text-[#5B7480]">
                          ID: {item.aicteId} · {item.city}
                        </div>
                      </td>

                      {/* Bank & Branch */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#0F2A30]">{item.bankName}</div>
                        <div className="text-[11px] text-[#5B7480] truncate max-w-[170px]">
                          {item.branch}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-bold text-[#0F2A30]">
                        {formatINR(item.amount)}
                      </td>

                      {/* Maturity */}
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

                      {/* Status & Source (Dual-source badge) */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={item.verificationStatus} />
                          <SourceBadge source={item.source} />
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <Link
                          href={`/admin/fdrs/${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#006675] bg-[#E0F5F5] hover:bg-[#00959C] hover:text-white transition-colors"
                        >
                          <span>Review</span>
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#5B7480]">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-md border border-slate-200 bg-white disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-md border border-slate-200 bg-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
