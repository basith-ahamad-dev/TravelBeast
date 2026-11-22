"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Pencil, Save, Star, Upload } from "lucide-react";
import { api } from "@/lib/client";
import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";
import { DeleteButton, EmptyState, Field, Notice } from "@/components/admin/ui";
import { Modal } from "@/components/admin/Modal";

export type GalleryRow = {
  id: string; title: string; description: string | null; url: string; featured: boolean;
  destinationId: string | null; packageId: string | null; destinationName?: string | null; packageTitle?: string | null;
};
type Opt = { id: string; name: string };

function UploadPanel({ destinations, packages }: { destinations: Opt[]; packages: Opt[] }) {
  const router = useRouter();
  const [imgs, setImgs] = useState<UploadedImage[]>([]);
  const [destinationId, setDest] = useState("");
  const [packageId, setPkg] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function save() {
    setBusy(true); setError(""); setDone("");
    const r = await api("/api/gallery", "POST", { images: imgs, destinationId: destinationId || null, packageId: packageId || null });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Could not save images");
    setDone(`${imgs.length} image(s) added to the gallery.`);
    setImgs([]);
    router.refresh();
  }

  return (
    <div className="card mb-8 space-y-4 p-6">
      <h2 className="text-lg">Upload images</h2>
      <ImageUploader multiple max={20} value={imgs} onChange={(v) => { setImgs(v); setDone(""); }} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Organise under destination (optional)">
          <select className="input" value={destinationId} onChange={(e) => setDest(e.target.value)}>
            <option value="">None</option>{destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Organise under package (optional)">
          <select className="input" value={packageId} onChange={(e) => setPkg(e.target.value)}>
            <option value="">None</option>{packages.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      {done && <Notice kind="success">{done}</Notice>}
      <button className="btn-primary btn-sm" disabled={busy || imgs.length === 0} onClick={save}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Add to gallery
      </button>
    </div>
  );
}

function EditForm({ row, destinations, packages, onClose }: { row: GalleryRow; destinations: Opt[]; packages: Opt[]; onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(row.title);
  const [description, setDescription] = useState(row.description ?? "");
  const [featured, setFeatured] = useState(row.featured);
  const [destinationId, setDest] = useState(row.destinationId ?? "");
  const [packageId, setPkg] = useState(row.packageId ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy(true); setError("");
    const r = await api(`/api/gallery/${row.id}`, "PUT", { title, description, featured, destinationId: destinationId || null, packageId: packageId || null });
    setBusy(false);
    if (!r.ok) return setError(r.data.fields?.title ?? r.data.error ?? "Could not save");
    onClose(); router.refresh();
  }
  return (
    <form onSubmit={save} className="space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-xl"><Image src={row.url} alt={row.title} fill sizes="640px" className="object-cover" /></div>
      {error && <Notice kind="error">{error}</Notice>}
      <Field label="Title *"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <Field label="Description"><textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Destination"><select className="input" value={destinationId} onChange={(e) => setDest(e.target.value)}><option value="">None</option>{destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
        <Field label="Package"><select className="input" value={packageId} onChange={(e) => setPkg(e.target.value)}><option value="">None</option>{packages.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4" /> Featured image</label>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-sm border border-slate-300" onClick={onClose}>Cancel</button>
        <button className="btn-primary btn-sm" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button>
      </div>
    </form>
  );
}

export function GalleryManager({ rows, destinations, packages }: { rows: GalleryRow[]; destinations: Opt[]; packages: Opt[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<GalleryRow | null>(null);

  async function toggleFeatured(r: GalleryRow) {
    await api(`/api/gallery/${r.id}`, "PUT", {
      title: r.title, description: r.description, featured: !r.featured, destinationId: r.destinationId, packageId: r.packageId,
    });
    router.refresh();
  }

  return (
    <>
      <UploadPanel destinations={destinations} packages={packages} />
      {rows.length === 0 ? (
        <EmptyState title="No gallery images" text="Upload your first images above." />
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {rows.map((r) => (
            <li key={r.id} className="card overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image src={r.url} alt={r.title} fill sizes="260px" className="object-cover" />
                <button
                  onClick={() => toggleFeatured(r)}
                  aria-label={r.featured ? "Unfeature image" : "Feature image"}
                  aria-pressed={r.featured}
                  className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow hover:bg-white"
                >
                  <Star className={`h-4 w-4 ${r.featured ? "fill-gold text-gold" : "text-slate-400"}`} />
                </button>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{r.title}</p>
                <p className="truncate text-xs text-slate-500">{r.destinationName || r.packageTitle || "Unassigned"}</p>
                <div className="mt-2 flex justify-end">
                  <button className="grid h-9 w-9 place-items-center rounded-lg text-ocean hover:bg-mist" aria-label={`Edit ${r.title}`} onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></button>
                  <DeleteButton url={`/api/gallery/${r.id}`} label={r.title} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing && (
        <Modal title="Edit image" onClose={() => setEditing(null)}>
          <EditForm row={editing} destinations={destinations} packages={packages} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}
