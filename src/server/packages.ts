import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { deleteImages } from "@/lib/storage";
import type { PackageInput } from "@/lib/validation";

export async function uniqueSlug(model: "package" | "destination", base: string, ignoreId?: string) {
  const root = slugify(base) || "item";
  let slug = root;
  for (let i = 2; i < 50; i++) {
    const found = await (db[model] as typeof db.package).findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
      select: { id: true },
    });
    if (!found) return slug;
    slug = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}

function relationData(input: PackageInput) {
  return {
    images: {
      create: input.images.map((img, i) => ({
        url: img.url,
        publicId: img.publicId ?? null,
        width: img.width ?? null,
        height: img.height ?? null,
        bytes: img.bytes ?? null,
        alt: img.alt ?? null,
        sortOrder: i,
      })),
    },
    itinerary: {
      create: input.itinerary.map((d, i) => ({ dayNumber: i + 1, title: d.title, description: d.description })),
    },
  };
}

function scalarData(input: PackageInput) {
  const { cover, images: _i, itinerary: _it, ...rest } = input;
  return { ...rest, coverUrl: cover?.url ?? null, coverPublicId: cover?.publicId ?? null };
}

export async function createPackage(input: PackageInput) {
  const slug = await uniqueSlug("package", input.title);
  return db.package.create({
    data: { ...scalarData(input), slug, ...relationData(input) } as Prisma.PackageUncheckedCreateInput,
  });
}

export async function updatePackage(id: string, input: PackageInput) {
  const existing = await db.package.findUniqueOrThrow({ where: { id }, include: { images: true } });
  const keep = new Set(input.images.map((i) => i.url));
  const removedIds = existing.images.filter((i) => !keep.has(i.url)).map((i) => i.publicId);
  const coverChanged = existing.coverPublicId && existing.coverPublicId !== (input.cover?.publicId ?? null);

  const updated = await db.$transaction(async (tx) => {
    await tx.packageImage.deleteMany({ where: { packageId: id } });
    await tx.itinerary.deleteMany({ where: { packageId: id } });
    return tx.package.update({
      where: { id },
      data: { ...scalarData(input), ...relationData(input) } as Prisma.PackageUncheckedUpdateInput,
    });
  });
  await deleteImages([...removedIds, coverChanged ? existing.coverPublicId : null]);
  return updated;
}

export async function deletePackage(id: string) {
  const p = await db.package.findUniqueOrThrow({ where: { id }, include: { images: true } });
  await db.package.delete({ where: { id } });
  await deleteImages([p.coverPublicId, ...p.images.map((i) => i.publicId)]);
}
