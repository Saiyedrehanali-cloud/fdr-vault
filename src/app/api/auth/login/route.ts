import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword } from "@/lib/crypto";
import { signSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION", message: "Email and password are required" } },
        { status: 422 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { institution: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHENTICATED", message: "Invalid credentials" } },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHENTICATED", message: "Invalid credentials" } },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = await signSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "ADMIN" | "SENIOR_ADMIN" | "INSTITUTION",
      institutionId: user.institutionId,
      institutionName: user.institution?.name,
    });

    // Record login audit
    await logAudit({
      actorId: user.id,
      action: "USER_LOGIN",
      entity: "USER",
      entityId: user.id,
      payload: { role: user.role, email: user.email },
    });

    const response = NextResponse.json({
      ok: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          institutionId: user.institutionId,
          institutionName: user.institution?.name,
        },
      },
    });

    // Set HTTP-only session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
