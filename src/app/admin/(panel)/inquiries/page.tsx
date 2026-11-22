import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminPagination, ADMIN_PAGE_SIZE, pageNum } from "@/components/admin/AdminPagination";
import { InquiriesManager } from "@/components/admin/InquiriesManager";

export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
  const sp = await searchParams;
  const page = pageNum(sp.page);
  const status = sp.status === "PENDING" || sp.status === "CONTACTED" || sp.status === "COMPLETED" ? sp.status : undefined;
  const where: Prisma.InquiryWhereInput = status ? { status } : {};
  const [rows, total] = await Promise.all([
    db.inquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE, include: { package: { select: { title: true } } } }),
    db.inquiry.count({ where }),
  ]);
  return (
    <>
      <PageHeader title="Inquiries" subtitle="Messages and package requests from visitors." />
      <InquiriesManager
        filter={status}
        rows={rows.map((r) => ({
          id: r.id, name: r.name, email: r.email, phone: r.phone, message: r.message, status: r.status,
          createdAt: r.createdAt.toISOString(), packageTitle: r.package?.title ?? null,
        }))}
      />
      <AdminPagination page={page} pages={Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))} total={total} basePath="/admin/inquiries" params={{ status }} />
    </>
  );
}

