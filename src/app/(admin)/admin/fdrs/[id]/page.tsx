"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Building2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronRight,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  File,
  History,
  Lock,
  ArrowRight,
  Sparkles,
  X,
  Send,
} from "lucide-react";
import { StatusBadge, SourceBadge } from "@/components/ui/Badge";
import { formatINR, formatDate, getMaturitySeverity } from "@/lib/utils";

export default function FdrDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fdrId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timeline" | "bank" | "flags" | "remarks" | "audit">("timeline");
  
  // Verification action states
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [bankResultMsg, setBankResultMsg] = useState<string | null>(null);

  const [discrepancyModalOpen, setDiscrepancyModalOpen] = useState(false);
  const [discrepancyReason, setDiscrepancyReason] = useState("");
  const [remarkText, setRemarkText] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const loadFdrDetail = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/fdrs/${fdrId}`);
      const json = await res.json();
      if (json.ok) {
        setData(json.data);
      }
    } catch (e) {
      console.error("Failed to load FDR detail:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fdrId) loadFdrDetail();
  }, [fdrId]);

  // Live Bank Verification Action via Mock Bank Adapter
  const handleVerifyWithBank = async () => {
    setIsVerifyingBank(true);
    setBankResultMsg(null);
    try {
      const res = await fetch(`/api/fdrs/${fdrId}/verify-bank`, { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setBankResultMsg(json.message);
        loadFdrDetail();
      } else {
        setBankResultMsg(json.error || "Bank verification failed");
      }
    } catch (e) {
      setBankResultMsg("Bank Verification system timeout.");
    } finally {
      setIsVerifyingBank(false);
    }
  };

  const handleMarkVerified = async () => {
    if (!confirm("Confirm marking this FDR as VERIFIED by AICTE?")) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`/api/fdrs/${fdrId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: remarkText }),
      });
      const json = await res.json();
      if (json.ok) {
        setBankResultMsg("FDR marked as VERIFIED. Audit trail and institution notifications updated.");
        loadFdrDetail();
      } else {
        alert(json.error || "Failed to mark as verified");
      }
    } catch (e) {
      alert("Error marking as verified");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleFlagDiscrepancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discrepancyReason.trim()) {
      alert("Please provide a reason for the discrepancy.");
      return;
    }
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`/api/fdrs/${fdrId}/discrepancy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: discrepancyReason }),
      });
      const json = await res.json();
      if (json.ok) {
        setDiscrepancyModalOpen(false);
        setDiscrepancyReason("");
        setBankResultMsg("Discrepancy recorded. High-priority alert dispatched to institution.");
        loadFdrDetail();
      } else {
        alert(json.error || "Failed to flag discrepancy");
      }
    } catch (e) {
      alert("Error flagging discrepancy");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkText.trim()) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`/api/fdrs/${fdrId}/remarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: remarkText }),
      });
      const json = await res.json();
      if (json.ok) {
        setRemarkText("");
        loadFdrDetail();
      } else {
        alert(json.error || "Failed to add remark");
      }
    } catch (e) {
      alert("Error adding remark");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-white rounded-2xl border border-slate-200" />
          <div className="h-96 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-[#006675]">Record Not Found</h3>
        <p className="text-xs text-[#5B7480] mt-1 mb-4">
          The requested Fixed Deposit Receipt ID does not exist in the repository.
        </p>
        <Link
          href="/admin/fdrs"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#006675] text-white"
        >
          Return to All FDRs
        </Link>
      </div>
    );
  }

  const { fdr, institution, documents, flags, bankChecks, remarks, auditLogs } = data;
  const primaryDoc = documents && documents.length > 0 ? documents[0] : null;
  const maturitySeverity = getMaturitySeverity(fdr.daysToMaturity);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5B7480]">
          <Link href="/admin/fdrs" className="hover:text-[#006675]">
            All FDRs
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-[#006675]">{fdr.refNo}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-2">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-[#006675]">
                {fdr.refNo}
              </h1>
              <StatusBadge status={fdr.verificationStatus} />
              <SourceBadge source={fdr.source} />
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${maturitySeverity.bg} ${maturitySeverity.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${maturitySeverity.dot}`} />
                {maturitySeverity.label}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5B7480] mt-1">
              {institution.name} (AICTE ID: {institution.aicteId}) · {institution.city}, {institution.state}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {primaryDoc && (
              <a
                href={`/api/documents/${primaryDoc.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-[#00959C] text-[#006675] bg-white hover:bg-[#E0F5F5] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#00959C]" />
                <span>Download PDF</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bank API Action Alert Banner */}
      {bankResultMsg && (
        <div className="p-3.5 rounded-xl bg-[#E0F5F5] border border-[#00959C]/30 text-[#006675] text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00959C]" />
            <span>{bankResultMsg}</span>
          </div>
          <button
            onClick={() => setBankResultMsg(null)}
            className="text-[#006675]/80 hover:underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SPLIT VIEW: Left = Data Card, Right = Document PDF Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Instrument Details Card with Dual-Source Badges */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#006675]">
                Deposit Instrument Specifications
              </h3>
              <span className="text-[11px] text-[#5B7480]">
                Submitted vs. Bank-Confirmed Fields
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2 text-xs">
              {/* Ref No */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Instrument / FDR No.</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#0F2A30] text-sm">
                    {fdr.refNo}
                  </span>
                  <SourceBadge source={fdr.source} />
                </div>
              </div>

              {/* Amount */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Principal Amount</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0F2A30] text-sm">
                    {formatINR(fdr.amount)}
                  </span>
                  <SourceBadge source={fdr.source} />
                </div>
              </div>

              {/* Bank Name */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Issuing Bank</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0F2A30]">{fdr.bankName}</span>
                  <SourceBadge source={fdr.source} />
                </div>
              </div>

              {/* Branch */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Branch Location</span>
                <span className="font-medium text-[#0F2A30]">{fdr.branch}</span>
              </div>

              {/* Issue Date */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Date of Issue</span>
                <span className="font-medium text-[#0F2A30]">{formatDate(fdr.issueDate)}</span>
              </div>

              {/* Maturity Date */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Maturity Date</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0F2A30]">{formatDate(fdr.maturityDate)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${maturitySeverity.bg} ${maturitySeverity.text}`}>
                    {fdr.daysToMaturity}d left
                  </span>
                </div>
              </div>

              {/* Purpose */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Deposit Purpose</span>
                <span className="font-medium text-[#0F2A30]">{fdr.purpose}</span>
              </div>

              {/* Academic Year */}
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Academic Year</span>
                <span className="font-medium text-[#0F2A30]">{fdr.academicYear}</span>
              </div>
            </div>
          </div>

          <div className="p-3 mt-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-[#5B7480]">
            <span>Nodal Officer: {institution.nodalOfficer}</span>
            <span>Phone: {institution.phone || "—"}</span>
          </div>
        </div>

        {/* Right: PDF Document Viewer */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-[#006675]" />
                <h3 className="text-base font-bold text-[#006675]">
                  Encrypted Digital Certificate Viewer
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E0F5F5] text-[#006675] font-bold">
                AES-256-GCM
              </span>
            </div>

            {primaryDoc ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#5B7480] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-[#0F2A30] truncate max-w-[240px]">
                    {primaryDoc.fileName}
                  </span>
                  <span>{(primaryDoc.sizeBytes / 1024).toFixed(1)} KB · Version {primaryDoc.version}</span>
                </div>

                {/* PDF Viewer Container */}
                <div className="w-full h-80 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 relative">
                  <iframe
                    src={`/api/documents/${primaryDoc.id}#toolbar=0`}
                    title="FDR Document Viewer"
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-4">
                <ShieldAlert className="w-10 h-10 text-amber-500 mb-2" />
                <h4 className="text-sm font-bold text-[#0F2A30]">No PDF Attached</h4>
                <p className="text-xs text-[#5B7480] max-w-xs mt-1">
                  The institution has not uploaded a digital copy of this receipt. An advisory discrepancy flag has been raised.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Served securely via /api/documents/:id</span>
            <span>Zero public exposure</span>
          </div>
        </div>
      </div>

      {/* TABS: Timeline, Bank Checks, Advisory Flags, Remarks, Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-5 py-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "timeline"
                ? "border-[#EB5A11] text-[#EB5A11] bg-orange-50/20"
                : "border-transparent text-slate-600 hover:text-[#006675]"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Workflow Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab("flags")}
            className={`px-5 py-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "flags"
                ? "border-[#EB5A11] text-[#EB5A11] bg-orange-50/20"
                : "border-transparent text-slate-600 hover:text-[#006675]"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Advisory Flags ({flags?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("bank")}
            className={`px-5 py-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "bank"
                ? "border-[#EB5A11] text-[#EB5A11] bg-orange-50/20"
                : "border-transparent text-slate-600 hover:text-[#006675]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Bank Verification Log</span>
          </button>

          <button
            onClick={() => setActiveTab("remarks")}
            className={`px-5 py-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "remarks"
                ? "border-[#EB5A11] text-[#EB5A11] bg-orange-50/20"
                : "border-transparent text-slate-600 hover:text-[#006675]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Scrutiny Remarks ({remarks?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-5 py-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "audit"
                ? "border-[#EB5A11] text-[#EB5A11] bg-orange-50/20"
                : "border-transparent text-slate-600 hover:text-[#006675]"
            }`}
          >
            <History className="w-4 h-4" />
            <span>HMAC Audit Log</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#00959C] text-white flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <h4 className="text-xs font-bold text-[#0F2A30]">
                    Submitted by Institution Nodal Officer
                  </h4>
                  <p className="text-[11px] text-[#5B7480]">
                    Date: {formatDate(fdr.submittedAt)} · Initial automated rule checks executed.
                  </p>
                </div>

                <div className="relative">
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      fdr.verificationStatus !== "PENDING"
                        ? "bg-[#00959C] text-white"
                        : "bg-[#FF9D2D] text-white animate-pulse"
                    }`}
                  >
                    {fdr.verificationStatus !== "PENDING" ? "✓" : "○"}
                  </div>
                  <h4 className="text-xs font-bold text-[#0F2A30]">
                    Under Scrutiny by AICTE Regulation Bureau
                  </h4>
                  <p className="text-[11px] text-[#5B7480]">
                    Document inspection and core banking cross-check verification.
                  </p>
                </div>

                <div className="relative">
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      fdr.verificationStatus === "VERIFIED"
                        ? "bg-[#00959C] text-white"
                        : fdr.verificationStatus === "DISCREPANCY"
                        ? "bg-[#EB5A11] text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {fdr.verificationStatus === "VERIFIED"
                      ? "✓"
                      : fdr.verificationStatus === "DISCREPANCY"
                      ? "!"
                      : "○"}
                  </div>
                  <h4 className="text-xs font-bold text-[#0F2A30]">
                    Final Verification Determination
                  </h4>
                  <p className="text-[11px] text-[#5B7480]">
                    Current Status: <strong className="text-[#006675]">{fdr.verificationStatus}</strong>
                    {fdr.discrepancyReason && (
                      <span className="text-[#EB5A11] block mt-0.5 font-semibold">
                        Reason: {fdr.discrepancyReason}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Advisory Flags Tab */}
          {activeTab === "flags" && (
            <div className="space-y-3">
              {flags.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-[#00959C] mx-auto mb-2" />
                  <span>No advisory discrepancy flags detected. All rule checks passed.</span>
                </div>
              ) : (
                flags.map((flag: any) => (
                  <div
                    key={flag.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3"
                  >
                    <AlertTriangle
                      className={`w-5 h-5 mt-0.5 shrink-0 ${
                        flag.severity === "HIGH" ? "text-[#EB5A11]" : "text-[#FF9D2D]"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#0F2A30]">
                          {flag.code}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-md font-bold bg-[#FDE3D6] text-[#B2400A]">
                          {flag.severity} SEVERITY
                        </span>
                      </div>
                      <p className="text-xs text-[#5B7480] mt-1">{flag.message}</p>
                      {flag.evidence && (
                        <span className="text-[11px] text-slate-500 font-mono block mt-1">
                          Evidence: {flag.evidence}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Bank Checks Tab */}
          {activeTab === "bank" && (
            <div className="space-y-4">
              {bankChecks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <span>No bank API confirmation logs recorded yet. Click "Verify with Bank" below.</span>
                </div>
              ) : (
                bankChecks.map((check: any) => (
                  <div key={check.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F2A30]">Adapter: {check.source}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          check.status === "MATCH" ? "bg-[#E0F5F5] text-[#006675]" : "bg-[#FDE3D6] text-[#B2400A]"
                        }`}>
                          {check.status}
                        </span>
                      </div>
                      <span className="text-slate-400">{formatDate(check.checkedAt)}</span>
                    </div>
                    {check.confirmedJson && (
                      <pre className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700 overflow-x-auto">
                        {JSON.stringify(JSON.parse(check.confirmedJson), null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Remarks Tab */}
          {activeTab === "remarks" && (
            <div className="space-y-4">
              {/* Add Remark Form */}
              <form onSubmit={handleAddRemark} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-[#006675]">
                  Add Scrutiny Remark / Compliance Note
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    placeholder="Enter official observation, deficiency memo reference, or verification comment..."
                    rows={2}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00959C]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingAction || !remarkText.trim()}
                    className="self-end px-4 py-2 rounded-xl text-xs font-bold bg-[#006675] text-white hover:bg-[#005562] disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </form>

              {remarks.length === 0 ? (
                <p className="text-xs text-slate-400">No scrutiny remarks recorded yet.</p>
              ) : (
                remarks.map((r: any) => (
                  <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#006675]">
                      <span>{r.author.name} ({r.author.role})</span>
                      <span className="text-slate-400 font-normal">{formatDate(r.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-[#0F2A30]">{r.text}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Audit Tab */}
          {activeTab === "audit" && (
            <div className="space-y-3">
              <div className="text-xs text-[#5B7480] mb-2">
                Tamper-evident HMAC-SHA256 audit trail entries linked to this deposit instrument.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-500 font-bold">
                    <tr>
                      <th className="py-2 px-3">Action</th>
                      <th className="py-2 px-3">Actor</th>
                      <th className="py-2 px-3">Timestamp</th>
                      <th className="py-2 px-3 font-mono">HMAC Hash (Short)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((a: any) => (
                      <tr key={a.id}>
                        <td className="py-2.5 px-3 font-bold text-[#006675]">{a.action}</td>
                        <td className="py-2.5 px-3">{a.actorName}</td>
                        <td className="py-2.5 px-3 text-slate-500">{formatDate(a.createdAt)}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{a.hash.substring(0, 16)}...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STICKY ACTION BAR FOR AICTE ADMIN (doc 04 spec) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3.5 px-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-[#5B7480]">
            <span className="font-semibold text-[#0F2A30]">Regulatory Authority Action Bar:</span>
            <span>Automated checks are advisory; human authorization required.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleVerifyWithBank}
              disabled={isVerifyingBank}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#00959C] text-white hover:bg-[#007F85] shadow-xs disabled:opacity-75"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingBank ? "animate-spin" : ""}`} />
              <span>{isVerifyingBank ? "Calling Core Bank API..." : "Verify with Bank"}</span>
            </button>

            <button
              type="button"
              onClick={handleMarkVerified}
              disabled={isSubmittingAction || fdr.verificationStatus === "VERIFIED"}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#006675] text-white hover:bg-[#005562] shadow-xs disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4 text-[#4DC2C2]" />
              <span>{fdr.verificationStatus === "VERIFIED" ? "Verified ✓" : "Mark Verified"}</span>
            </button>

            <button
              type="button"
              onClick={() => setDiscrepancyModalOpen(true)}
              disabled={isSubmittingAction}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C] shadow-xs"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Flag Discrepancy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flag Discrepancy Modal */}
      {discrepancyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#EB5A11]">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-[#0F2A30]">
                  Flag Regulatory Discrepancy
                </h3>
              </div>
              <button
                onClick={() => setDiscrepancyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5B7480]">
              Flagging a discrepancy halts approval, updates the deposit status to <strong>DISCREPANCY</strong>, creates a tamper-evident audit log entry, and immediately alerts the nodal officer at <strong>{institution.name}</strong>.
            </p>

            <form onSubmit={handleFlagDiscrepancySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0F2A30] mb-1">
                  Official Justification / Reason * (Mandatory)
                </label>
                <textarea
                  value={discrepancyReason}
                  onChange={(e) => setDiscrepancyReason(e.target.value)}
                  placeholder="Specify divergence (e.g., Shortfall of ₹5 Lakhs from statutory requirement; Missing Joint Account endorsement with AICTE New Delhi; Expired tenure)..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#EB5A11]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDiscrepancyModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction || !discrepancyReason.trim()}
                  className="px-4 py-2 rounded-xl font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C] shadow-sm disabled:opacity-50"
                >
                  {isSubmittingAction ? "Flagging..." : "Confirm & Flag Discrepancy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
