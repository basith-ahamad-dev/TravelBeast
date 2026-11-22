import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminPagination, ADMIN_PAGE_SIZE, pageNum } from "@/components/admin/AdminPagination";
import { DestinationsManager } from "@/components/admin/DestinationsManager";

export default async function AdminDestinationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNum((await searchParams).page);
  const [rows, total] = await Promise.all([
    db.destination.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: { _count: { select: { packages: true } } },
    }),
    db.destination.count(),
  ]);
  return (
    <>
      <PageHeader title="Destinations" subtitle="Places your packages travel to." />
      <DestinationsManager
        rows={rows.map((d) => ({
          id: d.id, name: d.name, country: d.country, shortDescription: d.shortDescription, description: d.description,
          coverUrl: d.coverUrl, coverPublicId: d.coverPublicId, published: d.published, featured: d.featured, packageCount: d._count.packages,
        }))}
      />
      <AdminPagination page={page} pages={Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))} total={total} basePath="/admin/destinations" />
    </>
  );
}
