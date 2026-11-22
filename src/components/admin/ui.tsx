"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";

export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 rounded-full transition", checked ? "bg-ocean" : "bg-slate-300")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </button>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

export function Notice({ kind, children }: { kind: "error" | "success"; children: ReactNode }) {
  const Icon = kind === "error" ? AlertCircle : CheckCircle2;
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2 rounded-xl p-3 text-sm", kind === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700")}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" /> <span>{children}</span>
    </p>
  );
}

/** Confirm-then-DELETE button used in tables. */
export function DeleteButton({ url, label = "this item", onDone }: { url: string; label?: string; onDone?: () => void }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setBusy(true);
    const r = await api(url, "DELETE");
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Delete failed");
    setConfirm(false);
    onDone?.();
    router.refresh();
  }

  return (
    <>
      <button type="button" onClick={() => { setError(""); setConfirm(true); }} className="grid h-9 w-9 place-items-center rounded-lg text-red-600 hover:bg-red-50" aria-label={`Delete ${label}`}>
        <Trash2 className="h-4 w-4" />
      </button>
      {confirm && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4" role="alertdialog" aria-modal="true" onClick={() => !busy && setConfirm(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg">Delete {label}?</h3>
            <p className="mt-1 text-sm text-slate-600">This cannot be undone. Related images will also be removed.</p>
            {error && <div className="mt-3"><Notice kind="error">{error}</Notice></div>}
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn btn-sm border border-slate-300" disabled={busy} onClick={() => setConfirm(false)}>Cancel</button>
              <button className="btn-danger btn-sm" disabled={busy} onClick={run}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Inline publish/feature toggle that PATCHes a record. */
export function ToggleButton({
  url,
  field,
  value,
  onLabel,
  offLabel,
  onClass = "bg-emerald-100 text-emerald-700",
}: {
  url: string;
  field: string;
  value: boolean;
  onLabel: string;
  offLabel: string;
  onClass?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function toggle() {
    setBusy(true);
    await api(url, "PATCH", { [field]: !value });
    setBusy(false);
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title="Click to toggle"
      className={cn("badge cursor-pointer transition hover:opacity-80 disabled:opacity-50", value ? onClass : "bg-slate-100 text-slate-600")}
    >
      {value ? onLabel : offLabel}
    </button>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
