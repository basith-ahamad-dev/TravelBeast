import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { toList } from "@/lib/utils";
import { PageHeader } from "@/components/admin/PageHeader";
import { PackageForm, type PackageFormData } from "@/components/admin/PackageForm";

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, destinations] = await Promise.all([
    db.package.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } }, itinerary: { orderBy: { dayNumber: "asc" } } },
    }),
    db.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!p) notFound();

  const initial: PackageFormData = {
    id: p.id,
    title: p.title,
    shortDescription: p.shortDescription,
    description: p.description,
    durationDays: p.durationDays,
    durationNights: p.durationNights,
    price: p.price,
    currency: p.currency,
    destinationId: p.destinationId,
    included: toList(p.included),
    excluded: toList(p.excluded),
    importantInfo: p.importantInfo,
    featured: p.featured,
    published: p.published,
    cover: p.coverUrl ? { url: p.coverUrl, publicId: p.coverPublicId } : null,
    images: p.images.map((i) => ({ url: i.url, publicId: i.publicId, width: i.width, height: i.height, bytes: i.bytes, alt: i.alt })),
    itinerary: p.itinerary.map((d) => ({ title: d.title, description: d.description })),
  };
  return (
    <>
      <PageHeader title={`Edit: ${p.title}`} />
      <PackageForm initial={initial} destinations={destinations} />
    </>
  );
}
