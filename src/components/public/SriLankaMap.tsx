"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MapPin, Star } from "lucide-react";
import { googleMapsUrl, mapImage, mapLocations, type MapLocation } from "@/data/sri-lanka-map";

/* Brand colours for this component */
const ORANGE = "#F04418";
const OCEAN = "#12649A";
const GOLD = "#FFC928";
const DEEP = "#07558A";

const CARD_W = 260;
const THUMB_H = 130;
const EDGE = 8; // keep the card at least this far from the viewport edge
const HEADER_H = 110; // sticky header height the card must not slide under

type Placement = { above: boolean; dx: number };

/** Crop a region of the map artwork to use as the card photo. */
function thumbStyle(loc: MapLocation): React.CSSProperties {
  if (loc.image) return { backgroundImage: `url(${loc.image})`, backgroundSize: "cover", backgroundPosition: "center" };
  const w = loc.thumb?.w ?? 22;
  const cx = loc.thumb?.x ?? loc.left;
  const cy = loc.thumb?.y ?? loc.top;
  const ratio = mapImage.width / mapImage.height;
  const h = w * ratio * (THUMB_H / CARD_W); // region height as % of the map height
  const px = Math.min(100, Math.max(0, ((cx - w / 2) / (100 - w)) * 100));
  const py = Math.min(100, Math.max(0, ((cy - h / 2) / (100 - h)) * 100));
  return { backgroundImage: `url(${mapImage.src})`, backgroundSize: `${(100 / w) * 100}% auto`, backgroundPosition: `${px}% ${py}%` };
}

