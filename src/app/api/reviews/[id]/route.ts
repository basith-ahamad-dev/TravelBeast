import { z } from "zod";
import { db } from "@/lib/db";
import { handle, parseBody, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { reviewSchema } from "@/lib/validation";
import { deleteImages } from "@/lib/storage";
import { reviewData } from "@/server/reviews";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = handle<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const input = await parseBody(req, reviewSchema);
  const old = await db.review.findUniqueOrThrow({ where: { id }, include: { images: true } });
  const keep = new Set(input.images.map((i) => i.url));
  const removed = old.images.filter((i) => !keep.has(i.url)).map((i) => i.publicId);
  const avatarChanged = old.avatarPublicId && old.avatarPublicId !== (input.avatar?.publicId ?? null);
  const r = await db.$transaction(async (tx) => {
    await tx.reviewImage.deleteMany({ where: { reviewId: id } });
    return tx.review.update({ where: { id }, data: reviewData(input) });
  });
  await deleteImages([...removed, avatarChanged ? old.avatarPublicId : null]);
  return ok(r);
});

export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const data = await parseBody(req, z.object({ published: z.boolean() }));
  return ok(await db.review.update({ where: { id }, data }));
});

export const DELETE = handle<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const r = await db.review.findUniqueOrThrow({ where: { id }, include: { images: true } });
  await db.review.delete({ where: { id } });
  await deleteImages([r.avatarPublicId, ...r.images.map((i) => i.publicId)]);
  return ok({ ok: true });
});
