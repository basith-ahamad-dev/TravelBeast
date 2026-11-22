"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageIcon, Loader2, Pencil, Plus, Save } from "lucide-react";
import { api } from "@/lib/client";
import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";
import { DeleteButton, EmptyState, Field, Notice, Switch, ToggleButton } from "@/components/admin/ui";
import { Modal } from "@/components/admin/Modal";

export type DestRow = {
  id: string; name: string; country: string | null; shortDescription: string; description: string;
  coverUrl: string | null; coverPublicId: string | null; published: boolean; featured: boolean; packageCount: number;
};

function DestForm({ initial, onClose }: { initial?: DestRow; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [shortDescription, setShort] = useState(initial?.shortDescription ?? "");
  const [description, setDesc] = useState(initial?.description ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [cover, setCover] = useState<UploadedImage[]>(initial?.coverUrl ? [{ url: initial.coverUrl, publicId: initial.coverPublicId }] : []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy(true); setError(""); setFields({});
    const r = await api(initial ? `/api/destinations/${initial.id}` : "/api/destinations", initial ? "PUT" : "POST", {
      name, country, shortDescription, description, published, featured, cover: cover[0] ?? null,
    });
    setBusy(false);
    if (!r.ok) { setError(r.data.error ?? "Could not save"); setFields(r.data.fields ?? {}); return; }
    onClose();
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-4" noValidate>
      {error && <Notice kind="error">{error}</Notice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *" error={fields.name}><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Country" error={fields.country}><input className="input" value={country} onChange={(e) => setCountry(e.target.value)} /></Field>
      </div>
      <Field label="Short description *" error={fields.shortDescription}><textarea className="input" rows={2} value={shortDescription} onChange={(e) => setShort(e.target.value)} /></Field>
      <Field label="Full description"><textarea className="input" rows={5} value={description} onChange={(e) => setDesc(e.target.value)} /></Field>
      <ImageUploader label="Cover image" value={cover} onChange={setCover} />
      <div className="flex flex-wrap gap-8">
        <Switch checked={published} onChange={setPublished} label="Published" />
        <Switch checked={featured} onChange={setFeatured} label="Featured on homepage" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-sm border border-slate-300" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary btn-sm" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
      </div>
    </form>
  );
}

export function DestinationsManager({ rows }: { rows: DestRow[] }) {
  const [editing, setEditing] = useState<DestRow | "new" | null>(null);
  return (
    <>
      <div className="mb-4 flex justify-end">
        <button className="btn-primary btn-sm" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> Add destination</button>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No destinations yet" text="Add your first destination to start creating packages." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-mist text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="p-4">Destination</th><th className="p-4">Packages</th><th className="p-4">Status</th><th className="p-4">Featured</th><th className="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-slate-50 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-mist">
                        {d.coverUrl ? <Image src={d.coverUrl} alt="" fill sizes="64px" className="object-cover" /> : <ImageIcon className="m-auto mt-3 h-6 w-6 text-slate-400" />}
                      </div>
                      <div><p className="font-semibold">{d.name}</p><p className="text-xs text-slate-500">{d.country}</p></div>
                    </div>
                  </td>
                  <td className="p-4">{d.packageCount}</td>
                  <td className="p-4"><ToggleButton url={`/api/destinations/${d.id}`} field="published" value={d.published} onLabel="Published" offLabel="Hidden" /></td>
                  <td className="p-4"><ToggleButton url={`/api/destinations/${d.id}`} field="featured" value={d.featured} onLabel="Featured" offLabel="No" onClass="bg-gold/30 text-amber-800" /></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <button className="grid h-9 w-9 place-items-center rounded-lg text-ocean hover:bg-mist" aria-label={`Edit ${d.name}`} onClick={() => setEditing(d)}><Pencil className="h-4 w-4" /></button>
                      <DeleteButton url={`/api/destinations/${d.id}`} label={d.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <Modal title={editing === "new" ? "Add destination" : `Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <DestForm initial={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}
