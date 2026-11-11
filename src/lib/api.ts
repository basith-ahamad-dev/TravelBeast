import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { Prisma } from "@prisma/client";
import { HttpError, assertSameOrigin } from "@/lib/auth";

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Wraps a route handler: CSRF check for writes + uniform JSON error responses. */
export function handle<C = unknown>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) await assertSameOrigin();
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      if (e instanceof ZodError) {
        const fields: Record<string, string> = {};
        for (const i of e.issues) fields[i.path.join(".") || "_"] ??= i.message;
        return NextResponse.json({ error: "Please check the highlighted fields", fields }, { status: 400 });
      }
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") return NextResponse.json({ error: "Record not found" }, { status: 404 });
        if (e.code === "P2002") return NextResponse.json({ error: "A record with that value already exists" }, { status: 409 });
        if (e.code === "P2003")
          return NextResponse.json(
            { error: "This item is still in use by other records. Remove or reassign them first." },
            { status: 409 },
          );
      }
      console.error(e);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
  return schema.parse(json);
}

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });

// --- tiny in-memory rate limiter (per server instance) ---
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    throw new HttpError(429, "Too many requests. Please wait a moment and try again.");
  }
  arr.push(now);
  hits.set(key, arr);
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export function pageParams(url: URL, defSize = 10) {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const size = Math.min(100, Math.max(1, Number(url.searchParams.get("size")) || defSize));
  return { page, size, skip: (page - 1) * size };
}
