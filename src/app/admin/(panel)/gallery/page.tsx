import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminPagination, pageNum } from "@/components/admin/AdminPagination";
import { GalleryManager } from "@/components/admin/GalleryManager";

const SIZE = 12;

export default async function AdminGalleryPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNum((await searchParams).page);
  const [rows, total, destinations, packages] = await Promise.all([
    db.galleryImage.findMany({
      orderBy: { createdAt: "desc" }, skip: (page - 1) * SIZE, take: SIZE,
      include: { destination: { select: { name: true } }, package: { select: { title: true } } },
    }),
    db.galleryImage.count(),
    db.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.package.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="Gallery" subtitle="Upload, organise and feature your travel images." />
      <GalleryManager
        destinations={destinations}
        packages={packages.map((p) => ({ id: p.id, name: p.title }))}
        rows={rows.map((r) => ({
          id: r.id, title: r.title, description: r.description, url: r.url, featured: r.featured,
          destinationId: r.destinationId, packageId: r.packageId,
          destinationName: r.destination?.name, packageTitle: r.package?.title,
        }))}
      />
      <AdminPagination page={page} pages={Math.max(1, Math.ceil(total / SIZE))} total={total} basePath="/admin/gallery" />
    </>
  );
}
