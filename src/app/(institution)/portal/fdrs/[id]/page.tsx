"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Calendar,
  IndianRupee,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  File,
  History,
  Lock,
  ArrowRight,
  Send,
  Building2,
  X,
  FileCheck,
} from "lucide-react";
import { StatusBadge, SourceBadge } from "@/components/ui/Badge";
import { formatINR, formatDate, getMaturitySeverity } from "@/lib/utils";

export default function PortalFdrDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fdrId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timeline" | "flags" | "remarks" | "release">("timeline");

  // Release Request Modal state
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [releaseReason, setReleaseReason] = useState("APPROVAL_COMPLETED");
  const [releaseRemarks, setReleaseRemarks] = useState("");
  const [isSubmittingRelease, setIsSubmittingRelease] = useState(false);
  const [releaseSuccessMsg, setReleaseSuccessMsg] = useState<string | null>(null);

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

  const handleRequestRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRelease(true);
    try {
      const res = await fetch(`/api/portal/releases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fdrId,
          reason: releaseReason,
          remarks: releaseRemarks,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setReleaseSuccessMsg("Release request submitted successfully. AICTE Scrutiny Committee has been notified.");
        setReleaseModalOpen(false);
        loadFdrDetail();
      } else {
        alert(json.error || "Failed to submit release request");
      }
    } catch (err) {
      alert("Error submitting release request");
    } finally {
      setIsSubmittingRelease(false);
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
          The requested Fixed Deposit Receipt ID does not exist or does not belong to your institution.
        </p>
        <Link
          href="/portal/fdrs"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#006675] text-white"
        >
          Return to My FDRs
        </Link>
      </div>
    );
  }

  const { fdr, institution, documents, flags, bankChecks, remarks, releaseRequest } = data;
  const primaryDoc = documents && documents.length > 0 ? documents[0] : null;
  const maturitySeverity = getMaturitySeverity(fdr.daysToMaturity);

  const canRequestRelease =
    fdr.verificationStatus === "VERIFIED" &&
    fdr.lifecycleStatus !== "RELEASED" &&
    !releaseRequest;

  const isExpiringOrMatured =
    fdr.lifecycleStatus === "EXPIRING_SOON" ||
    fdr.lifecycleStatus === "MATURED" ||
    fdr.daysToMaturity <= 60;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5B7480]">
          <Link href="/portal/fdrs" className="hover:text-[#006675]">
            My FDRs
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
                {maturitySeverity.label} ({fdr.daysToMaturity}d)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5B7480] mt-1">
              {institution.name} (AICTE ID: {institution.aicteId}) · Submitted on {formatDate(fdr.submittedAt)}
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

            {isExpiringOrMatured && (
              <Link
                href={`/portal/fdrs/new?renew=${fdr.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C] shadow-sm transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Renew Deposit</span>
              </Link>
            )}

            {canRequestRelease && (
              <button
                onClick={() => setReleaseModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#006675] text-white hover:bg-[#005562] shadow-sm transition-colors"
              >
                <FileCheck className="w-3.5 h-3.5 text-[#4DC2C2]" />
                <span>Request Release / Refund</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Discrepancy Callout Alert if any */}
      {fdr.verificationStatus === "DISCREPANCY" && (
        <div className="p-4 rounded-2xl bg-[#FDE3D6] border border-[#EB5A11]/30 text-[#0F2A30] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#EB5A11] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#EB5A11]">
                Discrepancy Flagged by AICTE Scrutiny Committee
              </h4>
              <p className="text-xs text-slate-700 mt-0.5">
                One or more instrument parameters do not match core records or statutory requirements. Please review the Advisory Flags tab below and submit a rectified certificate.
              </p>
            </div>
          </div>
          <Link
            href={`/portal/fdrs/new?rectify=${fdr.id}`}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C] whitespace-nowrap self-start sm:self-center"
          >
            Submit Rectification
          </Link>
        </div>
      )}

      {/* Success Banner */}
      {releaseSuccessMsg && (
        <div className="p-4 rounded-xl bg-[#E0F5F5] border border-[#00959C]/30 text-[#006675] text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00959C]" />
            <span>{releaseSuccessMsg}</span>
          </div>
          <button
            onClick={() => setReleaseSuccessMsg(null)}
            className="text-[#006675]/80 hover:underline"
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
                Deposit Instrument Details
              </h3>
              <span className="text-[11px] text-[#5B7480]">
                Submitted vs Verified Specifications
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

              {/* Issuing Bank */}
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
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${maturitySeverity.bg} ${maturitySeverity.text}`}
                  >
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
            <span>Regulatory Authority: AICTE New Delhi</span>
            <span>Joint Account Clause: Mandatory Verified</span>
          </div>
        </div>

        {/* Right: PDF Document Viewer */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-[#006675]" />
                <h3 className="text-base font-bold text-[#006675]">
                  Attached FDR Certificate
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E0F5F5] text-[#006675] font-bold">
                AES-256-GCM Encrypted
              </span>
            </div>

            {primaryDoc ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#5B7480] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-[#0F2A30] truncate max-w-[240px]">
                    {primaryDoc.fileName}
                  </span>
                  <span>
                    {(primaryDoc.sizeBytes / 1024).toFixed(1)} KB · Version {primaryDoc.version}
                  </span>
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
                <h4 className="text-sm font-bold text-[#0F2A30]">No Certificate Uploaded</h4>
                <p className="text-xs text-[#5B7480] max-w-xs mt-1">
                  Upload a scanned copy of the Fixed Deposit Receipt for AICTE verification.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Served securely via /api/documents/:id</span>
            <span>Authorized Institution Access</span>
          </div>
        </div>
      </div>

      {/* TABS: Timeline, Advisory Flags, AICTE Remarks, Release Status */}
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
            onClick={() => setActiveTab("remarks")}
            className={`px-5 py-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "remarks"
                ? "border-[#EB5A11] text-[#EB5A11] bg-orange-50/20"
                : "border-transparent text-slate-600 hover:text-[#006675]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AICTE Communications ({remarks?.length || 0})</span>
          </button>

          {releaseRequest && (
            <button
              onClick={() => setActiveTab("release")}
              className={`px-5 py-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "release"
                  ? "border-[#EB5A11] text-[#EB5A11] bg-orange-50/20"
                  : "border-transparent text-slate-600 hover:text-[#006675]"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Release Status Tracker</span>
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {/* Step 1: Submission */}
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#00959C] text-white flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <h4 className="text-xs font-bold text-[#0F2A30]">
                    Submitted by Institution
                  </h4>
                  <p className="text-[11px] text-[#5B7480]">
                    Date: {formatDate(fdr.submittedAt)} · Instrument registered on FDR Vault.
                  </p>
                </div>

                {/* Step 2: Verification */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${
                      fdr.verificationStatus === "VERIFIED"
                        ? "bg-[#00959C]"
                        : fdr.verificationStatus === "DISCREPANCY"
                        ? "bg-[#EB5A11]"
                        : "bg-[#FF9D2D]"
                    }`}
                  >
                    {fdr.verificationStatus === "VERIFIED"
                      ? "✓"
                      : fdr.verificationStatus === "DISCREPANCY"
                      ? "!"
                      : "•"}
                  </div>
                  <h4 className="text-xs font-bold text-[#0F2A30]">
                    AICTE Verification & Bank Cross-Check
                  </h4>
                  <p className="text-[11px] text-[#5B7480]">
                    Status: <span className="font-semibold">{fdr.verificationStatus}</span>
                    {fdr.verifiedAt && ` · Verified on ${formatDate(fdr.verifiedAt)}`}
                  </p>
                </div>

                {/* Step 3: Lifecycle Maturity */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${
                      fdr.lifecycleStatus === "RELEASED"
                        ? "bg-[#006675]"
                        : fdr.lifecycleStatus === "RENEWED"
                        ? "bg-[#4DC2C2]"
                        : "bg-slate-300"
                    }`}
                  >
                    {fdr.lifecycleStatus === "RELEASED" || fdr.lifecycleStatus === "RENEWED" ? "✓" : "3"}
                  </div>
                  <h4 className="text-xs font-bold text-[#0F2A30]">
                    Maturity / Lifecycle State
                  </h4>
                  <p className="text-[11px] text-[#5B7480]">
                    Maturity Date: {formatDate(fdr.maturityDate)} · Lifecycle: {fdr.lifecycleStatus}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Flags Tab */}
          {activeTab === "flags" && (
            <div className="space-y-4">
              {flags.length === 0 ? (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-teal-50 border border-teal-100 text-[#006675] text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#00959C]" />
                  <span>No discrepancies detected. Instrument complies with AICTE deposit guidelines.</span>
                </div>
              ) : (
                flags.map((f: any) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between text-xs gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F2A30]">{f.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            f.severity === "HIGH"
                              ? "bg-red-100 text-red-700"
                              : f.severity === "MEDIUM"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {f.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{f.reason}</p>
                      {f.evidence && (
                        <p className="text-slate-400 font-mono text-[11px] mt-1">
                          Evidence: {f.evidence}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Remarks Tab */}
          {activeTab === "remarks" && (
            <div className="space-y-4">
              {remarks.length === 0 ? (
                <p className="text-xs text-slate-400">No communications or notes recorded yet.</p>
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

          {/* Release Status Tracker Tab */}
          {activeTab === "release" && releaseRequest && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#006675]">Release Application No.</span>
                  <span className="font-mono text-xs font-bold text-[#0F2A30]">{releaseRequest.id.substring(0, 8)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Reason Stated:</span>
                  <span className="font-semibold text-[#0F2A30]">{releaseRequest.reason}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E0F5F5] text-[#006675]">
                    {releaseRequest.status}
                  </span>
                </div>
                {releaseRequest.remarks && (
                  <p className="text-xs text-slate-600 border-t border-slate-200 pt-2">
                    Remarks: {releaseRequest.remarks}
                  </p>
                )}
              </div>

              {/* 4-Step Stepper Tracker */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-[#E0F5F5] text-[#006675] font-bold border border-[#00959C]">
                  1. Requested
                </div>
                <div
                  className={`p-3 rounded-xl font-bold border ${
                    releaseRequest.status === "UNDER_SCRUTINY" ||
                    releaseRequest.status === "APPROVED" ||
                    releaseRequest.status === "RELEASED"
                      ? "bg-[#E0F5F5] text-[#006675] border-[#00959C]"
                      : "bg-slate-50 text-slate-400 border-slate-200"
                  }`}
                >
                  2. Under Scrutiny
                </div>
                <div
                  className={`p-3 rounded-xl font-bold border ${
                    releaseRequest.status === "APPROVED" || releaseRequest.status === "RELEASED"
                      ? "bg-[#E0F5F5] text-[#006675] border-[#00959C]"
                      : "bg-slate-50 text-slate-400 border-slate-200"
                  }`}
                >
                  3. Approved
                </div>
                <div
                  className={`p-3 rounded-xl font-bold border ${
                    releaseRequest.status === "RELEASED"
                      ? "bg-[#006675] text-white border-[#006675]"
                      : "bg-slate-50 text-slate-400 border-slate-200"
                  }`}
                >
                  4. Released
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Release Request Modal */}
      {releaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#006675]">
                Request FDR Release & Refund
              </h3>
              <button
                onClick={() => setReleaseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestRelease} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Instrument:</span> {fdr.refNo} ({formatINR(fdr.amount)})
              </div>

              <div>
                <label className="block font-bold text-[#0F2A30] mb-1">
                  Reason for Release / Refund Request *
                </label>
                <select
                  value={releaseReason}
                  onChange={(e) => setReleaseReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9D2D]"
                  required
                >
                  <option value="APPROVAL_COMPLETED">AICTE Mandatory Affiliation Period Completed (e.g., 8-10 Years)</option>
                  <option value="COURSE_CLOSURE">Program or Course Closure (NOC Granted)</option>
                  <option value="REPLACEMENT_DEPOSIT">Substituted by Replacement Guarantee / FDR</option>
                  <option value="INSTITUTION_MERGER">Institutional Restructuring / Merger</option>
                  <option value="OTHER">Other Regulatory Grounds</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#0F2A30] mb-1">
                  Institutional Justification / Remarks *
                </label>
                <textarea
                  value={releaseRemarks}
                  onChange={(e) => setReleaseRemarks(e.target.value)}
                  placeholder="Detail grounds for refund, council resolution numbers, or compliance status..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9D2D]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReleaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRelease}
                  className="px-4 py-2 rounded-xl font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C] shadow-sm disabled:opacity-50"
                >
                  {isSubmittingRelease ? "Submitting..." : "Submit Release Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
