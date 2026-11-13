import { db } from "@/lib/db";
import { handle, parseBody, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { galleryCreateSchema } from "@/lib/validation";

// Admin: register already-uploaded images (from /api/upload) in the gallery
export const POST = handle(async (req) => {
  await requireAdmin();
  const { images, destinationId, packageId } = await parseBody(req, galleryCreateSchema);
  const created = await db.$transaction(
    images.map((i) =>
      db.galleryImage.create({
        data: {
          title: i.title || i.alt || "Untitled image",
          url: i.url,
          publicId: i.publicId ?? null,
          width: i.width ?? null,
          height: i.height ?? null,
          bytes: i.bytes ?? null,
          destinationId: destinationId || null,
          packageId: packageId || null,
        },
      }),
    ),
  );
  return ok(created, 201);
});
