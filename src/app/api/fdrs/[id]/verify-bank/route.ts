import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyFDRWithBank } from "@/lib/services/bank";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SENIOR_ADMIN")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const fdrId = params.id;
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const result = await verifyFDRWithBank(fdrId, {
      id: session.userId,
      name: session.name,
      role: session.role,
      ipAddress: ip,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Bank verify API error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to cross-check with bank" },
      { status: 500 }
    );
  }
}
