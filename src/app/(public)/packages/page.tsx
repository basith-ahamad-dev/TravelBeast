import type { Metadata } from "next";
import Link from "next/link";
import { Search, SlidersHorizontal, SearchX } from "lucide-react";
import { PageBanner } from "@/components/public/PageBanner";
import { PackageCard } from "@/components/public/PackageCard";
import { Pagination } from "@/components/public/Pagination";
import { listDestinations, listPackages } from "@/lib/queries";

export const metadata: Metadata = { title: "Travel Packages" };

type SP = Promise<{ q?: string; destination?: string; maxPrice?: string; duration?: string; page?: string }>;

const priceOptions = [
  ["", "Any price"],
  ["500", "Up to $500"],
  ["1000", "Up to $1,000"],
  ["1500", "Up to $1,500"],
  ["2500", "Up to $2,500"],
];
const durationOptions = [
  ["", "Any duration"],
  ["short", "1–4 days"],
  ["medium", "5–8 days"],
  ["long", "9+ days"],
];

export default async function PackagesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const duration = sp.duration === "short" || sp.duration === "medium" || sp.duration === "long" ? sp.duration : undefined;
  const [{ items, total, page, pages }, destinations] = await Promise.all([
    listPackages({
      q: sp.q?.slice(0, 100),
      destination: sp.destination,
      maxPrice: Number(sp.maxPrice) || undefined,
      duration,
      page: Number(sp.page) || 1,
    }),
    listDestinations(),
  ]);
  const filtered = !!(sp.q || sp.destination || sp.maxPrice || sp.duration);

  return (
    <>
      <PageBanner title="Travel Packages" subtitle="Find the perfect getaway: filter by destination, budget and trip length." image="https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=2000&q=70" />
      <section className="section">
        <div className="container-page">
          <form className="card -mt-24 relative z-10 mb-10 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1.2fr_1fr_1fr_auto]" role="search">
            <div className="relative">
              <label htmlFor="q" className="sr-only">Search packages</label>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="q" name="q" defaultValue={sp.q} placeholder="Search packages…" className="input pl-10" />
            </div>
            <div>
              <label htmlFor="destination" className="sr-only">Destination</label>
              <select id="destination" name="destination" defaultValue={sp.destination ?? ""} className="input">
                <option value="">All destinations</option>
                {destinations.map((d) => <option key={d.id} value={d.slug}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="maxPrice" className="sr-only">Maximum price</label>
              <select id="maxPrice" name="maxPrice" defaultValue={sp.maxPrice ?? ""} className="input">
                {priceOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="duration" className="sr-only">Duration</label>
              <select id="duration" name="duration" defaultValue={sp.duration ?? ""} className="input">
                {durationOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <button className="btn-primary" type="submit"><SlidersHorizontal className="h-4 w-4" /> Filter</button>
          </form>

          <div className="mb-6 flex items-center justify-between">
            <p className="text-slate-600">
              <strong className="text-ink">{total}</strong> package{total === 1 ? "" : "s"} found
            </p>
            {filtered && <Link href="/packages" className="text-sm font-semibold text-sunset hover:underline">Clear filters</Link>}
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl bg-mist p-12 text-center">
              <SearchX className="mx-auto h-12 w-12 text-ocean/60" />
              <h2 className="mt-3 text-xl">No packages match your search</h2>
              <p className="mt-1 text-slate-600">Try adjusting or clearing your filters.</p>
              <Link href="/packages" className="btn-blue btn-sm mt-5">Show all packages</Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p, i) => <PackageCard key={p.id} pkg={p} index={i} />)}
            </div>
          )}
          <Pagination page={page} pages={pages} basePath="/packages" params={{ q: sp.q, destination: sp.destination, maxPrice: sp.maxPrice, duration: sp.duration }} />
        </div>
      </section>
    </>
  );
}
