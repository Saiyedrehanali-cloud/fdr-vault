"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  IndianRupee,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  FileCheck2,
  Building2,
  LockKeyhole,
  Check,
  ChevronRight,
} from "lucide-react";

export default function LoginPage() {
  const [role, setRole] = useState<"ADMIN" | "INSTITUTION">("ADMIN");
  const [email, setEmail] = useState("admin@aicte.demo");
  const [password, setPassword] = useState("Demo@1234");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      id: "admin",
      label: "AICTE Admin Officer",
      role: "ADMIN" as const,
      email: "admin@aicte.demo",
      badge: "Regulation Bureau",
      description: "Full oversight, scrutiny & verification",
    },
    {
      id: "senior",
      label: "Senior Bureau Advisor",
      role: "ADMIN" as const,
      email: "senior@aicte.demo",
      badge: "Escalation Authority",
      description: "Overdue escalation & audit integrity",
    },
    {
      id: "institution",
      label: "College Nodal Officer",
      role: "INSTITUTION" as const,
      email: "rgpv.college@demo.in",
      badge: "Demo Inst., Bhopal",
      description: "Deposit submission, renewal & release",
    },
  ];

  const handleSelectDemo = (acc: (typeof demoAccounts)[0]) => {
    setRole(acc.role);
    setEmail(acc.email);
    setPassword("Demo@1234");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error?.message || "Invalid credentials");
      }

      const userRole = data.data.user.role;
      const targetUrl =
        userRole === "ADMIN" || userRole === "SENIOR_ADMIN"
          ? "/admin"
          : "/portal";

      // Full navigation to ensure cookies and middleware take immediate effect
      window.location.href = targetUrl;
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] lg:overflow-hidden">
      {/* LEFT COLUMN: Premium Sunset-Wave Hero Banner */}
      <div className="lg:w-[48%] xl:w-[45%] bg-[#006675] relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-white overflow-hidden select-none">
        {/* Harmonious Palette Art Gradients (Orange -> Teal wave bands) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#006675] via-[#005562] to-[#0F2A30] z-0" />

        {/* Dynamic Curved Wave Bands (exact palette hexes) */}
        <svg
          className="absolute -right-24 -bottom-24 w-[600px] h-[600px] pointer-events-none opacity-25 mix-blend-screen"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 250C150 150 280 350 450 200V500H50V250Z"
            fill="#EB5A11"
          />
          <path
            d="M0 320C120 220 260 400 500 280V500H0V320Z"
            fill="#FF9D2D"
          />
          <path
            d="M0 380C140 310 240 450 500 360V500H0V380Z"
            fill="#4DC2C2"
          />
        </svg>

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-black/10">
              <Shield className="w-6 h-6 text-white stroke-[2.2]" />
              <IndianRupee className="absolute w-3.5 h-3.5 text-[#FF9D2D] stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold tracking-tight text-white">
                  FinMatrix
                </span>
                <span className="px-2 py-0.5 rounded-sm bg-[#FF9D2D] text-[#0F2A30] text-[10px] font-extrabold tracking-wider uppercase">
                  AICTE
                </span>
              </div>
              <p className="text-[11px] text-white/70 font-medium">
                Centralized Security Deposit & FDR Portal
              </p>
            </div>
          </div>

          <Link
            href="/pitch"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-[#FF9D2D] hover:text-white transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF9D2D]" />
            <span>SIH 2026 Pitch Deck →</span>
          </Link>
        </div>

        {/* Center Narrative & Value Props */}
        <div className="relative z-10 my-auto py-6 sm:py-8 space-y-5 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white/90">
            <span className="w-2 h-2 rounded-full bg-[#FF9D2D] animate-pulse" />
            <span>Ministry of Education · Technical Education Bureau</span>
          </div>

          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold font-display leading-[1.15] text-white">
            Every deposit. <br />
            <span className="text-[#FF9D2D]">Tracked.</span>{" "}
            <span className="text-[#4DC2C2]">Verified.</span> Secured.
          </h1>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Eliminating fragmented spreadsheets across hundreds of AICTE-approved institutions with instant dual-source bank confirmation, automated maturity escalation, and a tamper-evident audit trail.
          </p>

          {/* Key Differentiators Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[11px] font-bold text-[#FF9D2D] block uppercase tracking-wider">
                Dual-Source
              </span>
              <p className="text-[11px] text-white/80 mt-0.5">
                Submitted vs. Bank-Confirmed badges
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[11px] font-bold text-[#4DC2C2] block uppercase tracking-wider">
                HMAC Chain
              </span>
              <p className="text-[11px] text-white/80 mt-0.5">
                Tamper-evident audit log integrity
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[11px] font-bold text-[#F87C2B] block uppercase tracking-wider">
                Escalation
              </span>
              <p className="text-[11px] text-white/80 mt-0.5">
                90-60-30-15-7 day automated alerts
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Citation */}
        <div className="relative z-10 text-[11px] text-white/60 border-t border-white/10 pt-3 flex items-center justify-between">
          <span>Regulation Bureau · AICTE New Delhi</span>
          <span>Version 1.0 (Prototype)</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Elevated, Clean Login Interface */}
      <div className="lg:w-[52%] xl:w-[55%] flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-5">
          {/* Form Header */}
          <div className="text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#E0F5F5] text-[#006675] text-[11px] font-bold mb-2">
              <LockKeyhole className="w-3 h-3 text-[#00959C]" />
              Official Access Portal
            </div>
            <h2 className="text-2xl font-bold text-[#006675] tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-[#5B7480] mt-0.5">
              Authenticate via designated AICTE role or select an instant demo persona below.
            </p>
          </div>

          {/* Role Toggle Switch */}
          <div className="p-1 rounded-xl bg-[#F1F5F9] border border-slate-200 flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setRole("ADMIN");
                setEmail("admin@aicte.demo");
                setError(null);
              }}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                role === "ADMIN"
                  ? "bg-[#006675] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              AICTE Regulation Bureau
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("INSTITUTION");
                setEmail("rgpv.college@demo.in");
                setError(null);
              }}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                role === "INSTITUTION"
                  ? "bg-[#006675] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Institution Nodal Portal
            </button>
          </div>

          {/* 1-Click Instant Demo Personas */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5B7480] uppercase tracking-wider">
                1-Click Demo Profiles:
              </span>
              <span className="text-[10px] text-[#00959C] font-semibold">
                Click any to autofill
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {demoAccounts.map((acc, idx) => {
                const isSelected = email === acc.email;

                return (
                  <button
                    key={acc.id}
                    id={`demo-persona-${idx}`}
                    type="button"
                    onClick={() => handleSelectDemo(acc)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all ${
                      isSelected
                        ? "border-[#00959C] bg-[#E0F5F5]/60 text-[#006675] shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isSelected ? "bg-[#00959C]" : "bg-slate-300"
                        }`}
                      />
                      <div className="truncate">
                        <span className="font-bold block leading-tight text-[#0F2A30]">
                          {acc.label}
                        </span>
                        <span className="text-[11px] text-[#5B7480] truncate font-mono">
                          {acc.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-white text-[#006675] border border-slate-200/80 shadow-2xs">
                        {acc.badge}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#00959C]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            {error && (
              <div className="p-3 rounded-xl bg-[#FDE3D6] border border-[#EB5A11]/30 text-[#B2400A] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <ShieldAlert className="w-4 h-4 text-[#EB5A11] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#0F2A30] mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] focus:bg-white border border-slate-200 rounded-xl focus:border-[#00959C] focus:ring-2 focus:ring-[#00959C]/20 transition-all focus:outline-hidden text-[#0F2A30]"
                  placeholder="name@domain.gov.in"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#0F2A30]">
                  Password
                </label>
                <span className="text-[11px] text-[#5B7480]">
                  Default: <strong className="text-[#006675]">Demo@1234</strong>
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8FAFC] focus:bg-white border border-slate-200 rounded-xl focus:border-[#00959C] focus:ring-2 focus:ring-[#00959C]/20 transition-all focus:outline-hidden text-[#0F2A30]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#EB5A11] hover:bg-[#D44E0C] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75 focus:outline-hidden focus:ring-2 focus:ring-[#FF9D2D]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Session...</span>
                </div>
              ) : (
                <>
                  <span>Enter Security Deposit Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-[#5B7480]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00959C]" />
            <span>Encrypted with AES-256-GCM & HMAC-SHA256 Audit Chaining</span>
          </div>
        </div>
      </div>
    </div>
  );
}
