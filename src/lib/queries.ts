import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const PAGE_SIZE = 9;

export async function getSettings() {
  return (
    (await db.websiteSettings.findUnique({ where: { id: "main" } })) ??
    (await db.websiteSettings.create({ data: { id: "main" } }))
  );
}

const cardSelect = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  durationDays: true,
  durationNights: true,
  price: true,
  currency: true,
  coverUrl: true,
  featured: true,
  destination: { select: { name: true, slug: true } },
} satisfies Prisma.PackageSelect;

export type PackageCardData = Prisma.PackageGetPayload<{ select: typeof cardSelect }>;

export type PackageFilters = {
  q?: string;
  destination?: string; // slug
  maxPrice?: number;
  duration?: "short" | "medium" | "long"; // 1-4, 5-8, 9+
  page?: number;
};

export async function listPackages(f: PackageFilters) {
  const where: Prisma.PackageWhereInput = { published: true, destination: { published: true } };
  if (f.q) {
    where.OR = [
      // SQLite's LIKE is case-insensitive for ASCII, so no `mode` option is needed.
      { title: { contains: f.q } },
      { shortDescription: { contains: f.q } },
      { destination: { name: { contains: f.q } } },
    ];
  }
  if (f.destination) where.destination = { published: true, slug: f.destination };
  if (f.maxPrice) where.price = { lte: f.maxPrice };
  if (f.duration === "short") where.durationDays = { lte: 4 };
  if (f.duration === "medium") where.durationDays = { gte: 5, lte: 8 };
  if (f.duration === "long") where.durationDays = { gte: 9 };

  const page = Math.max(1, f.page ?? 1);
  const [items, total] = await Promise.all([
    db.package.findMany({
      where,
      select: cardSelect,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.package.count({ where }),
  ]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export function featuredPackages(take = 4) {
  return db.package.findMany({
    where: { published: true, featured: true, destination: { published: true } },
    select: cardSelect,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export function getPackageBySlug(slug: string) {
  return db.package.findFirst({
    where: { slug, published: true },
    include: {
      destination: true,
      images: { orderBy: { sortOrder: "asc" } },
      itinerary: { orderBy: { dayNumber: "asc" } },
      reviews: { where: { published: true }, include: { images: true }, orderBy: { createdAt: "desc" }, take: 6 },
    },
  });
}

export function relatedPackages(destinationId: string, excludeId: string, take = 3) {
  return db.package.findMany({
    where: { published: true, destinationId, id: { not: excludeId } },
    select: cardSelect,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export function listDestinations(opts?: { featured?: boolean; take?: number }) {
  return db.destination.findMany({
    where: { published: true, ...(opts?.featured ? { featured: true } : {}) },
    include: { _count: { select: { packages: { where: { published: true } } } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: opts?.take,
  });
}

export function getDestinationBySlug(slug: string) {
  return db.destination.findFirst({
    where: { slug, published: true },
    include: {
      packages: { where: { published: true }, select: cardSelect, orderBy: { createdAt: "desc" } },
      galleryImages: { orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 24 },
    },
  });
}

export function publishedReviews(take = 6) {
  return db.review.findMany({
    where: { published: true },
    include: { images: { take: 3 } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function reviewSummary() {
  const r = await db.review.aggregate({ where: { published: true }, _avg: { rating: true }, _count: true });
  return { avg: r._avg.rating ?? 0, count: r._count };
}

export function featuredGallery(take = 8) {
  return db.galleryImage.findMany({ where: { featured: true }, orderBy: { createdAt: "desc" }, take });
}
