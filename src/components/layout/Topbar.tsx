"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Command,
  Shield,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);
  const [liveUnreadCount, setLiveUnreadCount] = useState<number>(0);

  React.useEffect(() => {
    fetch("/api/alerts")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.data) {
          setLiveNotifications(json.data.items.slice(0, 5));
          setLiveUnreadCount(json.data.unreadCount);
        }
      })
      .catch(() => {});
  }, []);

  const sampleNotifications = [
    {
      id: "1",
      title: "Expiring FDR (Critical)",
      fdrNo: "FDR-PNB-2021-9921",
      institution: "Delhi Engineering College",
      time: "25 min ago",
      severity: "CRITICAL",
    },
    {
      id: "2",
      title: "New FDR Submission Pending",
      fdrNo: "FDR-SBI-2024-1049",
      institution: "National Institute of Tech, Jaipur",
      time: "1 hour ago",
      severity: "WARNING",
    },
    {
      id: "3",
      title: "Discrepancy Reported by Bank API",
      fdrNo: "FDR-HDFC-2023-4412",
      institution: "Bhopal Institute of Management",
      time: "3 hours ago",
      severity: "CRITICAL",
    },
  ];

  const displayList = liveNotifications.length > 0 ? liveNotifications : sampleNotifications;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200 select-none">
      {/* Left: Mobile Hamburger & Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-hidden"
          aria-label="Open sidebar drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Box (⌘K style) */}
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FDR number, college, bank, or AICTE ID... (Ctrl+K)"
            className="w-full pl-9 pr-12 py-2 text-xs md:text-sm bg-[#F8FAFC] hover:bg-slate-100/80 focus:bg-white text-[#0F2A30] placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#00959C] focus:ring-2 focus:ring-[#00959C]/20 transition-all focus:outline-hidden"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-sm shadow-2xs">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls: Role Badge, Alert Bell, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Role Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E0F5F5] border border-[#00959C]/30 text-[#006675] text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-[#00959C]" />
          <span>AICTE Admin</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setUserMenuOpen(false);
            }}
            className={cn(
              "relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-hidden",
              notificationsOpen && "bg-slate-100 text-slate-900"
            )}
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {/* Burnt Orange Count Dot (04_UI_UX_DESIGN.md spec) */}
            {liveUnreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#EB5A11] text-white text-[10px] font-bold ring-2 ring-white">
                {liveUnreadCount > 99 ? "99+" : liveUnreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <span className="text-sm font-bold text-[#006675]">
                  Active Security Alerts
                </span>
                <Link
                  href="/admin/alerts"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-semibold text-[#00959C] hover:underline"
                >
                  View all alerts
                </Link>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {displayList.map((notif: any) => (
                  <Link
                    key={notif.id}
                    href="/admin/alerts"
                    onClick={() => setNotificationsOpen(false)}
                    className="block px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          "w-2 h-2 mt-1.5 rounded-full shrink-0",
                          notif.severity === "CRITICAL"
                            ? "bg-[#EB5A11]"
                            : notif.severity === "HIGH"
                            ? "bg-[#F87C2B]"
                            : "bg-[#FF9D2D]"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0F2A30]">
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-[#5B7480] truncate">
                          {notif.fdr ? notif.fdr.refNo : notif.fdrNo || "AICTE Compliance"} {notif.message ? `· ${notif.message}` : ""}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 inline-block">
                          {notif.time || (notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : "Just now")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <span className="text-[11px] text-[#5B7480]">
                  Automated scan runs hourly · AICTE Regulation Bureau
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-hidden"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#006675] text-white font-bold text-xs shadow-xs ring-2 ring-[#006675]/20">
              RS
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#0F2A30] leading-none">
                Dr. R. Sharma
              </span>
              <span className="text-[10px] text-[#5B7480] mt-0.5">
                Head Scrutiny Officer
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-[#0F2A30]">
                  Dr. Rajesh Sharma
                </p>
                <p className="text-[11px] text-[#5B7480] truncate">
                  admin@aicte.demo
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#006675]"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  Alert & System Settings
                </Link>
                <Link
                  href="/portal"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#006675]"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  Switch to College View (Demo)
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    window.location.href = "/admin";
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-semibold text-[#EB5A11] hover:bg-[#FDE3D6]/40"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
