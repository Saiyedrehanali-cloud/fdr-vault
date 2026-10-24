"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Bell,
  Lock,
  Database,
  Save,
  CheckCircle2,
  RefreshCw,
  Server,
  KeyRound,
  AlertTriangle,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [thresholds, setThresholds] = useState<number[]>([90, 60, 30, 15, 7]);
  const [escalateAfterDays, setEscalateAfterDays] = useState(7);
  const [enabled, setEnabled] = useState(true);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.ok) {
        const expiringRule = json.data.rules?.find((r: any) => r.type === "EXPIRING");
        if (expiringRule) {
          setThresholds(JSON.parse(expiringRule.thresholdsJson));
          setEscalateAfterDays(expiringRule.escalateAfterDays);
          setEnabled(expiringRule.enabled);
        }
        setSystemInfo(json.data.system);
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thresholds,
          escalateAfterDays,
          enabled,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setSaveSuccessMsg("Configuration saved successfully. System alert engine updated.");
      } else {
        alert(json.error || "Failed to save settings");
      }
    } catch (e) {
      alert("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00959C]">
          <Settings className="w-4 h-4" />
          <span>Regulatory Bureau Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#006675] tracking-tight mt-0.5">
          System Settings &amp; Security Controls
        </h1>
        <p className="text-xs sm:text-sm text-[#5B7480] mt-1">
          Configure automated maturity alert thresholds, senior administrative escalations, cryptographic verification seals, and core banking simulators.
        </p>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form: Alert Rule Thresholds */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#006675]">
            <Bell className="w-5 h-5 text-[#00959C]" />
            <h2 className="text-base font-bold">Maturity Countdown &amp; Escalation Engine</h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#E0F5F5] text-[#006675]">
            Statutory AICTE Norms
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#0F2A30] mb-1">
              Maturity Notification Threshold Windows (Days Prior to Expiry)
            </label>
            <p className="text-slate-500 mb-2">
              Automated notifications are dispatched to institutional nodal officers at these specific milestone intervals.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {thresholds.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-mono font-bold text-[#006675]"
                >
                  <span>{t} Days</span>
                </div>
              ))}
              <span className="text-[11px] text-slate-400 italic">
                (Standardized 90-60-30-15-7 countdown matrix)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold text-[#0F2A30] mb-1">
                Senior Admin Escalation Threshold (Days Overdue)
              </label>
              <p className="text-slate-500 mb-1.5">
                Matured deposits with no renewal submitted will trigger critical priority alerts directly to Senior Administration.
              </p>
              <input
                type="number"
                min="1"
                max="30"
                value={escalateAfterDays}
                onChange={(e) => setEscalateAfterDays(parseInt(e.target.value || "7", 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00959C]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0F2A30] mb-1">
                Automated Background Surveillance Engine
              </label>
              <p className="text-slate-500 mb-1.5">
                Enable idempotent daily cron scans across all active deposit records in the repository.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    enabled ? "bg-[#00959C]" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="font-semibold text-slate-700">
                  {enabled ? "Active & Scanning" : "Disabled (Manual Triggers Only)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C] shadow-sm disabled:opacity-50 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving Configuration..." : "Save Parameters"}</span>
          </button>
        </div>
      </form>

      {/* Cryptographic Architecture Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#006675]">
            <KeyRound className="w-5 h-5 text-[#00959C]" />
            <h2 className="text-base font-bold">Cryptographic Security Enclave Status</h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-500">Document Encryption at Rest</span>
            <p className="font-mono font-bold text-[#0F2A30]">AES-256-GCM (Authenticated Encryption)</p>
            <p className="text-[11px] text-slate-500">
              PDF blobs encrypted outside public web root with 12-byte IV and 16-byte authentication tag.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-500">Non-Repudiation Audit Seal</span>
            <p className="font-mono font-bold text-[#0F2A30]">HMAC-SHA256 Chained Hash Graph</p>
            <p className="text-[11px] text-slate-500">
              Every deposit approval and scrutiny remark links to the predecessor record hash.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-500">Authentication &amp; Session</span>
            <p className="font-mono font-bold text-[#0F2A30]">Encrypted Stateless JWT Cookie</p>
            <p className="text-[11px] text-slate-500">
              HTTP-only, SameSite strict, RBAC-enforced via Next.js middleware guards.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-500">Scheduled Commercial Bank Simulator</span>
            <p className="font-mono font-bold text-[#0F2A30]">Mock Core Banking System (CBS API)</p>
            <p className="text-[11px] text-slate-500">
              Active adapters configured for SBI, PNB, Canara Bank, Bank of Baroda, HDFC, and ICICI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
