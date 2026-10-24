"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  IndianRupee,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Undo2,
  BellRing,
  LogOut,
  Menu,
  X,
  Building2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/portal", icon: LayoutDashboard },
    { label: "My FDR Repository", href: "/portal/fdrs", icon: FileText },
    { label: "Submit New FDR", href: "/portal/fdrs/new", icon: PlusCircle, isCta: true },
    { label: "Release / Refund", href: "/portal/releases", icon: Undo2 },
    { label: "Alerts", href: "/portal/alerts", icon: BellRing },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F2A30] flex flex-col">
      {/* Top Navbar for Institution */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 select-none shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-hidden"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link href="/portal" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#00959C] to-[#006675] shadow-xs">
                <Shield className="w-5 h-5 text-white stroke-[2.2]" />
                <IndianRupee className="absolute w-2.5 h-2.5 text-[#FF9D2D] stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-lg font-bold text-[#006675]">
                    FinMatrix
                  </span>
                  <span className="px-1.5 py-0.2 rounded-sm bg-[#00959C]/15 text-[#006675] text-[10px] font-bold uppercase tracking-wider">
                    Institution Portal
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-6">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/portal"
                    ? pathname === "/portal"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                      item.isCta
                        ? "bg-[#EB5A11] text-white hover:bg-[#D44E0C] shadow-xs ml-2"
                        : isActive
                        ? "bg-[#E0F5F5] text-[#006675]"
                        : "text-slate-600 hover:text-[#006675] hover:bg-slate-50"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header: College Profile & Switch Role */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#006675] bg-[#E0F5F5] hover:bg-[#00959C] hover:text-white rounded-lg transition-colors border border-[#00959C]/20"
              title="Switch to AICTE Admin view for SIH Hackathon Demo"
            >
              <span>Admin View</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 p-2 rounded-xl text-slate-600 hover:text-[#EB5A11] hover:bg-[#FDE3D6]/30 text-xs font-bold transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-display text-lg font-bold text-[#006675]">
                  FinMatrix Portal
                </span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors",
                      item.isCta
                        ? "bg-[#EB5A11] text-white my-2"
                        : pathname === item.href
                        ? "bg-[#E0F5F5] text-[#006675]"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-[#EB5A11] hover:bg-red-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
