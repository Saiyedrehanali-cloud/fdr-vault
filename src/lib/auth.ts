import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "fdr_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "finmatrix-sih26265-demo-jwt-secret-key-32chars"
);

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN" | "SENIOR_ADMIN" | "INSTITUTION";
  institutionId?: string | null;
  institutionName?: string | null;
}

/**
 * Sign session JWT with 8 hour expiration
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);
}

/**
 * Verify and decode session JWT
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get current session from incoming cookies (Server Component or Route Handler)
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Helper to enforce RBAC in API Route Handlers
 */
export async function requireAuth(allowedRoles?: Array<"ADMIN" | "SENIOR_ADMIN" | "INSTITUTION">) {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { ok: false, error: { code: "UNAUTHENTICATED", message: "Login required" } },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
        { status: 403 }
      ),
    };
  }

  return { session, errorResponse: null };
}
