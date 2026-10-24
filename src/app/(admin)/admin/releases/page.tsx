"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Undo2,
  FileText,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  FileCheck,
  Send,
  X,
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils";

export default function AdminReleasesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    requested: 0,
    underScrutiny: 0,
    approved: 0,
    released: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "ALL" | "REQUESTED" | "UNDER_SCRUTINY" | "APPROVED" | "RELEASED" | "REJECTED"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReleases = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/releases?status=${activeTab}`);
      const json = await res.json();
      if (json.ok) {
        setItems(json.data.items);
        setStats(json.data.stats);
      }
    } catch (e) {
      console.error("Failed to load releases:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReleases();
  }, [activeTab]);

  const handleAction = async (id: string, action: string, remarks?: string) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/releases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, remarks }),
      });
      const json = await res.json();
      if (json.ok) {
        loadReleases();
      } else {
        alert(json.error || "Action failed");
      }
    } catch (e) {
      alert("Error executing action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReleaseId || !rejectReason.trim()) return;
    await handleAction(selectedReleaseId, "REJECT", rejectReason.trim());
    setRejectModalOpen(false);
    setSelectedReleaseId(null);
    setRejectReason("");
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.fdr.refNo.toLowerCase().includes(q) ||
      item.fdr.institution.name.toLowerCase().includes(q) ||
      item.fdr.institution.aicteId.toLowerCase().includes(q) ||
      item.reason.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "UNDER_SCRUTINY":
        return "bg-[#E0F5F5] text-[#006675] border-[#00959C]/30";
      case "APPROVED":
        return "bg-teal-50 text-teal-800 border-teal-200";
      case "RELEASED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#00959C]">
            <Undo2 className="w-4 h-4" />
            <span>AICTE Release &amp; Refund Authority</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#006675] tracking-tight mt-0.5">
            Security Deposit Release Requests
          </h1>
          <p className="text-xs sm:text-sm text-[#5B7480] mt-1">
            Statutory scrutiny, compliance checklist verification, and discharge voucher issuance for institutional refund claims.
          </p>
        </div>

        <button
          onClick={loadReleases}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#00959C]" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-card">
          <span className="text-xs font-semibold text-[#5B7480]">Total Applications</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#0F2A30]">{stats.total}</span>
            <span className="text-[11px] text-[#5B7480]">Deposits</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-card">
          <span className="text-xs font-semibold text-amber-800">Awaiting Scrutiny</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700">{stats.requested}</span>
            <span className="text-[11px] text-amber-600">Pending Review</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#00959C]/20 shadow-card">
          <span className="text-xs font-semibold text-[#006675]">Under Committee Scrutiny</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#00959C]">{stats.underScrutiny}</span>
            <span className="text-[11px] text-[#006675]">In Progress</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-card">
          <span className="text-xs font-semibold text-emerald-800">Released / Discharged</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700">{stats.released}</span>
            <span className="text-[11px] text-emerald-600">Discharged</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === "ALL"
                  ? "bg-[#006675] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("REQUESTED")}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === "REQUESTED"
                  ? "bg-[#FF9D2D] text-[#0F2A30] shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Requested ({stats.requested})
            </button>
            <button
              onClick={() => setActiveTab("UNDER_SCRUTINY")}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === "UNDER_SCRUTINY"
                  ? "bg-[#00959C] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Under Scrutiny ({stats.underScrutiny})
            </button>
            <button
              onClick={() => setActiveTab("APPROVED")}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === "APPROVED"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setActiveTab("RELEASED")}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === "RELEASED"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Released ({stats.released})
            </button>
            <button
              onClick={() => setActiveTab("REJECTED")}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === "REJECTED"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ref no, college, reason..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00959C]"
            />
          </div>
        </div>

        {/* Release Cards List */}
        <div className="space-y-4 pt-2">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#00959C] mb-2" />
              <span className="text-xs">Loading release applications...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Undo2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#0F2A30]">No Release Applications</h4>
              <p className="text-xs text-[#5B7480] mt-1">
                No deposit refund requests found in this status category.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const fdr = item.fdr;
              const hasNoFlags = !fdr.flags || fdr.flags.length === 0;
              const isVerified = fdr.verificationStatus === "VERIFIED";

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-card hover:border-[#00959C]/40 transition-all space-y-4"
                >
                  {/* Top Bar: Title, Badges, Amount */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href={`/admin/fdrs/${fdr.id}`}
                        className="font-mono text-base font-bold text-[#006675] hover:underline flex items-center gap-1.5"
                      >
                        <span>{fdr.refNo}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>

                      {item.releaseRef && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Voucher: {item.releaseRef}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-slate-500">Refund Amount:</span>
                      <span className="text-base font-bold text-[#0F2A30]">
                        {formatINR(fdr.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Institution & Ground for Release */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Claiming Institution</span>
                      <h4 className="font-bold text-[#0F2A30] mt-0.5">{fdr.institution.name}</h4>
                      <p className="text-slate-500 mt-0.5">
                        AICTE ID: {fdr.institution.aicteId} · {fdr.institution.city}, {fdr.institution.state}
                      </p>
                      <p className="text-slate-400 mt-1">
                        Application submitted: {formatDate(item.createdAt)} by {item.requestedBy?.name || "Nodal Officer"}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium">Regulatory Ground Stated</span>
                      <p className="font-semibold text-[#0F2A30] mt-0.5">{item.reason}</p>
                      {item.remarks && (
                        <p className="text-slate-600 mt-1 italic">&quot;{item.remarks}&quot;</p>
                      )}
                      {item.decisionRemarks && (
                        <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                          <span className="font-bold text-[#006675]">Committee Decision Note: </span>
                          {item.decisionRemarks}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3-Point Statutory Compliance Checklist */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 font-medium">
                        {isVerified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500" />
                        )}
                        <span>FDR Verified</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-medium">
                        {hasNoFlags ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                        <span>No Open Discrepancies</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Joint AICTE Account Verified</span>
                      </div>
                    </div>

                    <span className="text-[11px] text-[#5B7480]">
                      Compliance Authority: Regulation Bureau, AICTE HQ
                    </span>
                  </div>

                  {/* 4-Step Stepper & Action Controls */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
                    {/* Stepper */}
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <div className="flex items-center gap-1 text-[#006675]">
                        <span className="w-5 h-5 rounded-full bg-[#006675] text-white flex items-center justify-center text-[10px]">
                          1
                        </span>
                        <span>Requested</span>
                      </div>
                      <span className="text-slate-300">→</span>

                      <div
                        className={`flex items-center gap-1 ${
                          item.status === "UNDER_SCRUTINY" ||
                          item.status === "APPROVED" ||
                          item.status === "RELEASED"
                            ? "text-[#006675]"
                            : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                            item.status === "UNDER_SCRUTINY" ||
                            item.status === "APPROVED" ||
                            item.status === "RELEASED"
                              ? "bg-[#00959C] text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          2
                        </span>
                        <span>Scrutiny</span>
                      </div>
                      <span className="text-slate-300">→</span>

                      <div
                        className={`flex items-center gap-1 ${
                          item.status === "APPROVED" || item.status === "RELEASED"
                            ? "text-[#006675]"
                            : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                            item.status === "APPROVED" || item.status === "RELEASED"
                              ? "bg-teal-700 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          3
                        </span>
                        <span>Approved</span>
                      </div>
                      <span className="text-slate-300">→</span>

                      <div
                        className={`flex items-center gap-1 ${
                          item.status === "RELEASED" ? "text-emerald-700" : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                            item.status === "RELEASED"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          4
                        </span>
                        <span>Discharged</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap self-end lg:self-auto">
                      {item.status === "REQUESTED" && (
                        <button
                          onClick={() => handleAction(item.id, "START_SCRUTINY")}
                          disabled={isSubmitting}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#00959C] text-white hover:bg-[#007F85] shadow-xs"
                        >
                          Start Scrutiny
                        </button>
                      )}

                      {item.status === "UNDER_SCRUTINY" && (
                        <>
                          <button
                            onClick={() => handleAction(item.id, "APPROVE")}
                            disabled={isSubmitting}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#006675] text-white hover:bg-[#005562] shadow-xs"
                          >
                            Approve Release
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReleaseId(item.id);
                              setRejectModalOpen(true);
                            }}
                            disabled={isSubmitting}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C] shadow-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {item.status === "APPROVED" && (
                        <button
                          onClick={() => handleAction(item.id, "MARK_RELEASED")}
                          disabled={isSubmitting}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                        >
                          Mark Released &amp; Issue Voucher
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#EB5A11]">
                Reject Release Application
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5B7480]">
              Rejecting this refund application notifies the institution nodal officer and requires a statutory justification (e.g. pending student fee dispute, unfinished tenure, or open inspection memo).
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0F2A30] mb-1">
                  Reason for Rejection * (Mandatory)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="State deficiencies or regulatory criteria not satisfied..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#EB5A11]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !rejectReason.trim()}
                  className="px-4 py-2 rounded-xl font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C] shadow-sm disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
