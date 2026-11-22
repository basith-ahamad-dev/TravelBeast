"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { api } from "@/lib/client";
import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";
import { Field, Notice, Switch } from "@/components/admin/ui";

export type PackageFormData = {
  id?: string;
  title: string;
  shortDescription: string;
  description: string;
  durationDays: number;
  durationNights: number;
  price: number;
  currency: string;
  destinationId: string;
  included: string[];
  excluded: string[];
  importantInfo: string;
  featured: boolean;
  published: boolean;
  cover: UploadedImage | null;
  images: UploadedImage[];
  itinerary: { title: string; description: string }[];
};

export const emptyPackage: PackageFormData = {
  title: "", shortDescription: "", description: "", durationDays: 5, durationNights: 4, price: 0, currency: "USD",
  destinationId: "", included: [], excluded: [], importantInfo: "", featured: false, published: false,
  cover: null, images: [], itinerary: [],
};

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export function PackageForm({ initial, destinations }: { initial: PackageFormData; destinations: { id: string; name: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [included, setIncluded] = useState(initial.included.join("\n"));
  const [excluded, setExcluded] = useState(initial.excluded.join("\n"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const set = <K extends keyof PackageFormData>(k: K, v: PackageFormData[K]) => setF((p) => ({ ...p, [k]: v }));
  const e = (k: string) => fields[k];

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy(true); setError(""); setFields({});
    const body = { ...f, included: lines(included), excluded: lines(excluded), id: undefined };
    const r = await api<{ id: string }>(f.id ? `/api/packages/${f.id}` : "/api/packages", f.id ? "PUT" : "POST", body);
    setBusy(false);
    if (!r.ok) { setError(r.data.error ?? "Could not save"); setFields(r.data.fields ?? {}); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    router.push("/admin/packages");
    router.refresh();
  }

  const moveDay = (i: number, d: number) => {
    const a = [...f.itinerary]; const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    set("itinerary", a);
  };

  return (
    <form onSubmit={save} className="space-y-8" noValidate>
      {error && <Notice kind="error">{error}</Notice>}

      <section className="card space-y-4 p-6">
        <h2 className="text-lg">Basic details</h2>
        <Field label="Package title *" error={e("title")}>
          <input className="input" value={f.title} onChange={(x) => set("title", x.target.value)} maxLength={120} />
        </Field>
        <Field label="Short description * (shown on cards)" error={e("shortDescription")}>
          <textarea className="input" rows={2} value={f.shortDescription} onChange={(x) => set("shortDescription", x.target.value)} maxLength={300} />
        </Field>
        <Field label="Full description" error={e("description")}>
          <textarea className="input" rows={6} value={f.description} onChange={(x) => set("description", x.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Destination *" error={e("destinationId")}>
            <select className="input" value={f.destinationId} onChange={(x) => set("destinationId", x.target.value)}>
              <option value="">Select…</option>
              {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Days *" error={e("durationDays")}>
            <input type="number" min={1} className="input" value={f.durationDays} onChange={(x) => set("durationDays", Number(x.target.value))} />
          </Field>
          <Field label="Nights *" error={e("durationNights")}>
            <input type="number" min={0} className="input" value={f.durationNights} onChange={(x) => set("durationNights", Number(x.target.value))} />
          </Field>
          <Field label="Starting price *" error={e("price")}>
            <div className="flex gap-2">
              <select className="input !w-24" value={f.currency} onChange={(x) => set("currency", x.target.value)} aria-label="Currency">
                {["USD", "EUR", "GBP", "AUD", "AED", "INR", "LKR", "MVR", "THB"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="number" min={0} className="input" value={f.price} onChange={(x) => set("price", Number(x.target.value))} />
            </div>
          </Field>
        </div>
        <div className="flex flex-wrap gap-8 pt-2">
          <Switch checked={f.published} onChange={(v) => set("published", v)} label="Published" />
          <Switch checked={f.featured} onChange={(v) => set("featured", v)} label="Featured on homepage" />
        </div>
      </section>

      <section className="card space-y-5 p-6">
        <h2 className="text-lg">Images</h2>
        <ImageUploader label="Cover image" value={f.cover ? [f.cover] : []} onChange={(v) => set("cover", v[0] ?? null)} hint="Shown on cards and at the top of the package page." />
        <ImageUploader label="Gallery images" multiple max={20} value={f.images} onChange={(v) => set("images", v)} />
      </section>

      <section className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Itinerary</h2>
          <button type="button" className="btn-outline btn-sm" onClick={() => set("itinerary", [...f.itinerary, { title: "", description: "" }])}>
            <Plus className="h-4 w-4" /> Add day
          </button>
        </div>
        {f.itinerary.length === 0 && <p className="text-sm text-slate-500">No itinerary days yet.</p>}
        {f.itinerary.map((d, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-heading text-sm font-semibold text-ocean">Day {i + 1}</p>
              <div className="flex gap-1">
                <button type="button" onClick={() => moveDay(i, -1)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-mist" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => moveDay(i, 1)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-mist" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => set("itinerary", f.itinerary.filter((_, k) => k !== i))} className="grid h-8 w-8 place-items-center rounded-lg text-red-600 hover:bg-red-50" aria-label="Remove day"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <input className="input" placeholder="Day title" value={d.title} onChange={(x) => set("itinerary", f.itinerary.map((o, k) => (k === i ? { ...o, title: x.target.value } : o)))} />
                {e(`itinerary.${i}.title`) && <p className="mt-1 text-sm text-red-600">{e(`itinerary.${i}.title`)}</p>}
              </div>
              <div>
                <textarea className="input" rows={2} placeholder="What happens on this day" value={d.description} onChange={(x) => set("itinerary", f.itinerary.map((o, k) => (k === i ? { ...o, description: x.target.value } : o)))} />
                {e(`itinerary.${i}.description`) && <p className="mt-1 text-sm text-red-600">{e(`itinerary.${i}.description`)}</p>}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg">Services & information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Included services (one per line)">
            <textarea className="input" rows={7} value={included} onChange={(x) => setIncluded(x.target.value)} />
          </Field>
          <Field label="Excluded services (one per line)">
            <textarea className="input" rows={7} value={excluded} onChange={(x) => setExcluded(x.target.value)} />
          </Field>
        </div>
        <Field label="Important information">
          <textarea className="input" rows={4} value={f.importantInfo} onChange={(x) => set("importantInfo", x.target.value)} />
        </Field>
      </section>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <button type="button" className="btn btn-sm border border-slate-300" onClick={() => router.push("/admin/packages")}>Cancel</button>
        <button type="submit" disabled={busy} className="btn-primary btn-sm">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {f.id ? "Save changes" : "Create package"}
        </button>
      </div>
    </form>
  );
}
