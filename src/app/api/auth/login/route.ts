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

    const normalizedEmail = email.toLowerCase().trim();

    let user: any = null;
    try {
      user = await db.user.findUnique({
        where: { email: normalizedEmail },
        include: { institution: true },
      });
    } catch (dbErr) {
      console.warn("DB user lookup error, evaluating demo fallback:", dbErr);
    }

    let isValid = false;
    let sessionUser: any = null;

    if (user) {
      isValid = await comparePassword(password, user.passwordHash);
      if (isValid) {
        sessionUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          institutionId: user.institutionId,
          institutionName: user.institution?.name,
        };
      }
    }

    // Built-in resilient demo fallback for Hackathon showcase / Vercel serverless cold starts
    if (!isValid && password === "Demo@1234") {
      const DEMO_PRESETS: Record<string, any> = {
        "admin@aicte.demo": {
          id: "demo-admin-id",
          name: "Dr. Rajesh Sharma",
          email: "admin@aicte.demo",
          role: "ADMIN",
          institutionId: null,
          institutionName: null,
        },
        "admin@aicte.gov.in": {
          id: "demo-admin-id",
          name: "Dr. Rajesh Sharma",
          email: "admin@aicte.demo",
          role: "ADMIN",
          institutionId: null,
          institutionName: null,
        },
        "senior@aicte.demo": {
          id: "demo-senior-id",
          name: "Smt. Sunita Rao",
          email: "senior@aicte.demo",
          role: "SENIOR_ADMIN",
          institutionId: null,
          institutionName: null,
        },
        "rgpv.college@demo.in": {
          id: "demo-inst-id",
          name: "Prof. Anand Verma",
          email: "rgpv.college@demo.in",
          role: "INSTITUTION",
          institutionId: "inst-001",
          institutionName: "Rajiv Gandhi Proudyogiki Vishwavidyalaya",
        },
      };

      if (DEMO_PRESETS[normalizedEmail]) {
        isValid = true;
        sessionUser = DEMO_PRESETS[normalizedEmail];
      }
    }

    if (!isValid || !sessionUser) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHENTICATED", message: "Invalid credentials. Please use Demo@1234 with one of the demo profiles." } },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = await signSessionToken({
      userId: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role as "ADMIN" | "SENIOR_ADMIN" | "INSTITUTION",
      institutionId: sessionUser.institutionId,
      institutionName: sessionUser.institutionName,
    });

    // Record login audit (non-blocking if audit DB is offline)
    try {
      await logAudit({
        actorId: sessionUser.id,
        action: "USER_LOGIN",
        entity: "USER",
        entityId: sessionUser.id,
        payload: { role: sessionUser.role, email: sessionUser.email },
      });
    } catch (auditErr) {
      console.warn("Audit log write skipped during login:", auditErr);
    }

    const response = NextResponse.json({
      ok: true,
      data: {
        user: sessionUser,
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
