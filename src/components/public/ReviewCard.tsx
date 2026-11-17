import Image from "next/image";
import { Star } from "lucide-react";

type R = {
  customerName: string;
  location: string | null;
  rating: number;
  text: string;
  avatarUrl: string | null;
  images: { url: string }[];
};

/**
 * Ticket-style review card: stars + score and the quote on top, a dashed tear line with half-circle notches
 * on both edges, then the guest. Notches come from the .ticket-top / .ticket-bottom masks in globals.css.
 */
export function ReviewCard({ r }: { r: R }) {
  return (
    <figure className="flex h-full flex-col drop-shadow-[0_12px_20px_rgba(7,54,90,0.12)]">
      <div className="ticket-top flex-1 rounded-t-3xl bg-white px-6 pb-9 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5" role="img" aria-label={`${r.rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={`h-4 w-4 ${i <= r.rating ? "fill-sunset text-sunset" : "fill-slate-200 text-slate-200"}`} aria-hidden />
            ))}
          </div>
          <span className="text-[15px] font-semibold text-ink">{r.rating.toFixed(1)}/5</span>
        </div>
        <blockquote className="mt-4 text-[17px] leading-7 text-ink">{r.text}</blockquote>
        {r.images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {r.images.slice(0, 3).map((img) => (
              <div key={img.url} className="relative aspect-square overflow-hidden rounded-2xl">
                <Image src={img.url} alt={`Photo from ${r.customerName}'s trip`} fill sizes="120px" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <figcaption className="ticket-bottom relative flex items-center gap-4 rounded-b-3xl bg-white px-6 pb-6 pt-7">
        <span aria-hidden className="absolute inset-x-6 top-0 border-t border-dashed border-slate-300" />
        {r.avatarUrl ? (
          <Image src={r.avatarUrl} alt="" width={56} height={56} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-deep font-heading text-xl font-semibold text-white">
            {r.customerName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-display text-[22px] font-bold leading-tight text-ink">{r.customerName}</p>
          {r.location && <p className="mt-0.5 text-[14px] text-slate-500">{r.location}</p>}
        </div>
      </figcaption>
    </figure>
  );
}
