import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (session) {
    await logAudit({
      actorId: session.userId,
      action: "USER_LOGOUT",
      entity: "USER",
      entityId: session.userId,
    });
  }

  const response = NextResponse.json({ ok: true, data: { message: "Logged out successfully" } });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
