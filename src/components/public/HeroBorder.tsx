import Image from "next/image";

/**
 * Bottom border of the hero: a faint illustrated skyline of Sri Lanka (stilt fisherman, lighthouse, Sigiriya,
 * dagoba, dancer, elephant, tea-country train) over an ornamental lotus band. The artwork fades up out of the
 * white page background so it melts into the hero photo.
 */
export function HeroBorder({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-0 h-[90px] sm:h-[120px] lg:h-[150px] ${className}`}>
      {/* white fade from the photo into the page */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/85 to-white" />
      <Image
        src="/lanka-border.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-bottom"
        style={{ WebkitMaskImage: "linear-gradient(to bottom,transparent 0,#000 30%)", maskImage: "linear-gradient(to bottom,transparent 0,#000 30%)" }}
      />
    </div>
  );
}
