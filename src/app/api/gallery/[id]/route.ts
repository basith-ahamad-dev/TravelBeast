import { db } from "@/lib/db";
import { handle, parseBody, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { galleryUpdateSchema } from "@/lib/validation";
import { deleteImage } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = handle<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const d = await parseBody(req, galleryUpdateSchema);
  return ok(
    await db.galleryImage.update({
      where: { id },
      data: { ...d, destinationId: d.destinationId || null, packageId: d.packageId || null },
    }),
  );
});

export const DELETE = handle<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const img = await db.galleryImage.delete({ where: { id } });
  await deleteImage(img.publicId);
  return ok({ ok: true });
});
