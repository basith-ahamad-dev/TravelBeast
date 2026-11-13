import { z } from "zod";
import { db } from "@/lib/db";
import { handle, parseBody, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { packageSchema } from "@/lib/validation";
import { updatePackage, deletePackage } from "@/server/packages";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const pkg = await db.package.findUniqueOrThrow({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, itinerary: { orderBy: { dayNumber: "asc" } } },
  });
  return ok(pkg);
});

export const PUT = handle<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const input = await parseBody(req, packageSchema);
  return ok(await updatePackage(id, input));
});

const toggleSchema = z.object({ published: z.boolean().optional(), featured: z.boolean().optional() });
export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const data = await parseBody(req, toggleSchema);
  return ok(await db.package.update({ where: { id }, data }));
});

export const DELETE = handle<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  await deletePackage(id);
  return ok({ ok: true });
});
