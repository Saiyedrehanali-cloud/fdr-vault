import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fdr-vault-sih26265-demo-jwt-secret-key-32chars"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths that do not require authentication
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/pitch") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/dashboard") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".pdf")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("fdr_session")?.value;

  // If no token exists on protected routes
  if (!token) {
    // If requesting API routes
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHENTICATED", message: "Authentication required" } },
        { status: 401 }
      );
    }
    // Redirect web pages to /login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = (payload as any).role as string;

    // Enforce role authorization
    if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "SENIOR_ADMIN") {
      // Institution user trying to access admin
      return NextResponse.redirect(new URL("/portal", req.url));
    }

    if (pathname.startsWith("/portal") && role !== "INSTITUTION") {
      // Admin user trying to access institution portal
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Expired or invalid token
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("fdr_session");
    return response;
  }
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/portal",
    "/portal/:path*",
    "/api/:path*",
  ],
};
