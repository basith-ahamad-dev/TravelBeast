import Image from "next/image";
import Link from "next/link";
import { ImageIcon, Pencil, Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminPagination, ADMIN_PAGE_SIZE, pageNum } from "@/components/admin/AdminPagination";
import { DeleteButton, EmptyState, ToggleButton } from "@/components/admin/ui";
import { formatDuration, formatPrice } from "@/lib/utils";

export default async function AdminPackagesPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const sp = await searchParams;
  const page = pageNum(sp.page);
  const where = sp.q ? { title: { contains: sp.q } } : {};
  const [rows, total] = await Promise.all([
    db.package.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE, include: { destination: { select: { name: true } } } }),
    db.package.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <>
      <PageHeader title="Packages" subtitle="Create and manage travel packages." action={<Link href="/admin/packages/new" className="btn-primary btn-sm"><Plus className="h-4 w-4" /> New package</Link>} />
      <form className="relative mb-4 max-w-sm" role="search">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input name="q" defaultValue={sp.q} placeholder="Search by title…" className="input pl-10" aria-label="Search packages" />
      </form>
      {rows.length === 0 ? (
        <EmptyState title={sp.q ? "No packages match your search" : "No packages yet"} text="Create your first travel package." action={<Link href="/admin/packages/new" className="btn-primary btn-sm">New package</Link>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-mist text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="p-4">Package</th><th className="p-4">Duration</th><th className="p-4">Price</th><th className="p-4">Status</th><th className="p-4">Featured</th><th className="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-mist">
                        {p.coverUrl ? <Image src={p.coverUrl} alt="" fill sizes="64px" className="object-cover" /> : <ImageIcon className="m-auto mt-3 h-6 w-6 text-slate-400" />}
                      </div>
                      <div className="min-w-0"><p className="truncate font-semibold">{p.title}</p><p className="text-xs text-slate-500">{p.destination.name}</p></div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap p-4">{formatDuration(p.durationDays, p.durationNights)}</td>
                  <td className="p-4 font-semibold">{formatPrice(p.price, p.currency)}</td>
                  <td className="p-4"><ToggleButton url={`/api/packages/${p.id}`} field="published" value={p.published} onLabel="Published" offLabel="Draft" /></td>
                  <td className="p-4"><ToggleButton url={`/api/packages/${p.id}`} field="featured" value={p.featured} onLabel="Featured" offLabel="No" onClass="bg-gold/30 text-amber-800" /></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/packages/${p.id}/edit`} className="grid h-9 w-9 place-items-center rounded-lg text-ocean hover:bg-mist" aria-label={`Edit ${p.title}`}><Pencil className="h-4 w-4" /></Link>
                      <DeleteButton url={`/api/packages/${p.id}`} label={p.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AdminPagination page={page} pages={pages} total={total} basePath="/admin/packages" params={{ q: sp.q }} />
    </>
  );
}
