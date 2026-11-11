import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { HttpError } from "@/lib/auth";

export const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_FILES_PER_REQUEST = 10;
export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

export type StoredImage = {
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
  bytes: number;
};

export function cloudinaryEnabled() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/** Detects the real image type from magic bytes (never trust the client MIME type). */
function sniff(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf.length > 12) {
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
    if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
    if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  }
  return null;
}

export async function saveImage(file: File): Promise<StoredImage> {
  if (file.size > MAX_FILE_BYTES)
    throw new HttpError(413, `"${file.name}" is larger than ${MAX_FILE_BYTES / 1024 / 1024} MB`);
  if (file.size === 0) throw new HttpError(400, `"${file.name}" is empty`);
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = sniff(buf);
  if (!kind) throw new HttpError(415, `"${file.name}" is not a valid JPG, PNG or WebP image`);

  if (cloudinaryEnabled()) {
    configure();
    const res = await new Promise<{ secure_url: string; public_id: string; width: number; height: number; bytes: number }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "travelbeast", resource_type: "image" }, (err, r) =>
            err || !r ? reject(err ?? new Error("Upload failed")) : resolve(r as never),
          )
          .end(buf);
      },
    );
    return { url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height, bytes: res.bytes };
  }

  // Development fallback: local disk, served by /media/[file]
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${randomUUID()}.${kind}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return { url: `/media/${name}`, publicId: `local:${name}`, width: null, height: null, bytes: buf.length };
}

/** Removes the stored file. Safe to call with null / unknown ids. */
export async function deleteImage(publicId?: string | null) {
  if (!publicId) return;
  try {
    if (publicId.startsWith("local:")) {
      const name = path.basename(publicId.slice(6));
      await fs.unlink(path.join(UPLOAD_DIR, name));
    } else if (cloudinaryEnabled()) {
      configure();
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (e) {
    console.error("deleteImage failed", publicId, e);
  }
}

export async function deleteImages(ids: (string | null | undefined)[]) {
  await Promise.all(ids.map((i) => deleteImage(i)));
}
