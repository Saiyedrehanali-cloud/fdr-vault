import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyAuditChain } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SENIOR_ADMIN")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const verificationResult = await verifyAuditChain();

    return NextResponse.json({
      ok: true,
      data: verificationResult,
    });
  } catch (error: any) {
    console.error("Audit verification error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to verify audit chain" },
      { status: 500 }
    );
  }
}
