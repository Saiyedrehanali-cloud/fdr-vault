import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHENTICATED", message: "Not authenticated" } },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true, data: { user: session } });
}
