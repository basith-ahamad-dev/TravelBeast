import { z } from "zod";
import { db } from "@/lib/db";
import { handle, parseBody, ok } from "@/lib/api";
import { requireAdmin, HttpError } from "@/lib/auth";
import { destinationSchema } from "@/lib/validation";
import { deleteImage } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = handle<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const { cover, ...rest } = await parseBody(req, destinationSchema);
  const old = await db.destination.findUniqueOrThrow({ where: { id } });
  const d = await db.destination.update({
    where: { id },
    data: { ...rest, country: rest.country || null, coverUrl: cover?.url ?? null, coverPublicId: cover?.publicId ?? null },
  });
  if (old.coverPublicId && old.coverPublicId !== (cover?.publicId ?? null)) await deleteImage(old.coverPublicId);
  return ok(d);
});

export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const data = await parseBody(req, z.object({ published: z.boolean().optional(), featured: z.boolean().optional() }));
  return ok(await db.destination.update({ where: { id }, data }));
});

export const DELETE = handle<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const count = await db.package.count({ where: { destinationId: id } });
  if (count > 0)
    throw new HttpError(409, `This destination still has ${count} package(s). Delete or reassign them first.`);
  const d = await db.destination.delete({ where: { id } });
  await deleteImage(d.coverPublicId);
  return ok({ ok: true });
});
