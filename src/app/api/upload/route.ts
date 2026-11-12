import { z } from "zod";
import { handle, ok, parseBody } from "@/lib/api";
import { requireAdmin, HttpError } from "@/lib/auth";
import { saveImage, deleteImage, MAX_FILES_PER_REQUEST, type StoredImage } from "@/lib/storage";

export const runtime = "nodejs";

// Admin: multipart upload of one or many images. Returns stored metadata.
export const POST = handle(async (req) => {
  await requireAdmin();
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => typeof f !== "string");
  if (files.length === 0) throw new HttpError(400, "No files provided");
  if (files.length > MAX_FILES_PER_REQUEST) throw new HttpError(400, `Maximum ${MAX_FILES_PER_REQUEST} files per upload`);
  const stored: (StoredImage & { alt: string })[] = [];
  try {
    for (const f of files) stored.push({ ...(await saveImage(f)), alt: f.name.replace(/\.[^.]+$/, "") });
  } catch (e) {
    for (const s of stored) await deleteImage(s.publicId); // all-or-nothing
    throw e;
  }
  return ok({ images: stored }, 201);
});

// Admin: discard an uploaded-but-unsaved image
export const DELETE = handle(async (req) => {
  await requireAdmin();
  const { publicId } = await parseBody(req, z.object({ publicId: z.string().min(1).max(300) }));
  await deleteImage(publicId);
  return ok({ ok: true });
});
