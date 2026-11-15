"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Snap-scrolling row with the template's two control styles:
 *  - "activities": "< Previous ---- Next >" with a yellow progress thumb and a "01 /06" counter
 *  - "reviews": dots, a red progress line, counter and red / blue round arrows
 * Children must size themselves (e.g. `w-[330px] shrink-0 snap-start`).
 */
export function Carousel({ children, variant, trackClassName }: { children: React.ReactNode; variant: "activities" | "reviews"; trackClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ i: 0, n: 0, left: 0, width: 1 });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const kids = Array.from(el.children) as HTMLElement[];
    const step = kids.length > 1 ? kids[1].offsetLeft - kids[0].offsetLeft : el.clientWidth;
    const max = Math.max(el.scrollWidth - el.clientWidth, 0);
    const thumb = el.scrollWidth > 0 ? Math.min(el.clientWidth / el.scrollWidth, 1) : 1;
    setState({
      i: step > 0 ? Math.round(el.scrollLeft / step) : 0,
      n: kids.length,
      left: max > 0 ? (el.scrollLeft / max) * (1 - thumb) : 0,
      width: max > 0 ? thumb : 1,
    });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const kids = Array.from(el.children) as HTMLElement[];
    const step = kids.length > 1 ? kids[1].offsetLeft - kids[0].offsetLeft : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const counter = (
    <span className="tabular-nums">
      {pad(Math.min(state.i + 1, Math.max(state.n, 1)))} <span className="text-[0.8em] opacity-60">/{pad(state.n)}</span>
    </span>
  );

  return (
    <div>
      <div ref={ref} onScroll={update} className={cn("no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth", trackClassName)}>
        {children}
      </div>

      {variant === "activities" ? (
        <div className="mt-10 text-white">
          <div className="mx-auto flex max-w-[640px] items-center gap-4 px-6 text-sm">
            <button onClick={() => go(-1)} className="flex items-center gap-2 transition hover:text-gold" aria-label="Previous">
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <div className="relative h-0.5 flex-1 bg-white/40" aria-hidden>
              <div className="absolute top-0 h-full rounded-full bg-gold transition-all" style={{ left: `${state.left * 100}%`, width: `${state.width * 100}%` }} />
            </div>
            <button onClick={() => go(1)} className="flex items-center gap-2 transition hover:text-gold" aria-label="Next">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-5 text-center text-lg">{counter}</p>
        </div>
      ) : (
        <div className="mt-10 flex items-center gap-5 px-1 text-ink">
          <span className="hidden items-center gap-1.5 sm:flex" aria-hidden>
            {[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-1.5 rounded-full bg-slate-300" />)}
            <span className="grid h-4 w-4 place-items-center rounded-full ring-2 ring-sunset"><span className="h-1.5 w-1.5 rounded-full bg-sunset" /></span>
          </span>
          <div className="relative h-px flex-1 bg-sunset/30" aria-hidden>
            <div className="absolute top-0 h-px bg-sunset transition-all" style={{ left: `${state.left * 100}%`, width: `${Math.max(state.width, 0.15) * 100}%` }} />
          </div>
          <span className="text-lg">{counter}</span>
          <button onClick={() => go(-1)} aria-label="Previous review" className="grid h-12 w-12 place-items-center rounded-full bg-sunset text-white shadow transition hover:brightness-110">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={() => go(1)} aria-label="Next review" className="grid h-12 w-12 place-items-center rounded-full bg-ocean text-white shadow transition hover:brightness-110">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
