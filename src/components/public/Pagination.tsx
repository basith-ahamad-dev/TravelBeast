import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Link-based pagination that preserves other query params. */
export function Pagination({
  page,
  pages,
  basePath,
  params = {},
}: {
  page: number;
  pages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  const item = "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-medium";
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 && (
        <Link href={href(page - 1)} className={cn(item, "bg-white shadow-card hover:bg-mist")} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - nums[i - 1] > 1 && <span className="text-slate-400">…</span>}
          <Link
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(item, n === page ? "bg-ocean text-white" : "bg-white shadow-card hover:bg-mist")}
          >
            {n}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} className={cn(item, "bg-white shadow-card hover:bg-mist")} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
