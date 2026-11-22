import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminPagination, ADMIN_PAGE_SIZE, pageNum } from "@/components/admin/AdminPagination";
import { ReviewsManager } from "@/components/admin/ReviewsManager";

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = pageNum((await searchParams).page);
  const [rows, total, packages] = await Promise.all([
    db.review.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE, include: { images: true } }),
    db.review.count(),
    db.package.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="Customer reviews" subtitle="Published reviews appear automatically on the website." />
      <ReviewsManager
        packages={packages}
        rows={rows.map((r) => ({
          id: r.id, customerName: r.customerName, location: r.location, rating: r.rating, text: r.text, published: r.published,
          packageId: r.packageId, avatarUrl: r.avatarUrl, avatarPublicId: r.avatarPublicId,
          images: r.images.map((i) => ({ url: i.url, publicId: i.publicId })), createdAt: r.createdAt.toISOString(),
        }))}
      />
      <AdminPagination page={page} pages={Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))} total={total} basePath="/admin/reviews" />
    </>
  );
}
