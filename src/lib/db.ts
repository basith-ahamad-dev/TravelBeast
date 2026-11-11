import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

/**
 * Database: Turso (libSQL). Set TURSO_DATABASE_URL (libsql://...) and TURSO_AUTH_TOKEN.
 * When TURSO_DATABASE_URL is unset we fall back to a local SQLite file (DATABASE_URL, default ./dev.db),
 * which makes local development work without a Turso account.
 */
export function libsqlConfig() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./dev.db";
  return { url, authToken: process.env.TURSO_AUTH_TOKEN || undefined };
}

export function createClient() {
  return new PrismaClient({ adapter: new PrismaLibSQL(libsqlConfig()) });
}

const g = globalThis as unknown as { prisma?: PrismaClient };

export const db = g.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") g.prisma = db;
