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
    const type = searchParams.get("type") || "ACTIVE"; // ACTIVE | EXPIRING | OVERDUE | DISCREPANCIES | RELEASES | INSTITUTIONS
    const format = searchParams.get("format") || "json"; // json | csv

    const today = new Date();
    let rows: any[] = [];
    let headers: { key: string; label: string }[] = [];

    if (type === "ACTIVE") {
      headers = [
        { key: "refNo", label: "FDR Ref No" },
        { key: "institutionName", label: "Institution" },
        { key: "aicteId", label: "AICTE ID" },
        { key: "bankName", label: "Bank" },
        { key: "branch", label: "Branch" },
        { key: "amount", label: "Amount (INR)" },
        { key: "issueDate", label: "Issue Date" },
        { key: "maturityDate", label: "Maturity Date" },
        { key: "daysLeft", label: "Days Left" },
        { key: "status", label: "Status" },
      ];

      const fdrs = await db.fDR.findMany({
        where: { releasedAt: null },
        include: { institution: true },
        orderBy: { maturityDate: "asc" },
      });

      rows = fdrs.map((f) => ({
        refNo: f.refNo,
        institutionName: f.institution.name,
        aicteId: f.institution.aicteId,
        bankName: f.bankName,
        branch: f.branch,
        amount: f.amount,
        issueDate: f.issueDate.toISOString().split("T")[0],
        maturityDate: f.maturityDate.toISOString().split("T")[0],
        daysLeft: computeDaysToMaturity(f.maturityDate, today),
        status: f.verificationStatus,
      }));
    } else if (type === "EXPIRING") {
      headers = [
        { key: "refNo", label: "FDR Ref No" },
        { key: "institutionName", label: "Institution" },
        { key: "bankName", label: "Bank" },
        { key: "amount", label: "Amount (INR)" },
        { key: "maturityDate", label: "Maturity Date" },
        { key: "daysLeft", label: "Days Left" },
        { key: "status", label: "Verification Status" },
      ];

      const fdrs = await db.fDR.findMany({
        where: { releasedAt: null },
        include: { institution: true },
      });

      rows = fdrs
        .filter((f) => {
          const days = computeDaysToMaturity(f.maturityDate, today);
          return days >= 0 && days <= 90;
        })
        .map((f) => ({
          refNo: f.refNo,
          institutionName: f.institution.name,
          bankName: f.bankName,
          amount: f.amount,
          maturityDate: f.maturityDate.toISOString().split("T")[0],
          daysLeft: computeDaysToMaturity(f.maturityDate, today),
          status: f.verificationStatus,
        }))
        .sort((a, b) => a.daysLeft - b.daysLeft);
    } else if (type === "OVERDUE") {
      headers = [
        { key: "refNo", label: "FDR Ref No" },
        { key: "institutionName", label: "Institution" },
        { key: "aicteId", label: "AICTE ID" },
        { key: "bankName", label: "Bank" },
        { key: "amount", label: "Amount (INR)" },
        { key: "maturityDate", label: "Maturity Date" },
        { key: "daysOverdue", label: "Days Overdue" },
      ];

      const fdrs = await db.fDR.findMany({
        where: { releasedAt: null, renewedAt: null },
        include: { institution: true },
      });

      rows = fdrs
        .filter((f) => computeDaysToMaturity(f.maturityDate, today) < 0)
        .map((f) => ({
          refNo: f.refNo,
          institutionName: f.institution.name,
          aicteId: f.institution.aicteId,
          bankName: f.bankName,
          amount: f.amount,
          maturityDate: f.maturityDate.toISOString().split("T")[0],
          daysOverdue: Math.abs(computeDaysToMaturity(f.maturityDate, today)),
        }));
    } else if (type === "DISCREPANCIES") {
      headers = [
        { key: "refNo", label: "FDR Ref No" },
        { key: "institutionName", label: "Institution" },
        { key: "code", label: "Flag Code" },
        { key: "severity", label: "Severity" },
        { key: "message", label: "Observation / Reason" },
        { key: "resolved", label: "Resolved" },
        { key: "date", label: "Flagged At" },
      ];

      const flags = await db.discrepancyFlag.findMany({
        include: {
          fdr: {
            include: { institution: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      rows = flags.map((flag) => ({
        refNo: flag.fdr.refNo,
        institutionName: flag.fdr.institution.name,
        code: flag.code,
        severity: flag.severity,
        message: flag.message,
        resolved: flag.resolved ? "YES" : "NO",
        date: flag.createdAt.toISOString().split("T")[0],
      }));
    } else if (type === "RELEASES") {
      headers = [
        { key: "releaseRef", label: "Release Voucher No" },
        { key: "refNo", label: "FDR Ref No" },
        { key: "institutionName", label: "Institution" },
        { key: "amount", label: "Refund Amount (INR)" },
        { key: "reason", label: "Ground for Release" },
        { key: "status", label: "Status" },
        { key: "date", label: "Date Decided" },
      ];

      const releases = await db.releaseRequest.findMany({
        include: {
          fdr: {
            include: { institution: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      rows = releases.map((r) => ({
        releaseRef: r.releaseRef || "PENDING",
        refNo: r.fdr.refNo,
        institutionName: r.fdr.institution.name,
        amount: r.fdr.amount,
        reason: r.reason,
        status: r.status,
        date: r.decidedAt ? r.decidedAt.toISOString().split("T")[0] : "—",
      }));
    } else if (type === "INSTITUTIONS") {
      headers = [
        { key: "aicteId", label: "AICTE ID" },
        { key: "name", label: "Institution Name" },
        { key: "state", label: "State" },
        { key: "totalDeposited", label: "Total Deposited (INR)" },
        { key: "requiredDeposit", label: "Required Deposit (INR)" },
        { key: "complianceStatus", label: "Compliance Status" },
      ];

      const insts = await db.institution.findMany({
        include: {
          fdrs: {
            where: { releasedAt: null },
            select: { amount: true },
          },
        },
        orderBy: { name: "asc" },
      });

      rows = insts.map((inst) => {
        const total = inst.fdrs.reduce((acc, f) => acc + f.amount, 0);
        const compliant = total >= inst.requiredDeposit;
        return {
          aicteId: inst.aicteId,
          name: inst.name,
          state: inst.state,
          totalDeposited: total,
          requiredDeposit: inst.requiredDeposit,
          complianceStatus: compliant ? "COMPLIANT" : "DEFICIT",
        };
      });
    }

    if (format === "csv") {
      const csvHeader = headers.map((h) => `"${h.label}"`).join(",");
      const csvRows = rows.map((row) =>
        headers
          .map((h) => {
            const val = row[h.key] ?? "";
            return `"${val.toString().replace(/"/g, '""')}"`;
          })
          .join(",")
      );
      const csvContent = [csvHeader, ...csvRows].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="FDR-Vault-Report-${type}-${today.toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        type,
        headers,
        rows,
        total: rows.length,
      },
    });
  } catch (error: any) {
    console.error("Report generate error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
