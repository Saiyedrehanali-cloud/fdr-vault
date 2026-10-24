"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  ShieldCheck,
  Undo2,
  BellRing,
  BarChart3,
  ScrollText,
  Settings,
  LogOut,
  X,
  Shield,
  IndianRupee,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Institutions",
      href: "/admin/institutions",
      icon: Building2,
      badge: null,
    },
    {
      label: "All FDRs",
      href: "/admin/fdrs",
      icon: FileText,
      badge: null,
    },
    {
      label: "Verification",
      href: "/admin/verification",
      icon: ShieldCheck,
      badge: "9",
      badgeColor: "bg-[#FF9D2D] text-[#0F2A30]",
    },
    {
      label: "Release Requests",
      href: "/admin/releases",
      icon: Undo2,
      badge: "3",
      badgeColor: "bg-[#4DC2C2] text-[#006675]",
    },
    {
      label: "Alerts",
      href: "/admin/alerts",
      icon: BellRing,
      badge: "5",
      badgeColor: "bg-[#EB5A11] text-white",
    },
    {
      label: "Reports",
      href: "/admin/reports",
      icon: BarChart3,
      badge: null,
    },
    {
      label: "Audit Trail",
      href: "/admin/audit",
      icon: ScrollText,
      badge: null,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
      badge: null,
    },
    {
      label: "Pitch Deck",
      href: "/pitch",
      icon: Sparkles,
      badge: "SIH '26",
      badgeColor: "bg-[#FF9D2D] text-[#0F2A30]",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-[260px] bg-[#006675] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top Logo Block */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <Link
            href="/admin"
            className="flex items-center gap-3 group focus:outline-hidden"
            onClick={onClose}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#00959C] to-[#006675] shadow-md border border-white/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white stroke-[2.2]" />
              <IndianRupee className="absolute w-3 h-3 text-[#FF9D2D] stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl font-bold tracking-tight text-white leading-tight">
                  FinMatrix
                </span>
                <span className="px-1.5 py-0.2 rounded-sm bg-[#FF9D2D] text-[#0F2A30] text-[10px] font-extrabold tracking-wider uppercase">
                  AICTE
                </span>
              </div>
              <span className="text-[11px] text-white/70 tracking-wide font-medium">
                Security Deposit Portal
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 lg:hidden focus:outline-hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Sidebar Navigation">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-white/50">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-white/15 text-white font-semibold shadow-xs"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {/* 3px Active Indicator Bar (doc 04 spec) */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3.5px] rounded-r-md bg-[#FF9D2D]"
                    aria-hidden="true"
                  />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4.5 h-4.5 transition-colors",
                      isActive
                        ? "text-[#FF9D2D]"
                        : "text-white/70 group-hover:text-white"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-xs font-bold rounded-full shadow-xs",
                      item.badgeColor
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Decorative Wave + User Card */}
        <div className="relative p-4 border-t border-white/10 overflow-hidden bg-black/10">
          {/* Decorative wave background echoing brand palette */}
          <svg
            className="absolute -right-6 -bottom-6 w-36 h-28 pointer-events-none opacity-15"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 100C40 120 70 80 110 110C150 140 180 110 200 130V200H0V100Z"
              fill="#FF9D2D"
            />
            <path
              d="M0 130C30 140 80 110 120 140C160 170 180 140 200 160V200H0V130Z"
              fill="#4DC2C2"
            />
          </svg>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00959C] text-white font-bold text-xs border border-white/30 shadow-xs">
                AD
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">
                  Dr. Rajesh Sharma
                </span>
                <span className="text-[11px] text-white/70 leading-tight">
                  AICTE Admin Officer
                </span>
              </div>
            </div>

            <button
              type="button"
              title="Logout session"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-hidden"
              onClick={() => {
                // To be wired with auth in next phase
                window.location.href = "/admin";
              }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
