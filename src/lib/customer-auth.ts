import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";

// Eigene Session fuer Stammkunden (getrennt vom Admin-Login).
const COOKIE = "hg_customer";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me-please-32chars",
);

export type CustomerSession = { id: string; email: string; name: string };

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function loginCustomer(email: string, password: string): Promise<CustomerSession | null> {
  const c = await db.customer.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!c || !c.passwordHash || c.status !== "ACTIVE") return null;
  if (!(await bcrypt.compare(password, c.passwordHash))) return null;

  const token = await new SignJWT({ email: c.email, name: `${c.firstName} ${c.lastName}`.trim() })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(c.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { id: c.id, email: c.email, name: `${c.firstName} ${c.lastName}`.trim() };
}

export async function logoutCustomer() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: String(payload.sub), email: String(payload.email), name: String(payload.name) };
  } catch {
    return null;
  }
}

export async function requireCustomer(): Promise<CustomerSession> {
  const s = await getCustomerSession();
  if (!s) redirect("/anmelden");
  return s;
}
