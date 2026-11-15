import Image from "next/image";
import { cn } from "@/lib/utils";

/** Brand mascot slot: the template perches a parrot here, TravelBeast uses its own pin mark. */
export function BrandMark({ className }: { className?: string }) {
  return <Image src="/logo-center.png" alt="" aria-hidden width={300} height={282} className={cn("pointer-events-none select-none object-contain", className)} />;
}

/** Giant faded word behind a section (ABOUT US, DESTINATIONS...). Colour comes from `className`. */
export function Watermark({ text, className }: { text: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 select-none overflow-hidden whitespace-nowrap text-center font-display text-[clamp(80px,17vw,270px)] font-extrabold uppercase leading-[0.9]",
        className,
      )}
      style={{ WebkitMaskImage: "linear-gradient(to bottom,#000 25%,transparent 100%)", maskImage: "linear-gradient(to bottom,#000 25%,transparent 100%)" }}
    >
      {text}
    </div>
  );
}

/** Script kicker + condensed uppercase title (second part in the accent colour) + optional blurb. */
export function DisplayHeading({
  script,
  title,
  accent,
  tone = "light",
  mark,
  children,
  className,
}: {
  script: string;
  title: string;
  accent: string;
  tone?: "light" | "dark";
  mark?: "left" | "right";
  children?: React.ReactNode;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("relative mx-auto max-w-4xl text-center", className)}>
      <p className={cn("relative z-10 -mb-2 font-script text-[34px] leading-none sm:text-[46px]", dark ? "text-gold" : "text-ocean")}>{script}</p>
      <h2
        className={cn(
          "font-display text-[clamp(34px,5.2vw,66px)] font-extrabold uppercase leading-[0.95] tracking-tight",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title} <span className={dark ? "text-gold" : "text-sunset"}>{accent}</span>
      </h2>
      {children && <p className={cn("mx-auto mt-4 max-w-xl text-[15px]", dark ? "text-white/90" : "text-ink")}>{children}</p>}
    </div>
  );
}
