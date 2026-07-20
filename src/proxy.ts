import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Schuetzt /admin/* — nur mit gueltiger Session erreichbar (ausser Login-Seite).
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me-please-32chars",
);

async function hasValid(request: NextRequest, cookieName: string): Promise<boolean> {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Stammkunden-Bereich: eigene Session
  if (pathname.startsWith("/mein-bereich")) {
    if (!(await hasValid(request, "hg_customer"))) {
      return NextResponse.redirect(new URL("/anmelden", request.url));
    }
    return NextResponse.next();
  }

  // Admin
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (!(await hasValid(request, "hg_session"))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/mein-bereich/:path*"],
};
