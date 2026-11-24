"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, Mail, Phone } from "lucide-react";
import { api } from "@/lib/client";
import { DeleteButton, EmptyState, Notice } from "@/components/admin/ui";
import { Modal } from "@/components/admin/Modal";
import { cn, formatDate } from "@/lib/utils";

export type InquiryRow = {
  id: string; name: string; email: string; phone: string | null; message: string;
  status: "PENDING" | "CONTACTED" | "COMPLETED"; createdAt: string; packageTitle: string | null;
};

const styles = {
  PENDING: "bg-amber-100 text-amber-800",
  CONTACTED: "bg-sky/20 text-deep",
  COMPLETED: "bg-emerald-100 text-emerald-700",
} as const;

function StatusSelect({ row }: { row: InquiryRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function change(status: string) {
    setBusy(true); setError("");
    const r = await api(`/api/inquiries/${row.id}`, "PATCH", { status });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Failed");
    router.refresh();
  }
  return (
    <>
      <select
        aria-label="Inquiry status"
        value={row.status}
        disabled={busy}
        onChange={(e) => change(e.target.value)}
        className={cn("rounded-full border-0 px-3 py-1 text-xs font-semibold", styles[row.status])}
      >
        <option value="PENDING">Pending</option>
        <option value="CONTACTED">Contacted</option>
        <option value="COMPLETED">Completed</option>
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </>
  );
}

export function InquiriesManager({ rows, filter }: { rows: InquiryRow[]; filter?: string }) {
  const router = useRouter();
  const [view, setView] = useState<InquiryRow | null>(null);
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {[["", "All"], ["PENDING", "Pending"], ["CONTACTED", "Contacted"], ["COMPLETED", "Completed"]].map(([v, l]) => (
          <a key={v} href={v ? `/admin/inquiries?status=${v}` : "/admin/inquiries"} className={cn("badge px-4 py-1.5 text-sm", (filter ?? "") === v ? "bg-ocean text-white" : "bg-white ring-1 ring-slate-200 hover:bg-mist")}>{l}</a>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No inquiries" text="Customer inquiries from the website will appear here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-mist text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="p-4">From</th><th className="p-4">Message</th><th className="p-4">Received</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 align-top last:border-0">
                  <td className="p-4"><p className="font-semibold">{r.name}</p><p className="text-xs text-slate-500">{r.email}</p>{r.packageTitle && <p className="mt-1 text-xs text-ocean">Re: {r.packageTitle}</p>}</td>
                  <td className="max-w-xs p-4 text-slate-600"><p className="line-clamp-2">{r.message}</p></td>
                  <td className="whitespace-nowrap p-4 text-slate-500">{formatDate(r.createdAt)}</td>
                  <td className="p-4"><StatusSelect row={r} /></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <button className="grid h-9 w-9 place-items-center rounded-lg text-ocean hover:bg-mist" aria-label={`View inquiry from ${r.name}`} onClick={() => setView(r)}><Eye className="h-4 w-4" /></button>
                      <DeleteButton url={`/api/inquiries/${r.id}`} label={`inquiry from ${r.name}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {view && (
        <Modal title="Inquiry details" onClose={() => setView(null)}>
          <div className="space-y-4 text-[15px]">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><p className="text-xs uppercase text-slate-500">Name</p><p className="font-semibold">{view.name}</p></div>
              <div><p className="text-xs uppercase text-slate-500">Received</p><p>{formatDate(view.createdAt)}</p></div>
              <div><p className="text-xs uppercase text-slate-500">Email</p><a className="inline-flex items-center gap-1.5 text-ocean" href={`mailto:${view.email}`}><Mail className="h-4 w-4" />{view.email}</a></div>
              <div><p className="text-xs uppercase text-slate-500">Phone</p>{view.phone ? <a className="inline-flex items-center gap-1.5 text-ocean" href={`tel:${view.phone}`}><Phone className="h-4 w-4" />{view.phone}</a> : <p className="text-slate-400">Not provided</p>}</div>
            </div>
            {view.packageTitle && <Notice kind="success">About package: {view.packageTitle}</Notice>}
            <div><p className="text-xs uppercase text-slate-500">Message</p><p className="mt-1 whitespace-pre-line rounded-xl bg-mist p-4">{view.message}</p></div>
            <div className="flex justify-end gap-2">
              <button className="btn-blue btn-sm" onClick={async () => { await api(`/api/inquiries/${view.id}`, "PATCH", { status: "CONTACTED" }); setView(null); router.refresh(); }}>Mark as contacted</button>
              <button className="btn-primary btn-sm" onClick={async () => { await api(`/api/inquiries/${view.id}`, "PATCH", { status: "COMPLETED" }); setView(null); router.refresh(); }}>Mark as completed</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
