"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  Building2,
  FileText,
  AlertTriangle,
  Lock,
  Clock,
  History,
  CheckCircle2,
  ExternalLink,
  Flame,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sparkles,
  Play,
  Layers,
} from "lucide-react";

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = 8;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F2A30] text-slate-100 flex flex-col justify-between selection:bg-[#FF9D2D] selection:text-[#0F2A30]">
      {/* Top Deck Navigation Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-teal-900/50 bg-[#0A1F24]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#006675] to-[#00959C] flex items-center justify-center font-bold text-white shadow-sm border border-teal-400/30">
            ₹
          </div>
          <div>
            <span className="font-heading font-bold text-sm tracking-wide text-white">
              FinMatrix
            </span>
            <span className="text-[11px] text-teal-400/80 ml-2 font-mono">
              SIH 2026 · PS SIH26265
            </span>
          </div>
        </div>

        {/* Slide Tracker */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-slate-400">
            Slide <strong className="text-white">{currentSlide + 1}</strong> of {totalSlides}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="p-1.5 rounded-lg bg-teal-950/60 border border-teal-800/50 text-slate-300 hover:text-white hover:bg-teal-900/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))}
              disabled={currentSlide === totalSlides - 1}
              className="p-1.5 rounded-lg bg-teal-950/60 border border-teal-800/50 text-slate-300 hover:text-white hover:bg-teal-900/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EB5A11] text-white hover:bg-[#D44E0C] transition-all shadow-sm"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Live Prototype</span>
          </Link>
        </div>
      </header>

      {/* Main Slide Content Canvas */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 max-w-6xl w-full mx-auto">
        {/* SLIDE 1: Title & Problem Statement Hook */}
        {currentSlide === 0 && (
          <div className="space-y-8 text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-900/40 border border-teal-500/30 text-teal-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9D2D]" />
              <span>Smart India Hackathon 2026 · Problem Statement SIH26265</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-white tracking-tight">
                FinMatrix
              </h1>
              <p className="text-xl sm:text-2xl font-light text-teal-200">
                Streamline of Security Deposit &amp; Fixed Deposit Receipt Management
              </p>
              <p className="text-sm sm:text-base text-slate-400 font-mono">
                Ministry of Education · All India Council for Technical Education (AICTE)
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-teal-950/40 border border-teal-800/40 max-w-2xl mx-auto shadow-2xl backdrop-blur-sm">
              <p className="text-lg font-serif italic text-amber-200">
                &ldquo;Every deposit. Tracked. Verified. Secured.&rdquo;
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Transitioning AICTE from fragmented regional spreadsheets to an automated, tamper-evident dual-source clearinghouse.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setCurrentSlide(1)}
                className="px-6 py-3 rounded-2xl text-sm font-bold bg-[#00959C] text-white hover:bg-[#007F85] transition-all shadow-lg flex items-center gap-2"
              >
                <span>Explore The Solution</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 2: Problem Understanding */}
        {currentSlide === 1 && (
          <div className="space-y-6 w-full animate-fade-in">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#FF9D2D] uppercase tracking-wider">
                Problem Understanding
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
                The Excel Nightmare in Institutional Deposits
              </h2>
              <p className="text-sm text-slate-400">
                AICTE oversees thousands of colleges pledging ₹5L–₹50L security deposits. Manual spreadsheet tracking introduces catastrophic systemic risks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-rose-900/50 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-950 text-[#EB5A11] flex items-center justify-center font-bold">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Zero Early Warning</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deposits mature silently without notice. When an institution defaults or closes, AICTE discovers the deposit expired years ago with zero recovery leverage.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-900/50 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-950 text-[#FF9D2D] flex items-center justify-center font-bold">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Verification Blind Spot</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Council officers cannot distinguish between what the institution claims and what the issuing bank holds in their Core Banking System (CBS).
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-teal-900/50 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-950 text-[#00959C] flex items-center justify-center font-bold">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Non-Repudiation Failure</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Spreadsheet cells can be silently overwritten or deleted. No tamper-evident cryptographic audit trail exists to hold actors legally accountable.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: Proposed Solution */}
        {currentSlide === 2 && (
          <div className="space-y-6 w-full animate-fade-in">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#FF9D2D] uppercase tracking-wider">
                Proposed Solution
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
                FinMatrix: 4 Architectural Pillars
              </h2>
              <p className="text-sm text-slate-400">
                A purpose-built, high-assurance regulatory clearinghouse engineered for AICTE and affiliated institutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-5 rounded-2xl bg-teal-950/40 border border-teal-800/40 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-teal-900/60 text-teal-300 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">1. Dual-Source Verification</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Every instrument parameter clearly displays <span className="text-slate-400 font-bold">Submitted</span> vs <span className="text-teal-400 font-bold">Bank-Confirmed</span> vs <span className="text-orange-400 font-bold">Mismatch</span> badges. Integrated with Core Banking System (CBS) APIs.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-teal-950/40 border border-teal-800/40 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-teal-900/60 text-[#FF9D2D] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">2. 5-Horizon Alert Watchdog</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Idempotent surveillance tracking 90d, 60d, 30d, 15d, and 7d countdown horizons. Overdue defaults automatically escalate directly to Senior Administration.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-teal-950/40 border border-teal-800/40 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-teal-900/60 text-emerald-400 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">3. AES-256-GCM Document Enclave</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Digital FDR certificates encrypted at rest outside the web root. Served via authenticated streaming route with mandatory tenancy checks and view audit logging.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-teal-950/40 border border-teal-800/40 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-teal-900/60 text-purple-300 shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">4. HMAC-SHA256 Audit Graph</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Every state mutation extends a cryptographically chained hash graph from genesis. 1-click verification catches any direct database manipulation in real time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: 100% PS Coverage Matrix */}
        {currentSlide === 3 && (
          <div className="space-y-5 w-full animate-fade-in">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#FF9D2D] uppercase tracking-wider">
                Compliance Verification
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                PS SIH26265 Requirements: 100% 1-to-1 Mapping
              </h2>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-teal-900/60 bg-slate-900/90 max-h-[460px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-teal-950 text-teal-300 font-bold border-b border-teal-800/50 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">PS Capability Stated</th>
                    <th className="py-2.5 px-3">FinMatrix Implementation</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-950 text-slate-300">
                  <tr>
                    <td className="py-2 px-3 font-mono text-teal-400">1</td>
                    <td className="py-2 px-3 font-semibold text-white">Centralized Repository</td>
                    <td className="py-2 px-3">90 realistic FDRs, 40 institutions, multi-filter query bar</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">100% Done ✓</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-teal-400">2</td>
                    <td className="py-2 px-3 font-semibold text-white">Digital Document Management</td>
                    <td className="py-2 px-3">AES-256-GCM encryption at rest + secure iframe viewer</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">100% Done ✓</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-teal-400">3</td>
                    <td className="py-2 px-3 font-semibold text-white">Verification &amp; Discrepancy</td>
                    <td className="py-2 px-3">Rule engine (6 codes) + Mock CBS Finacle/BaNCS adapter</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">100% Done ✓</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-teal-400">4</td>
                    <td className="py-2 px-3 font-semibold text-white">Validity &amp; Maturity Tracking</td>
                    <td className="py-2 px-3">Dynamic severity color chips (Green, Yellow, Orange, Red)</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">100% Done ✓</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-teal-400">5</td>
                    <td className="py-2 px-3 font-semibold text-white">Renewal / Replacement</td>
                    <td className="py-2 px-3">Chained parent-child prefill (`oldFDR -&gt; newFDR`)</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">100% Done ✓</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-teal-400">6</td>
                    <td className="py-2 px-3 font-semibold text-white">Release &amp; Refund Workflow</td>
                    <td className="py-2 px-3">4-stage stepper + 3-point checklist + discharge vouchers</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">100% Done ✓</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-teal-400">7</td>
                    <td className="py-2 px-3 font-semibold text-white">Alerts &amp; Escalation</td>
                    <td className="py-2 px-3">90/60/30/15/7 day intervals + Senior Admin escalations</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">100% Done ✓</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-teal-400">8</td>
                    <td className="py-2 px-3 font-semibold text-white">Dashboard &amp; Reports</td>
                    <td className="py-2 px-3">4 KPI cards, Recharts timeline, 6 CSV statutory exports</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">100% Done ✓</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-teal-400">9</td>
                    <td className="py-2 px-3 font-semibold text-white">Audit &amp; Access Control</td>
                    <td className="py-2 px-3">HMAC-SHA256 hash graph + live integrity verification + RBAC</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">100% Done ✓</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-teal-400">10</td>
                    <td className="py-2 px-3 font-semibold text-white">Integration &amp; Security</td>
                    <td className="py-2 px-3">REST APIs, stateless encrypted JWT, zero public exposure</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">100% Done ✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SLIDE 5: Key Technical Innovations */}
        {currentSlide === 4 && (
          <div className="space-y-6 w-full animate-fade-in">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#FF9D2D] uppercase tracking-wider">
                Innovation &amp; Differentiators
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
                What Makes FinMatrix Stand Out
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-5 rounded-2xl bg-slate-900 border border-teal-800/40 space-y-2">
                <span className="text-xs font-mono font-bold text-[#FF9D2D]">INNOVATION #1</span>
                <h3 className="text-base font-bold text-white">Dual-Source Truth Presentation</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Unlike traditional systems that blindly trust uploaded scans, FinMatrix treats institution submissions as unverified claims until cross-examined against core banking systems.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-teal-800/40 space-y-2">
                <span className="text-xs font-mono font-bold text-[#FF9D2D]">INNOVATION #2</span>
                <h3 className="text-base font-bold text-white">Zero-Trust Cryptographic Non-Repudiation</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Even if a malicious insider directly alters SQLite/PostgreSQL rows via raw SQL, the recomputed HMAC-SHA256 signature immediately halts verification and flags the exact record number.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-teal-800/40 space-y-2">
                <span className="text-xs font-mono font-bold text-[#FF9D2D]">INNOVATION #3</span>
                <h3 className="text-base font-bold text-white">Dynamic Institutional Risk Profiling</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Calculates institutional health scores (0-100) combining deposit deficit, overdue history, and open flags, allowing AICTE to prioritize compliance audits intelligently.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-teal-800/40 space-y-2">
                <span className="text-xs font-mono font-bold text-[#FF9D2D]">INNOVATION #4</span>
                <h3 className="text-base font-bold text-white">Automated Senior Admin Escalation Ladder</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Overdue deposits with no renewal action automatically break through routine queues and land on executive bureau desks with red priority indicators.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: Quantified Impact & Metrics */}
        {currentSlide === 5 && (
          <div className="space-y-6 w-full animate-fade-in text-center max-w-4xl mx-auto">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#FF9D2D] uppercase tracking-wider">
                Measurable Impact
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
                Transforming AICTE Operations
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="p-6 rounded-2xl bg-teal-950/50 border border-teal-800/50 space-y-2">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#4DC2C2]">
                  100%
                </span>
                <p className="text-xs font-bold text-white">Spreadsheet Elimination</p>
                <p className="text-[11px] text-slate-400">Zero unversioned Excel tracking across 8 regions</p>
              </div>

              <div className="p-6 rounded-2xl bg-teal-950/50 border border-teal-800/50 space-y-2">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#FF9D2D]">
                  &lt; 48h
                </span>
                <p className="text-xs font-bold text-white">Verification SLA</p>
                <p className="text-[11px] text-slate-400">Down from 7+ working days in manual process</p>
              </div>

              <div className="p-6 rounded-2xl bg-teal-950/50 border border-teal-800/50 space-y-2">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                  0
                </span>
                <p className="text-xs font-bold text-white">Unnoticed Expiries</p>
                <p className="text-[11px] text-slate-400">100% of deposits alerted ≥90 days in advance</p>
              </div>

              <div className="p-6 rounded-2xl bg-teal-950/50 border border-teal-800/50 space-y-2">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#EB5A11]">
                  100%
                </span>
                <p className="text-xs font-bold text-white">Non-Repudiation</p>
                <p className="text-[11px] text-slate-400">Cryptographically sealed HMAC audit chain</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 max-w-xl mx-auto">
              Total Managed Guarantee in Seed Repository: <strong className="text-white font-mono">₹25.05 Crores</strong> across 40 technical institutes.
            </div>
          </div>
        )}

        {/* SLIDE 7: Future Roadmap */}
        {currentSlide === 6 && (
          <div className="space-y-6 w-full animate-fade-in">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#FF9D2D] uppercase tracking-wider">
                Production Roadmap
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
                Scalability &amp; Enterprise Integration Path
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-teal-800/40 space-y-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-900 text-teal-300">
                  PHASE 1 (COMPLETED)
                </span>
                <h3 className="text-base font-bold text-white">Functional Working Prototype</h3>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                  <li>Full Next.js 14 App Router UI</li>
                  <li>AES-256-GCM encrypted enclave</li>
                  <li>Mock CBS banking adapter</li>
                  <li>HMAC-SHA256 audit graph</li>
                  <li>90-60-30-15-7 alert engine</li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-teal-800/40 space-y-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-900 text-amber-300">
                  PHASE 2 (NEXT 90 DAYS)
                </span>
                <h3 className="text-base font-bold text-white">Production Scale</h3>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                  <li>PostgreSQL + Read Replicas</li>
                  <li>MinIO / S3 Encrypted Buckets</li>
                  <li>Direct Finacle / BaNCS Core Banking API integration with SBI, PNB</li>
                  <li>AICTE Single Sign-On (SSO)</li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-teal-800/40 space-y-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-900 text-purple-300">
                  PHASE 3 (SMART AUTOMATION)
                </span>
                <h3 className="text-base font-bold text-white">AI / OCR Forgery Defense</h3>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                  <li>OCR extraction of paper certificates</li>
                  <li>AI stamp and signature tamper detection</li>
                  <li>National e-FDR switch integration (NeSL/RBI electronic receipts)</li>
                  <li>Automated SMS/WhatsApp nodal alerts</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 8: Live Demonstration Launchpad */}
        {currentSlide === 7 && (
          <div className="space-y-8 text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full End-to-End Prototype Running Live</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
                Ready for Jury Live Demonstration
              </h2>
              <p className="text-base text-slate-300 max-w-xl mx-auto">
                Select any view below to launch directly into the live application with pre-seeded demo records and test scenarios.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
              <Link
                href="/admin"
                className="p-5 rounded-2xl bg-teal-950/60 border border-teal-700/50 hover:border-teal-400 hover:bg-teal-900/60 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400">DEMO A</span>
                  <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-white mt-2">Admin Command Center</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  KPI cards, Recharts maturity graph, and priority scrutiny queue.
                </p>
              </Link>

              <Link
                href="/admin/verification"
                className="p-5 rounded-2xl bg-teal-950/60 border border-teal-700/50 hover:border-teal-400 hover:bg-teal-900/60 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400">DEMO B</span>
                  <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-white mt-2">Verification &amp; Bank API</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  SLA ageing chips, split-screen PDF viewer, and live bank MATCH/MISMATCH checks.
                </p>
              </Link>

              <Link
                href="/admin/audit"
                className="p-5 rounded-2xl bg-teal-950/60 border border-teal-700/50 hover:border-teal-400 hover:bg-teal-900/60 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400">DEMO C</span>
                  <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-white mt-2">Audit Chain &amp; Tamper Test</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  HMAC-SHA256 signature verifier with live DB tamper injection widget.
                </p>
              </Link>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                href="/login"
                className="px-6 py-3 rounded-2xl text-xs font-bold bg-white text-[#0F2A30] hover:bg-slate-100 transition-all shadow-md"
              >
                Return to Login Screen
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Slide Footer with Dots */}
      <footer className="px-6 py-4 border-t border-teal-900/50 bg-[#0A1F24]/80 flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          Smart India Hackathon 2026 · AICTE Security Deposit Portal
        </div>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide
                  ? "w-8 bg-[#FF9D2D]"
                  : "w-2 bg-teal-950 hover:bg-teal-800"
              }`}
              aria-label={`Jump to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="text-[11px] text-slate-400 hidden sm:block">
          Use ← / → keys to navigate
        </div>
      </footer>
    </div>
  );
}
