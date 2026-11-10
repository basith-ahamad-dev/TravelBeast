/**
 * Applies the SQL migrations in prisma/migrations/* to Turso (or a local SQLite file).
 *
 * Prisma Migrate cannot talk to Turso directly, so migrations are generated with
 * `prisma migrate diff` (see README) and applied by this script. Applied migrations
 * are tracked in the `_migrations` table, so it is safe to run repeatedly.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./dev.db";
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });

async function main() {
  await client.execute(
    `CREATE TABLE IF NOT EXISTS "_migrations" ("name" TEXT NOT NULL PRIMARY KEY, "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  );
  const done = new Set((await client.execute(`SELECT name FROM "_migrations"`)).rows.map((r) => String(r.name)));
  const dir = path.join(process.cwd(), "prisma", "migrations");
  const names = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();

  let applied = 0;
  for (const name of names) {
    if (done.has(name)) continue;
    const sql = fs.readFileSync(path.join(dir, name, "migration.sql"), "utf8");
    // Strip comment-only lines, then split into statements (Prisma-generated SQL has no ';' inside literals).
    const statements = sql
      .split("\n").filter((l) => !l.trim().startsWith("--")).join("\n")
      .split(";").map((s) => s.trim()).filter(Boolean);
    await client.batch(
      [...statements.map((s) => ({ sql: s, args: [] })), { sql: `INSERT INTO "_migrations" ("name") VALUES (?)`, args: [name] }],
      "write",
    );
    console.log(`Applied ${name} (${statements.length} statements)`);
    applied++;
  }
  console.log(applied ? `Done: ${applied} migration(s) applied to ${url.replace(/\/\/.*@/, "//")}` : "Database is up to date.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => client.close());
