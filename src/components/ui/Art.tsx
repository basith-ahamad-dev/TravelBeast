import { cn } from "@/lib/utils";

export type ArtName =
  | "boat" | "tube" | "tube2" | "compass" | "landscape" | "notepad" | "envelope" | "growth" | "support"
  | "surfer" | "surfer2" | "lifebuoy" | "sun" | "sparkle" | "sparkle-gold" | "surfboard" | "instructor" | "group" | "wave";

/** Decorative brand illustration (orange line art from the design set). Purely presentational. */
export function Art({ name, className, style }: { name: ArtName; className?: string; style?: React.CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/art/${name}.png`} alt="" aria-hidden loading="lazy" draggable={false} style={style} className={cn("pointer-events-none select-none object-contain", className)} />
  );
}
