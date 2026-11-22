import Link from "next/link";

export function AdminPagination({
  page, pages, total, basePath, params = {},
}: { page: number; pages: number; total: number; basePath: string; params?: Record<string, string | undefined> }) {
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <p>{total} total · page {page} of {pages}</p>
      {pages > 1 && (
        <div className="flex gap-2">
          {page > 1 ? <Link href={href(page - 1)} className="btn btn-sm border border-slate-300 bg-white">Previous</Link> : <span className="btn btn-sm border border-slate-200 text-slate-400">Previous</span>}
          {page < pages ? <Link href={href(page + 1)} className="btn btn-sm border border-slate-300 bg-white">Next</Link> : <span className="btn btn-sm border border-slate-200 text-slate-400">Next</span>}
        </div>
      )}
    </div>
  );
}

export const ADMIN_PAGE_SIZE = 10;
export function pageNum(v?: string) {
  return Math.max(1, Number(v) || 1);
}
