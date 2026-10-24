"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  CheckCheck,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function PortalAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/alerts`);
      const json = await res.json();
      if (json.ok) {
        setAlerts(json.data.items);
        setUnreadCount(json.data.unreadCount);
      }
    } catch (e) {
      console.error("Failed to load alerts:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkRead = async (alertId: string) => {
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });
      const json = await res.json();
      if (json.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error("Mark read error:", e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_ALL_READ" }),
      });
      const json = await res.json();
      if (json.ok) {
        setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error("Mark all read error:", e);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return {
          bar: "bg-[#EB5A11]",
          badge: "bg-[#FDE3D6] text-[#EB5A11] border-[#EB5A11]/30",
          icon: Flame,
        };
      case "HIGH":
        return {
          bar: "bg-[#F87C2B]",
          badge: "bg-[#FEF0E6] text-[#F87C2B] border-[#F87C2B]/30",
          icon: AlertTriangle,
        };
      case "WARNING":
        return {
          bar: "bg-[#FF9D2D]",
          badge: "bg-[#FFF6EB] text-[#B26A00] border-[#FF9D2D]/30",
          icon: Clock,
        };
      default:
        return {
          bar: "bg-[#00959C]",
          badge: "bg-[#E0F5F5] text-[#006675] border-[#00959C]/30",
          icon: AlertCircle,
        };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#00959C]">
            <Bell className="w-4 h-4" />
            <span>AICTE Compliance Notifications</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#006675] tracking-tight">
              My Alerts &amp; Action Notices
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EB5A11] text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#5B7480] mt-1">
            Important notices concerning your institution&apos;s security deposits, upcoming renewal deadlines, and AICTE scrutiny observations.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#00959C]" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#00959C] mb-2" />
            <span className="text-xs">Loading compliance notices...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-card">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-[#00959C] flex items-center justify-center mx-auto mb-2 text-xl">
              ✓
            </div>
            <h4 className="text-sm font-bold text-[#0F2A30]">No Compliance Notices</h4>
            <p className="text-xs text-[#5B7480] mt-1">
              All your institution&apos;s deposits are in compliance with no pending alerts.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const styling = getSeverityBadge(alert.severity);
            const IconComp = styling.icon;

            return (
              <div
                key={alert.id}
                className={`relative overflow-hidden rounded-2xl border transition-all p-4 ${
                  alert.isRead
                    ? "bg-white/70 border-slate-200 opacity-80"
                    : "bg-white border-slate-300 shadow-card"
                }`}
              >
                {/* Left indicator bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${styling.bar}`}
                />

                <div className="pl-2 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styling.badge}`}
                      >
                        <IconComp className="w-3 h-3" />
                        <span>{alert.severity}</span>
                      </span>

                      <span className="text-[11px] text-slate-400">
                        {formatDate(alert.createdAt)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0F2A30] mt-1">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {alert.message}
                    </p>
                  </div>

                  {/* Actions on right */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {alert.fdr && (
                      <Link
                        href={`/portal/fdrs/${alert.fdr.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#006675] bg-[#E0F5F5] hover:bg-[#00959C] hover:text-white transition-colors"
                      >
                        <span className="font-mono">{alert.fdr.refNo}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}

                    {!alert.isRead && (
                      <button
                        onClick={() => handleMarkRead(alert.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-[#006675] hover:bg-slate-100 transition-colors"
                      >
                        Mark read
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
  );
}
