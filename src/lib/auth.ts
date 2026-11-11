import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "tb_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set (32+ characters)");
  return new TextEncoder().encode(s);
}

export type Session = { id: string; email: string; name: string; role: "SUPER_ADMIN" | "EDITOR" };

export async function createSessionCookie(user: Session) {
  const token = await new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Verifies the cookie AND that the admin still exists in the database. */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const user = await db.adminUser.findUnique({ where: { id: payload.sub } });
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  } catch {
    return null;
  }
}

/** For admin pages (server components). Redirects to login if unauthenticated. */
export async function requireAdminPage(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** For API route handlers. Throws HttpError(401/403) – use with `handle()`. */
export async function requireAdmin(opts?: { superOnly?: boolean }): Promise<Session> {
  const s = await getSession();
  if (!s) throw new HttpError(401, "Authentication required");
  if (opts?.superOnly && s.role !== "SUPER_ADMIN") throw new HttpError(403, "Forbidden");
  return s;
}

/** Basic CSRF defence for state-changing requests: Origin must match Host. */
export async function assertSameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (!origin) return; // non-browser clients (curl) – cookie auth still required
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (new URL(origin).host !== host) throw new HttpError(403, "Cross-origin request blocked");
}
