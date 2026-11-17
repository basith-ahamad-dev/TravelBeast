import Link from "next/link";
import { CalendarDays, MapPin, ArrowUpRight, Star, Users } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { formatDuration, formatPrice } from "@/lib/utils";
import type { PackageCardData } from "@/lib/queries";

/**
 * Ticket-style package card: photo on top, a dashed tear line with half-circle notches on both edges,
 * then location, title, trip facts and a price bar. The notches are cut with a CSS mask (see .ticket-top /
 * .ticket-bottom in globals.css), so the card works on any page background.
 */
export function PackageCard({ pkg, rating }: { pkg: PackageCardData; index?: number; rating?: { avg: number; count: number } }) {
  const href = `/packages/${pkg.slug}`;
  return (
    <article className="group h-full transition duration-300 hover:-translate-y-1">
      <div className="flex h-full flex-col drop-shadow-[0_14px_22px_rgba(7,54,90,0.14)] transition group-hover:drop-shadow-[0_20px_28px_rgba(7,54,90,0.22)]">
        {/* photo */}
        <div className="ticket-top rounded-t-3xl bg-white p-3 pb-5">
          <Link href={href} className="relative block aspect-[5/4] overflow-hidden rounded-2xl">
            <SmartImage src={pkg.coverUrl} alt={pkg.title} sizes="(min-width:1024px) 380px, (min-width:768px) 50vw, 100vw" className="transition duration-700 group-hover:scale-105" />
            {pkg.featured && <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-deep shadow">Featured</span>}
          </Link>
        </div>

        {/* details */}
        <div className="ticket-bottom relative flex flex-1 flex-col rounded-b-3xl bg-white px-5 pb-5 pt-5">
          <span aria-hidden className="absolute inset-x-5 top-0 border-t border-dashed border-slate-300" />

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[13px] text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-sunset" aria-hidden /> {pkg.destination.name}
              </p>
              <h3 className="mt-1 text-[22px] font-bold leading-tight text-ink">
                <Link href={href} className="hover:text-sunset-dark">{pkg.title}</Link>
              </h3>
            </div>
            <Link
              href={href}
              aria-label={`View ${pkg.title}`}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-300 text-ink transition group-hover:border-sunset group-hover:bg-sunset group-hover:text-white"
            >
              <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden />
            </Link>
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-ink">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" aria-hidden /> {formatDuration(pkg.durationDays, pkg.durationNights)}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" aria-hidden /> Per person</span>
          </p>

          <div className="mt-auto pt-5">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-mist px-4 py-3">
              <p className="text-[15px] text-ink">
                From <b className="text-[19px] text-sunset-dark">{formatPrice(pkg.price, pkg.currency)}</b> <span className="text-[13px] text-slate-500">/person</span>
              </p>
              {rating && rating.count > 0 && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-ink">
                  <Star className="h-3.5 w-3.5 fill-sunset text-sunset" aria-hidden /> {rating.avg.toFixed(1)}/5 <span className="font-normal text-slate-400">({rating.count})</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
