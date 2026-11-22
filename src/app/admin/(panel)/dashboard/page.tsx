import Link from "next/link";
import { Package, MapPin, Star, Images, Inbox, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatDate, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const [packages, destinations, reviews, gallery, byStatus, recentInquiries, recentPackages, perDest, ratings] = await Promise.all([
    db.package.count(),
    db.destination.count(),
    db.review.count(),
    db.galleryImage.count(),
    db.inquiry.groupBy({ by: ["status"], _count: true }),
    db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { package: { select: { title: true } } } }),
    db.package.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { destination: { select: { name: true } } } }),
    db.destination.findMany({ select: { name: true, _count: { select: { packages: true } } }, orderBy: { name: "asc" } }),
    db.review.groupBy({ by: ["rating"], _count: true }),
  ]);

  const statusCount = (s: string) => byStatus.find((x) => x.status === s)?._count ?? 0;
  const stats = [
    { label: "Travel packages", value: packages, Icon: Package, href: "/admin/packages", color: "bg-ocean" },
    { label: "Destinations", value: destinations, Icon: MapPin, href: "/admin/destinations", color: "bg-sky" },
    { label: "Customer reviews", value: reviews, Icon: Star, href: "/admin/reviews", color: "bg-gold !text-ink" },
    { label: "Gallery images", value: gallery, Icon: Images, href: "/admin/gallery", color: "bg-sunset" },
  ];
  const maxPer = Math.max(1, ...perDest.map((d) => d._count.packages));
  const totalInq = byStatus.reduce((a, b) => a + b._count, 0);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="A quick overview of your website."
        action={<Link href="/admin/packages/new" className="btn-primary btn-sm"><Plus className="h-4 w-4" /> New package</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, Icon, href, color }) => (
          <Link key={label} href={href} className="card flex items-center gap-4 p-5 hover:-translate-y-0.5 hover:shadow-lift">
            <span className={cn("grid h-12 w-12 place-items-center rounded-xl text-white", color)}><Icon className="h-6 w-6" /></span>
            <div><p className="font-heading text-3xl font-semibold leading-none">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-6">
          <h2 className="text-lg">Inquiries by status</h2>
          <p className="text-sm text-slate-500">{totalInq} total</p>
          <div className="mt-4 space-y-3">
            {([["PENDING", "Pending", "bg-amber-400"], ["CONTACTED", "Contacted", "bg-sky"], ["COMPLETED", "Completed", "bg-emerald-500"]] as const).map(([k, l, c]) => (
              <div key={k}>
                <div className="mb-1 flex justify-between text-sm"><span>{l}</span><span className="font-semibold">{statusCount(k)}</span></div>
                <div className="h-2.5 rounded-full bg-slate-100"><div className={cn("h-full rounded-full", c)} style={{ width: `${totalInq ? (statusCount(k) / totalInq) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg">Packages per destination</h2>
          <div className="mt-4 space-y-3">
            {perDest.length === 0 && <p className="text-sm text-slate-500">No destinations yet.</p>}
            {perDest.map((d) => (
              <div key={d.name}>
                <div className="mb-1 flex justify-between text-sm"><span>{d.name}</span><span className="font-semibold">{d._count.packages}</span></div>
                <div className="h-2.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-ocean" style={{ width: `${(d._count.packages / maxPer) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg">Rating distribution</h2>
          <div className="mt-4 space-y-2.5">
            {[5, 4, 3, 2, 1].map((n) => {
              const c = ratings.find((r) => r.rating === n)?._count ?? 0;
              return (
                <div key={n} className="flex items-center gap-3 text-sm">
                  <span className="w-8">{n} ★</span>
                  <div className="h-2.5 flex-1 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gold" style={{ width: `${reviews ? (c / reviews) * 100 : 0}%` }} /></div>
                  <span className="w-6 text-right font-semibold">{c}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg">Recent inquiries</h2><Link href="/admin/inquiries" className="text-sm font-semibold text-ocean">View all</Link></div>
          {recentInquiries.length === 0 ? <p className="text-sm text-slate-500">No inquiries yet.</p> : (
            <ul className="divide-y divide-slate-100">
              {recentInquiries.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0"><p className="font-semibold">{i.name}</p><p className="truncate text-sm text-slate-500">{i.package?.title ?? i.message}</p></div>
                  <div className="shrink-0 text-right"><p className="text-xs text-slate-500">{formatDate(i.createdAt)}</p><span className={cn("badge mt-1", i.status === "PENDING" ? "bg-amber-100 text-amber-800" : i.status === "CONTACTED" ? "bg-sky/20 text-deep" : "bg-emerald-100 text-emerald-700")}>{i.status.toLowerCase()}</span></div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg">Recently added packages</h2><Link href="/admin/packages" className="text-sm font-semibold text-ocean">View all</Link></div>
          {recentPackages.length === 0 ? <p className="text-sm text-slate-500">No packages yet.</p> : (
            <ul className="divide-y divide-slate-100">
              {recentPackages.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0"><Link href={`/admin/packages/${p.id}/edit`} className="block truncate font-semibold hover:text-ocean">{p.title}</Link><p className="text-sm text-slate-500">{p.destination.name} · {formatPrice(p.price, p.currency)}</p></div>
                  <span className={cn("badge", p.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>{p.published ? "Published" : "Draft"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
