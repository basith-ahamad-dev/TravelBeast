import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  return (
    <div className={cn("mb-10 max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className={cn("mb-2 text-sm font-bold uppercase tracking-widest", light ? "text-gold" : "text-sunset-dark")}>
          {eyebrow}
        </p>
      )}
      <h2 className={cn("h-section", light && "text-white")}>{title}</h2>
      {subtitle && <p className={cn("mt-3 text-base sm:text-lg", light ? "text-white/80" : "text-slate-600")}>{subtitle}</p>}
    </div>
  );
}
