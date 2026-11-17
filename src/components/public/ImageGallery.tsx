"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryItem = { url: string; alt: string };

/** Hero image + thumbnails + fullscreen lightbox. */
export function ImageGallery({ items, layout = "hero" }: { items: GalleryItem[]; layout?: "hero" | "grid" }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const next = useCallback(() => setActive((i) => (i + 1) % items.length), [items.length]);
  const prev = useCallback(() => setActive((i) => (i - 1 + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, next, prev]);

  if (items.length === 0) return null;

  return (
    <>
      {layout === "hero" ? (
        <div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl"
            aria-label="Open image gallery"
          >
            <Image src={items[active].url} alt={items[active].alt} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" priority />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100">
              <Expand className="h-3.5 w-3.5" /> View larger
            </span>
          </button>
          {items.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {items.map((it, i) => (
                <button
                  key={it.url + i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={cn(
                    "relative aspect-[4/3] overflow-hidden rounded-2xl ring-2 transition",
                    i === active ? "ring-sunset" : "ring-transparent opacity-80 hover:opacity-100",
                  )}
                >
                  <Image src={it.url} alt="" fill sizes="120px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((it, i) => (
            <button
              key={it.url + i}
              type="button"
              onClick={() => {
                setActive(i);
                setOpen(true);
              }}
              aria-label={`Open ${it.alt}`}
              className={cn(
                "group relative overflow-hidden rounded-2xl",
                i % 7 === 0 ? "aspect-square sm:col-span-2 sm:row-span-2 sm:aspect-auto" : "aspect-square",
              )}
            >
              <Image src={it.url} alt={it.alt} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setOpen(false)}>
          <button className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30" aria-label="Close" onClick={() => setOpen(false)}>
            <X />
          </button>
          {items.length > 1 && (
            <>
              <button className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30" aria-label="Previous" onClick={(e) => { e.stopPropagation(); prev(); }}>
                <ChevronLeft />
              </button>
              <button className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30" aria-label="Next" onClick={(e) => { e.stopPropagation(); next(); }}>
                <ChevronRight />
              </button>
            </>
          )}
          <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={items[active].url} alt={items[active].alt} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
