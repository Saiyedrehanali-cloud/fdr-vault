"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Flame,
  ArrowRight,
  User,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function AdminInstitutionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalInstitutions: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    deficitCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [regionFilter, setRegionFilter] = useState("ALL");

  const loadInstitutions = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (riskFilter !== "ALL") params.set("risk", riskFilter);
      if (regionFilter !== "ALL") params.set("region", regionFilter);

      const res = await fetch(`/api/institutions?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setItems(json.data.items);
        setStats(json.data.stats);
      }
    } catch (e) {
      console.error("Failed to load institutions:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInstitutions();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, riskFilter, regionFilter]);

  const getRiskBadge = (tier: string, score: number) => {
    switch (tier) {
      case "HIGH":
        return {
          bg: "bg-[#FDE3D6] text-[#EB5A11] border-[#EB5A11]/30",
          dot: "bg-[#EB5A11]",
          label: `High Risk (${score})`,
        };
      case "MEDIUM":
        return {
          bg: "bg-[#FFF6EB] text-[#B26A00] border-[#FF9D2D]/30",
          dot: "bg-[#FF9D2D]",
          label: `Medium Risk (${score})`,
        };
      default:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          label: `Low Risk (${score})`,
        };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#00959C]">
            <Building2 className="w-4 h-4" />
            <span>AICTE Approval &amp; Accreditation Bureau</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#006675] tracking-tight mt-0.5">
            Affiliated Technical Institutions
          </h1>
          <p className="text-xs sm:text-sm text-[#5B7480] mt-1">
            Institutional deposit compliance health, shortfall surveillance, and automated risk scoring across 40 nationwide technical institutes.
          </p>
        </div>

        <button
          onClick={loadInstitutions}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#00959C]" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-card">
          <span className="text-xs font-semibold text-[#5B7480]">Affiliated Institutes</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#0F2A30]">
              {stats.totalInstitutions}
            </span>
            <span className="text-[11px] text-[#5B7480]">Nationwide</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-card">
          <span className="text-xs font-semibold text-rose-800">High Risk Profiles</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#EB5A11]">
              {stats.highRisk}
            </span>
            <span className="text-[11px] text-rose-600">Urgent Scrutiny</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-card">
          <span className="text-xs font-semibold text-amber-800">Deposit Deficit</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700">
              {stats.deficitCount}
            </span>
            <span className="text-[11px] text-amber-600">Below Minimum</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-card">
          <span className="text-xs font-semibold text-emerald-800">Low Risk / Compliant</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {stats.lowRisk}
            </span>
            <span className="text-[11px] text-emerald-600">Healthy</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by college name, AICTE ID, city, or state..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00959C]"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00959C]"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Region:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00959C]"
            >
              <option value="ALL">All Regions</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="West">West</option>
              <option value="East">East</option>
              <option value="Central">Central</option>
              <option value="North-West">North-West</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Institution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#00959C] mb-2" />
            <span className="text-xs">Loading institutions directory...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
            <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#0F2A30]">No Institutes Found</h4>
            <p className="text-xs text-[#5B7480] mt-1">Try adjusting your search or risk filters.</p>
          </div>
        ) : (
          items.map((inst) => {
            const riskInfo = getRiskBadge(inst.riskTier, inst.riskScore);
            const percentFunded = Math.min(
              100,
              Math.round((inst.totalDeposited / inst.requiredDeposit) * 100)
            );

            return (
              <div
                key={inst.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 hover:border-[#00959C]/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar: Name, Type, Risk Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {inst.type}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#006675]">
                          AICTE ID: {inst.aicteId}
                        </span>
                        <span className="text-[11px] text-slate-400">· {inst.region} Region</span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-[#0F2A30] mt-1">
                        {inst.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#5B7480] mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {inst.city}, {inst.state}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${riskInfo.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${riskInfo.dot}`} />
                      <span>{riskInfo.label}</span>
                    </span>
                  </div>

                  {/* Financial Deposit Health Bar */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Deposit Compliance</span>
                      <span className="font-bold text-[#0F2A30]">
                        {formatINR(inst.totalDeposited)} / {formatINR(inst.requiredDeposit)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          inst.isCompliant ? "bg-[#00959C]" : "bg-[#EB5A11]"
                        }`}
                        style={{ width: `${percentFunded}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{percentFunded}% of statutory requirement</span>
                      {inst.deficit > 0 ? (
                        <span className="font-bold text-[#EB5A11]">
                          Deficit: {formatINR(inst.deficit)}
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Fully Compliant</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operational Risk Indicators */}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Active FDRs</span>
                      <span className="font-mono font-bold text-[#0F2A30] text-sm">
                        {inst.fdrCount}
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-xl border ${
                        inst.overdueCount > 0
                          ? "bg-rose-50 border-rose-200 text-[#EB5A11]"
                          : "bg-slate-50 border-slate-100 text-slate-600"
                      }`}
                    >
                      <span className="text-[10px] block font-medium">Overdue</span>
                      <span className="font-mono font-bold text-sm">
                        {inst.overdueCount}
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-xl border ${
                        inst.unresolvedFlagsCount > 0
                          ? "bg-amber-50 border-amber-200 text-amber-800"
                          : "bg-slate-50 border-slate-100 text-slate-600"
                      }`}
                    >
                      <span className="text-[10px] block font-medium">Flags</span>
                      <span className="font-mono font-bold text-sm">
                        {inst.unresolvedFlagsCount}
                      </span>
                    </div>
                  </div>

                  {/* Nodal Officer Contact */}
                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-[#0F2A30]">
                        Nodal Officer: {inst.nodalOfficer}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pl-5">
                      <span>{inst.phone}</span>
                      <span>·</span>
                      <span className="truncate">{inst.email}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Last audited: AICTE Verification Engine
                  </span>
                  <Link
                    href={`/admin/fdrs?institutionId=${inst.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#006675] bg-[#E0F5F5] hover:bg-[#00959C] hover:text-white transition-colors"
                  >
                    <span>View Deposit Ledger</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
