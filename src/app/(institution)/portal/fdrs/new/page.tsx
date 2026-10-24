"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  IndianRupee,
  Shield,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  X,
  File,
  RefreshCw,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

const POPULAR_BANKS = [
  "State Bank of India",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "HDFC Bank Ltd.",
  "ICICI Bank Ltd.",
  "Union Bank of India",
  "Bank of India",
  "Axis Bank",
  "Kotak Mahindra Bank",
];

function SubmitFdrContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const renewId = searchParams.get("renew") || searchParams.get("renewalOf");

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Renewal tracking
  const [renewalOfId, setRenewalOfId] = useState<string | null>(renewId);
  const [renewalRefNo, setRenewalRefNo] = useState<string | null>(null);

  // Form Fields
  const [refNo, setRefNo] = useState("");
  const [bankName, setBankName] = useState(POPULAR_BANKS[0]);
  const [customBank, setCustomBank] = useState("");
  const [branch, setBranch] = useState("");
  const [amount, setAmount] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [maturityDate, setMaturityDate] = useState("");
  const [purpose, setPurpose] = useState("New Course Approval Guarantee 2026-27");
  const [academicYear, setAcademicYear] = useState("2026-27");

  // Document Upload
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Declaration
  const [declaration, setDeclaration] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Prefill if renewing
  useEffect(() => {
    if (renewId) {
      fetch(`/api/fdrs/${renewId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.ok && json.data?.fdr) {
            const oldFdr = json.data.fdr;
            setRenewalRefNo(oldFdr.refNo);
            setRenewalOfId(oldFdr.id);
            if (POPULAR_BANKS.includes(oldFdr.bankName)) {
              setBankName(oldFdr.bankName);
            } else {
              setBankName("OTHER");
              setCustomBank(oldFdr.bankName);
            }
            setBranch(oldFdr.branch || "");
            setAmount(oldFdr.amount.toString());
            setPurpose(oldFdr.purpose || "Deposit Renewal Compliance");
            setAcademicYear(oldFdr.academicYear || "2026-27");
          }
        })
        .catch(() => {});
    }
  }, [renewId]);

  const effectiveBank = bankName === "OTHER" ? customBank : bankName;

  // Step 1 Validation
  const validateStep1 = () => {
    if (!refNo.trim()) return "FDR Reference Number is mandatory.";
    if (!effectiveBank.trim()) return "Bank Name is mandatory.";
    if (!branch.trim()) return "Branch details are mandatory.";
    if (!amount || parseFloat(amount) <= 0) return "Please enter a valid deposit amount.";
    if (!issueDate) return "Instrument Issue Date is mandatory.";
    if (!maturityDate) return "Maturity Date is mandatory.";
    if (new Date(maturityDate) <= new Date(issueDate)) {
      return "Maturity date must be after the issue date.";
    }
    return null;
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) {
      setSubmitError(err);
      return;
    }
    setSubmitError(null);
    setCurrentStep(2);
  };

  // Step 2 File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    validateAndSetFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    validateAndSetFile(dropped);
  };

  const validateAndSetFile = (f: File | undefined) => {
    setFileError(null);
    if (!f) return;

    if (!f.type.includes("pdf") && !f.name.endsWith(".pdf")) {
      setFileError("Only PDF documents are accepted.");
      return;
    }

    if (f.size > 10 * 1024 * 1024) {
      setFileError("File size exceeds 10MB limit.");
      return;
    }

    setFile(f);
  };

  // Step 3 Final Submission
  const handleSubmitFinal = async () => {
    if (!declaration) {
      setSubmitError("Please confirm statutory declaration checkbox before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("refNo", refNo.trim());
      formData.append("bankName", effectiveBank.trim());
      formData.append("branch", branch.trim());
      formData.append("amount", amount);
      formData.append("issueDate", issueDate);
      formData.append("maturityDate", maturityDate);
      formData.append("purpose", purpose);
      formData.append("academicYear", academicYear);

      if (renewalOfId) {
        formData.append("renewalOfId", renewalOfId);
      }

      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/fdrs", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to submit FDR record.");
      }

      // Redirect to newly created FDR detail view
      router.push(`/portal/fdrs/${json.data.fdr.id}?submitted=true`);
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Renewal Indicator Banner */}
      {renewalOfId && (
        <div className="p-4 rounded-2xl bg-[#E0F5F5] border border-[#00959C]/30 text-[#006675] flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-[#00959C] shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Renewing Security Deposit: </span>
            <span>
              This new submission is chained to previous instrument{" "}
              <strong className="font-mono">{renewalRefNo || renewalOfId}</strong>. Upon AICTE verification of this new deposit, the earlier deposit will automatically transition to <strong>RENEWED</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5B7480]">
          <Link href="/portal" className="hover:text-[#006675]">
            Institution Portal
          </Link>
          <span>/</span>
          <span className="text-[#006675]">Submit Fixed Deposit Receipt</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#006675] mt-1">
          {renewalOfId ? "Submit Renewal Deposit Receipt" : "Submit Fixed Deposit Receipt (FDR)"}
        </h1>
        <p className="text-xs sm:text-sm text-[#5B7480]">
          Upload financial compliance security deposits for AICTE approval scrutiny.
        </p>
      </div>

      {/* 3-Step Wizard Indicator */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card">
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

          {/* Step 1 */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 1
                  ? "bg-[#006675] text-white ring-4 ring-[#E0F5F5]"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              1
            </div>
            <span className="text-xs font-bold mt-1.5 text-[#006675]">
              Instrument Details
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 2
                  ? "bg-[#006675] text-white ring-4 ring-[#E0F5F5]"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              2
            </div>
            <span
              className={`text-xs font-bold mt-1.5 ${
                currentStep >= 2 ? "text-[#006675]" : "text-slate-400"
              }`}
            >
              Upload PDF
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep === 3
                  ? "bg-[#EB5A11] text-white ring-4 ring-[#FDE3D6]"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              3
            </div>
            <span
              className={`text-xs font-bold mt-1.5 ${
                currentStep === 3 ? "text-[#EB5A11]" : "text-slate-400"
              }`}
            >
              Review & Submit
            </span>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {submitError && (
        <div className="p-4 rounded-xl bg-[#FDE3D6] border border-[#EB5A11]/30 text-[#B2400A] text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#EB5A11] shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* STEP 1: Instrument Details */}
      {currentStep === 1 && (
        <form
          onSubmit={handleNextFromStep1}
          className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#006675]">
              Step 1: Fixed Deposit Instrument Specifications
            </h2>
            <p className="text-xs text-[#5B7480]">
              Enter the exact details as printed on the original bank receipt.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#0F2A30] mb-1">
                FDR Reference / Instrument Number *
              </label>
              <input
                type="text"
                required
                value={refNo}
                onChange={(e) => setRefNo(e.target.value.toUpperCase())}
                placeholder="e.g. FDR-SBI-2026-9912"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono uppercase bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#00959C] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A30] mb-1">
                Deposit Purpose
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Approval Security Deposit"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#00959C] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A30] mb-1">
                Issuing Scheduled Commercial Bank *
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#00959C] focus:bg-white focus:outline-hidden"
              >
                {POPULAR_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value="OTHER">Other Bank (Specify)</option>
              </select>

              {bankName === "OTHER" && (
                <input
                  type="text"
                  required
                  value={customBank}
                  onChange={(e) => setCustomBank(e.target.value)}
                  placeholder="Enter full legal bank name"
                  className="w-full mt-2 px-3.5 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-xl focus:outline-hidden"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A30] mb-1">
                Branch Location / IFSC *
              </label>
              <input
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. TT Nagar Branch, Bhopal"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#00959C] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A30] mb-1">
                Deposit Principal Amount (INR) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 2500000"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#00959C] focus:bg-white focus:outline-hidden"
                />
              </div>
              {amount && (
                <span className="text-[11px] text-[#006675] font-semibold mt-1 block">
                  Amount in Words: {formatINR(parseFloat(amount))}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A30] mb-1">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#00959C] focus:bg-white focus:outline-hidden"
              >
                <option value="2026-27">2026-27 (Current)</option>
                <option value="2027-28">2027-28</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A30] mb-1">
                Date of Issue *
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#00959C] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A30] mb-1">
                Maturity Date *
              </label>
              <input
                type="date"
                required
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#00959C] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#006675] text-white hover:bg-[#005562] shadow-sm transition-all"
            >
              <span>Next: Document Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Document Upload */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#006675]">
              Step 2: Upload Fixed Deposit Receipt (PDF)
            </h2>
            <p className="text-xs text-[#5B7480]">
              Upload a clear digital scan or e-FDR copy issued by the scheduled bank.
            </p>
          </div>

          {/* Drag & Drop Dropzone (04_UI_UX_DESIGN.md spec) */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragOver
                ? "border-[#EB5A11] bg-[#FDE3D6]/20"
                : file
                ? "border-[#00959C] bg-[#E0F5F5]/30"
                : "border-[#4DC2C2] bg-[#F0FBFB] hover:bg-[#E0F5F5]/40"
            }`}
          >
            <input
              type="file"
              id="fdr-file-input"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#E0F5F5] text-[#00959C] flex items-center justify-center">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-[#0F2A30]">{file.name}</div>
                <span className="text-xs text-[#5B7480]">
                  {(file.size / 1024).toFixed(1)} KB · PDF Document
                </span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="mt-2 text-xs font-semibold text-[#EB5A11] hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Remove & Replace
                </button>
              </div>
            ) : (
              <label htmlFor="fdr-file-input" className="cursor-pointer block space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E0F5F5] text-[#006675] flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-[#006675]">
                    Click to select file
                  </span>
                  <span className="text-sm text-[#5B7480]"> or drag and drop</span>
                </div>
                <p className="text-xs text-[#5B7480]">
                  Official Bank FDR copy in PDF format up to 10MB
                </p>
              </label>
            )}
          </div>

          {fileError && (
            <p className="text-xs font-bold text-[#EB5A11] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fileError}
            </p>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#5B7480] space-y-1">
            <span className="font-bold text-[#0F2A30] block">Security Assurance:</span>
            <span>
              All uploaded deposit certificates are encrypted using AES-256-GCM prior to storage and are never exposed via public URLs.
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!file) {
                  setFileError("Please attach the official FDR PDF receipt to proceed.");
                  return;
                }
                setCurrentStep(3);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#006675] text-white hover:bg-[#005562] shadow-sm transition-all"
            >
              <span>Next: Review & Declaration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Final Submission */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#006675]">
              Step 3: Review Submission & Statutory Declaration
            </h2>
            <p className="text-xs text-[#5B7480]">
              Verify that all instrument values correspond strictly to your bank certificate.
            </p>
          </div>

          {/* Summary Details Grid */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">FDR Reference</span>
              <span className="font-mono text-sm font-bold text-[#006675]">{refNo}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Principal Deposit Amount</span>
              <span className="text-sm font-bold text-[#0F2A30]">
                {formatINR(parseFloat(amount) || 0)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Bank & Branch</span>
              <span className="font-medium text-[#0F2A30]">
                {effectiveBank} ({branch})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Maturity Timeline</span>
              <span className="font-medium text-[#0F2A30]">
                {issueDate} $\rightarrow$ {maturityDate}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block font-semibold">Attached PDF</span>
              <span className="font-medium text-[#00959C] flex items-center gap-1.5 mt-0.5">
                <File className="w-3.5 h-3.5" />
                {file ? file.name : "Sample Receipt"}
              </span>
            </div>
          </div>

          {/* Statutory Declaration Checkbox */}
          <div className="p-4 rounded-2xl bg-[#E0F5F5]/60 border border-[#00959C]/30 flex items-start gap-3">
            <input
              type="checkbox"
              id="fdr-declaration"
              checked={declaration}
              onChange={(e) => setDeclaration(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#006675] border-slate-300 rounded-sm focus:ring-[#00959C]"
            />
            <label htmlFor="fdr-declaration" className="text-xs text-[#0F2A30] leading-relaxed select-none cursor-pointer">
              <strong>Statutory Declaration:</strong> I hereby certify that the Fixed Deposit Receipt submitted above has been created in joint name with the All India Council for Technical Education (AICTE) and represents an encumbrance-free security deposit. Any misrepresentation will attract immediate regulatory proceedings under AICTE Regulations.
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitFinal}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold bg-[#EB5A11] hover:bg-[#D44E0C] text-white shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-75 focus:outline-hidden focus:ring-2 focus:ring-[#FF9D2D]"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting to AICTE Registry...</span>
                </>
              ) : (
                <>
                  <span>Submit Deposit for Scrutiny</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubmitFdrPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-[#5B7480]">Loading submission wizard...</div>}>
      <SubmitFdrContent />
    </React.Suspense>
  );
}
