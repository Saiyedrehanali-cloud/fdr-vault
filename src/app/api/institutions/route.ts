import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeLifecycle, computeDaysToMaturity } from "@/lib/services/fdr";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SENIOR_ADMIN")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const region = searchParams.get("region");
    const risk = searchParams.get("risk"); // LOW | MEDIUM | HIGH | ALL

    const institutions = await db.institution.findMany({
      include: {
        fdrs: {
          include: {
            flags: { where: { resolved: false } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const today = new Date();

    const items = institutions.map((inst) => {
      const activeFdrs = inst.fdrs.filter((f) => !f.releasedAt);
      const totalDeposited = activeFdrs.reduce((acc, f) => acc + f.amount, 0);
      const deficit = Math.max(0, inst.requiredDeposit - totalDeposited);

      let overdueCount = 0;
      let expiringSoonCount = 0;
      let unresolvedFlagsCount = 0;

      for (const fdr of activeFdrs) {
        const days = computeDaysToMaturity(fdr.maturityDate, today);
        if (days < 0 && !fdr.renewedAt) overdueCount++;
        else if (days <= 30 && !fdr.renewedAt) expiringSoonCount++;
        unresolvedFlagsCount += fdr.flags.length;
      }

      // Calculate Risk Score (0 to 100)
      let riskScore = 0;
      if (deficit > 0) riskScore += 35;
      riskScore += Math.min(30, overdueCount * 25);
      riskScore += Math.min(25, unresolvedFlagsCount * 15);
      riskScore += Math.min(10, expiringSoonCount * 10);
      riskScore = Math.min(100, riskScore);

      let riskTier: "LOW" | "MEDIUM" | "HIGH" = "LOW";
      if (riskScore >= 55) riskTier = "HIGH";
      else if (riskScore >= 25) riskTier = "MEDIUM";

      return {
        id: inst.id,
        aicteId: inst.aicteId,
        name: inst.name,
        state: inst.state,
        city: inst.city,
        region: inst.region,
        type: inst.type,
        nodalOfficer: inst.nodalOfficer,
        email: inst.email,
        phone: inst.phone,
        requiredDeposit: inst.requiredDeposit,
        totalDeposited,
        deficit,
        isCompliant: deficit === 0,
        fdrCount: activeFdrs.length,
        overdueCount,
        expiringSoonCount,
        unresolvedFlagsCount,
        riskScore,
        riskTier,
      };
    });

    // Apply filtering
    let filtered = items;
    if (search) {
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(search) ||
          i.aicteId.toLowerCase().includes(search) ||
          i.city.toLowerCase().includes(search) ||
          i.state.toLowerCase().includes(search)
      );
    }
    if (region && region !== "ALL") {
      filtered = filtered.filter((i) => i.region === region);
    }
    if (risk && risk !== "ALL") {
      filtered = filtered.filter((i) => i.riskTier === risk);
    }

    const stats = {
      totalInstitutions: items.length,
      highRisk: items.filter((i) => i.riskTier === "HIGH").length,
      mediumRisk: items.filter((i) => i.riskTier === "MEDIUM").length,
      lowRisk: items.filter((i) => i.riskTier === "LOW").length,
      deficitCount: items.filter((i) => !i.isCompliant).length,
    };

    return NextResponse.json({
      ok: true,
      data: {
        items: filtered,
        stats,
      },
    });
  } catch (error: any) {
    console.error("List institutions error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to load institutions" },
      { status: 500 }
    );
  }
}
