"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  ShieldCheck,
  ShieldAlert,
  Lock,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Code2,
  X,
  FileCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Chain Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  // Selected Log for Payload Modal
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (actionFilter !== "ALL") params.set("action", actionFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/audit?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setLogs(json.data.items);
        setTotalCount(json.data.totalCount);
      }
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch("/api/audit/verify");
      const json = await res.json();
      if (json.ok) {
        setVerifyResult(json.data);
      } else {
        setVerifyResult({ ok: false, error: json.error || "Verification failed" });
      }
    } catch (e) {
      setVerifyResult({ ok: false, error: "Network timeout while recomputing HMAC chain" });
    } finally {
      setIsVerifying(false);
    }
  };

  // Live Jury Demo Tamper Handler
  const [tamperMsg, setTamperMsg] = useState<string | null>(null);
  const [isTampering, setIsTampering] = useState(false);

  const handleTamperSimulation = async (action: "TAMPER" | "RESTORE") => {
    setIsTampering(true);
    setTamperMsg(null);
    try {
      const res = await fetch("/api/audit/tamper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.ok) {
        setTamperMsg(json.message);
        loadLogs();
        // Automatically re-verify to show result immediately
        const verifyRes = await fetch("/api/audit/verify");
        const verifyJson = await verifyRes.json();
        if (verifyJson.ok) {
          setVerifyResult(verifyJson.data);
        }
      } else {
        alert(json.error || "Action failed");
      }
    } catch (e) {
      alert("Tamper demo execution failed");
    } finally {
      setIsTampering(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q) ||
      (log.actor?.name && log.actor.name.toLowerCase().includes(q)) ||
      log.hash.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#00959C]">
            <History className="w-4 h-4" />
            <span>Cryptographic Proof of Non-Repudiation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#006675] tracking-tight mt-0.5">
            Tamper-Evident Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-[#5B7480] mt-1">
            Every state mutation, verification approval, discrepancy flag, and PDF view is cryptographically linked in an immutable HMAC-SHA256 hash chain.
          </p>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={isVerifying}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#006675] text-white hover:bg-[#005562] shadow-sm disabled:opacity-75 transition-all self-start sm:self-auto"
        >
          <Lock className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : "text-[#4DC2C2]"}`} />
          <span>{isVerifying ? "Recomputing Hashes..." : "Verify Chain Integrity"}</span>
        </button>
      </div>

      {/* JURY DEMONSTRATION WIDGET (Doc 07 §2 T13 spec) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9D2D] text-[#0F2A30]">
              Jury Live Demonstration
            </span>
            <span className="text-xs font-bold text-teal-300">
              Scenario T13: Zero-Trust Tamper Detection Test
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Simulate a rogue database administrator executing a direct SQL injection override on an audit record to bypass verification. Watch our HMAC-SHA256 integrity verifier catch the anomaly in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleTamperSimulation("TAMPER")}
            disabled={isTampering}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C] shadow-sm disabled:opacity-50 transition-colors"
          >
            {isTampering ? "Simulating..." : "Simulate DB Tampering"}
          </button>
          <button
            onClick={() => handleTamperSimulation("RESTORE")}
            disabled={isTampering}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#00959C] text-white hover:bg-[#007F85] shadow-sm disabled:opacity-50 transition-colors"
          >
            Restore Chain
          </button>
        </div>
      </div>

      {tamperMsg && (
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between">
          <span>{tamperMsg}</span>
          <button onClick={() => setTamperMsg(null)} className="text-slate-500 hover:text-slate-800">
            Dismiss
          </button>
        </div>
      )}

      {/* Verification Result Banner */}
      {verifyResult && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
            verifyResult.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-start gap-3">
            {verifyResult.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#EB5A11] shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-bold">
                {verifyResult.ok
                  ? `Cryptographic Audit Chain Intact: ${verifyResult.totalChecked} Records Verified`
                  : "Tampering Detected in Audit Log Chain!"}
              </h4>
              <p className="text-xs mt-0.5">
                {verifyResult.ok
                  ? "All HMAC-SHA256 signatures match genesis chain. Zero payload modifications, reordering, or record injections detected."
                  : verifyResult.error || `Broken hash link identified at index ${verifyResult.brokenAtIndex}.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setVerifyResult(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500">Filter Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00959C]"
            >
              <option value="ALL">All Actions ({totalCount})</option>
              <option value="FDR_SUBMITTED">FDR Submitted</option>
              <option value="FDR_VERIFIED">FDR Verified</option>
              <option value="DISCREPANCY_FLAGGED">Discrepancy Flagged</option>
              <option value="BANK_VERIFICATION_MATCHED">Bank Verification Matched</option>
              <option value="BANK_VERIFICATION_MISMATCH">Bank Verification Mismatch</option>
              <option value="RELEASE_REQUESTED">Release Requested</option>
              <option value="RELEASE_APPROVED">Release Approved</option>
              <option value="FDR_RELEASED">FDR Released</option>
              <option value="DOCUMENT_VIEWED">Document Viewed</option>
            </select>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action, actor, hash..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00959C]"
            />
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[#5B7480] font-bold">
                <th className="py-3 px-3">Node #</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Actor &amp; Role</th>
                <th className="py-3 px-3">Action Performed</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-3">Payload Data</th>
                <th className="py-3 px-3 font-mono">Previous Hash</th>
                <th className="py-3 px-3 font-mono">Current HMAC Seal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#00959C]" />
                      <span>Loading audit chain...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No audit records match your search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-400">
                      #{log.id}
                    </td>

                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#0F2A30]">
                        {log.actor?.name || "System Automated Engine"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {log.actor?.role || "SYSTEM_DAEMON"}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-[#006675] font-mono text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                      {log.entity}:{log.entityId ? log.entityId.substring(0, 8) : "—"}
                    </td>

                    <td className="py-3 px-3">
                      {log.payload ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-[#E0F5F5] hover:text-[#006675] transition-colors"
                        >
                          <Code2 className="w-3 h-3" />
                          <span>View JSON</span>
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {log.prevHash.substring(0, 10)}...
                    </td>

                    <td className="py-3 px-3 font-mono font-semibold text-[#00959C] text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-[#00959C]" />
                        <span>{log.hash.substring(0, 12)}...</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#006675]">
                  Audit Log Node #{selectedLog.id} Payload
                </h3>
                <span className="text-xs text-slate-400 font-mono">{selectedLog.action}</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-teal-300 rounded-xl text-xs font-mono overflow-x-auto max-h-80">
              {JSON.stringify(JSON.parse(selectedLog.payload || "{}"), null, 2)}
            </pre>

            <div className="text-[11px] text-slate-400 space-y-1 font-mono pt-2 border-t border-slate-100">
              <div>HMAC: {selectedLog.hash}</div>
              <div>Prev: {selectedLog.prevHash}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
