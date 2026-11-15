import { cn } from "@/lib/utils";

export const WAVE = {
  deep: "#07365a",
  teal: "#0a74c0",
  sky: "#3fb8e8",
  orange: "#ff4b14",
  amber: "#ff9a12",
  gold: "#f7cf1c",
  white: "#ffffff",
} as const;

const STEP = 10; // px between stacked wave crests
const CREST = 28; // px height of one wave

/**
 * Striped, scalloped section divider. `layers` are painted top to bottom; the LAST colour should be
 * the colour of the section that follows. With `flip`, the band hangs from the section above instead
 * (give it that section's colour via `bg`).
 */
export function WaveBand({ layers, bg, flip, className }: { layers: string[]; bg?: string; flip?: boolean; className?: string }) {
  const height = CREST + (layers.length - 1) * STEP;
  return (
    <div
      aria-hidden
      className={cn(!className?.includes("absolute") && "relative", "w-full overflow-hidden", className)}
      style={{ height, background: bg, transform: flip ? "scaleY(-1)" : undefined }}
    >
      {layers.map((color, i) => (
        <div key={i} className="wave-layer" style={{ top: i * STEP, background: color, ["--wave-x" as string]: `${(i * 41) % 110}px` }} />
      ))}
    </div>
  );
}
