import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";

const COOKIE = "hg_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me-please-32chars",
);

export type SessionUser = { id: string; email: string; name: string; role: string };

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}
export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

// Login: prueft Credentials, setzt Session-Cookie. Gibt null bei Fehler.
export async function login(email: string, password: string): Promise<SessionUser | null> {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return null;
  if (!(await verifyPassword(password, user.passwordHash))) return null;

  const token = await new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
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
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

// Aktuelle Session lesen (oder null). Fuer Server Components / Actions.
export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}

// Schutz fuer Admin-Bereiche: wirft (redirect) wenn nicht eingeloggt.
export async function requireUser(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}