export function SriLankaMap({ locations = mapLocations }: { locations?: MapLocation[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Placement>({ above: true, dx: 0 });

  const mapRef = useRef<HTMLDivElement>(null);
  const anchorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastPointer = useRef<string>("mouse");

  const open = useCallback((id: string) => {
    clearTimeout(closeTimer.current);
    setActiveId(id);
  }, []);
  const scheduleClose = useCallback((id: string) => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveId((cur) => (cur === id ? null : cur)), 180);
  }, []);

  /** Smart edge detection: flip below the pin near the top, and slide sideways near the left/right edges. */
  const place = useCallback((id: string) => {
    const anchor = anchorRefs.current[id];
    const card = cardRefs.current[id];
    if (!anchor || !card) return;
    const a = anchor.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const cardW = Math.min(CARD_W, vw - EDGE * 2);
    const cardH = card.offsetHeight || 290;
    const mapTop = mapRef.current?.getBoundingClientRect().top ?? 0;
    const roomAbove = a.top - Math.max(mapTop, HEADER_H);
    const roomBelow = window.innerHeight - a.bottom;
    // above when it fits; otherwise flip below if that side has more room
    const above = roomAbove >= cardH + 16 || roomAbove > roomBelow;
    const desiredLeft = Math.min(Math.max(a.left + a.width / 2 - cardW / 2, EDGE), vw - EDGE - cardW);
    const dx = Math.round(desiredLeft - a.left);
    setPlacement((p) => (p.above === above && p.dx === dx ? p : { above, dx }));
  }, []);

  useLayoutEffect(() => {
    if (!activeId) return;
    place(activeId);
    const onMove = () => place(activeId);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, { passive: true });
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove);
    };
  }, [activeId, place]);

  // tap/click outside closes the open card; Escape too
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.("[data-map-pin]")) setActiveId(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActiveId(null);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div ref={mapRef} className="relative -ml-[11%] w-[118%] max-w-none sm:ml-0 sm:w-full">
        <Image
          src={mapImage.src}
          alt={mapImage.alt}
          width={mapImage.width}
          height={mapImage.height}
          sizes="(min-width:1280px) 1280px, 100vw"
          priority={false}
          className="block h-auto w-full select-none"
          draggable={false}
        />

        {locations.map((loc) => {
          const active = activeId === loc.id;
          const shown = active;
          const { above, dx } = placement;
          return (
            <div
              key={loc.id}
              data-map-pin
              className="absolute h-0 w-0"
              style={{ top: `${loc.top}%`, left: `${loc.left}%`, zIndex: active ? 40 : 10 }}
              onPointerEnter={(e) => {
                lastPointer.current = e.pointerType;
                if (e.pointerType === "mouse") open(loc.id);
              }}
              onPointerLeave={(e) => e.pointerType === "mouse" && scheduleClose(loc.id)}
              onFocus={(e) => {
                if ((e.target as HTMLElement).matches(":focus-visible")) open(loc.id);
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) scheduleClose(loc.id);
              }}
            >
              <div
                ref={(el) => {
                  anchorRefs.current[loc.id] = el;
                }}
                className="absolute left-0 top-0 h-9 w-9 -translate-x-1/2 -translate-y-1/2"
              >
                <button
                  type="button"
                  aria-expanded={shown}
                  aria-label={`${loc.name}: show details`}
                  onPointerDown={(e) => (lastPointer.current = e.pointerType)}
                  onClick={() => {
                    if (lastPointer.current === "mouse") open(loc.id);
                    else setActiveId((cur) => (cur === loc.id ? null : loc.id)); // tap / keyboard toggles
                  }}
                  className={`relative grid h-9 w-9 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#12649A] focus-visible:ring-offset-2`}
                >
                  <span aria-hidden className="map-pin-pulse absolute h-[18px] w-[18px] rounded-full sm:h-[22px] sm:w-[22px]" style={{ background: active ? OCEAN : ORANGE }} />
                  <span
                    aria-hidden
                    className="relative block h-[18px] w-[18px] rounded-full border-[3px] border-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition duration-200 sm:h-[22px] sm:w-[22px]"
                    style={{ background: active ? OCEAN : ORANGE, transform: active ? "scale(1.25)" : undefined }}
                  />
                </button>

                {/* hover card (stays mounted so it can fade/slide; the padding bridges the gap to the pin) */}
                <div
                  className={`absolute w-[260px] max-w-[calc(100vw-16px)] transition duration-200 ease-out ${above ? "bottom-full pb-2" : "top-full pt-2"} ${shown ? "visible translate-y-0 opacity-100" : `pointer-events-none invisible opacity-0 ${above ? "translate-y-2" : "-translate-y-2"}`}`}
                  style={{ left: dx }}
                >
                  <div
                    ref={(el) => {
                      cardRefs.current[loc.id] = el;
                    }}
                    role="dialog"
                    aria-label={loc.name}
                    className="overflow-hidden rounded-2xl bg-white/95 text-left backdrop-blur-md"
                    style={{ boxShadow: "0 12px 30px rgba(7,85,138,0.18)" }}
                  >
                    <div role="img" aria-label={`${loc.name} illustration`} className="w-full bg-[#fcf9ec]" style={{ height: THUMB_H, ...thumbStyle(loc) }} />
                    <div className="p-3.5">
                      <h3 className="text-[17px] font-bold leading-snug" style={{ color: DEEP }}>{loc.name}</h3>
                      <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-slate-600">{loc.description}</p>
                      {loc.rating != null && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-[13px]">
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold" style={{ background: "#fff6d6", color: "#7a5a00" }}>
                            <Star className="h-3.5 w-3.5" style={{ fill: GOLD, color: GOLD }} aria-hidden /> {loc.rating.toFixed(1)}
                          </span>
                          {loc.reviews != null && <span className="text-slate-500">({loc.reviews} reviews)</span>}
                        </div>
                      )}
                      <Link
                        href={loc.href}
                        className="mt-3 block w-full rounded-full px-4 py-2.5 text-center text-sm font-semibold text-slate-900 transition-colors duration-200 hover:!bg-[#F04418] hover:text-white focus-visible:!bg-[#F04418] focus-visible:text-white"
                        style={{ background: GOLD }}
                      >
                        Explore {loc.name.split(",")[0].replace(/\s*\(.*\)/, "")}
                      </Link>
                      <a
                        href={googleMapsUrl(loc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:brightness-110"
                        style={{ background: OCEAN, borderColor: OCEAN }}
                      >
                        <MapPin className="h-4 w-4" aria-hidden /> View on Google Maps
                      </a>
                    </div>
                  </div>
                  {/* little pointer toward the pin */}
                  <span
                    aria-hidden
                    className={`absolute h-3 w-3 rotate-45 bg-white ${above ? "bottom-[2px]" : "top-[2px]"}`}
                    style={{ left: 18 - dx - 6, boxShadow: above ? "3px 3px 6px rgba(7,85,138,0.08)" : "-3px -3px 6px rgba(7,85,138,0.08)" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
