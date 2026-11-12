import { db } from "@/lib/db";
import { handle, parseBody, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { settingsSchema } from "@/lib/validation";
import { getSettings } from "@/lib/queries";

export const GET = handle(async () => {
  await requireAdmin();
  return ok(await getSettings());
});

export const PUT = handle(async (req) => {
  await requireAdmin();
  const raw = await parseBody(req, settingsSchema);
  // Optional empty strings -> null so the public site hides unset fields
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) data[k] = v === "" ? null : v;
  for (const k of ["companyName", "heroTitle", "heroSubtitle", "aboutText", "mission", "vision", "footerText"] as const)
    data[k] = raw[k];
  return ok(await db.websiteSettings.upsert({ where: { id: "main" }, update: data, create: { id: "main", ...data } }));
});
