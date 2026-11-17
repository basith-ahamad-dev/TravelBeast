import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";

export function DestinationCard({
  d,
}: {
  d: { name: string; slug: string; country: string | null; shortDescription: string; coverUrl: string | null; _count?: { packages: number } };
}) {
  return (
    <Link
      href={`/destinations/${d.slug}`}
      className="card group flex h-full flex-col p-3 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-4 ring-sky/70">
        <SmartImage src={d.coverUrl} alt={d.name} className="transition duration-700 group-hover:scale-110" />
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        {d.country && <p className="text-xs font-bold uppercase tracking-widest text-sunset-dark">{d.country}</p>}
        <h3 className="mt-0.5 text-xl">{d.name}</h3>
        <p className="mt-1.5 line-clamp-3 text-sm text-slate-600">{d.shortDescription}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-ocean">
          Explore destination
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
