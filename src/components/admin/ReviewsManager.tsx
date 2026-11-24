"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Pencil, Plus, Save, Star } from "lucide-react";
import { api } from "@/lib/client";
import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";
import { DeleteButton, EmptyState, Field, Notice, Switch, ToggleButton } from "@/components/admin/ui";
import { Modal } from "@/components/admin/Modal";
import { Stars } from "@/components/ui/Stars";

export type ReviewRow = {
  id: string; customerName: string; location: string | null; rating: number; text: string; published: boolean;
  packageId: string | null; avatarUrl: string | null; avatarPublicId: string | null;
  images: { url: string; publicId: string | null }[]; createdAt: string;
};

function ReviewForm({ initial, packages, onClose }: { initial?: ReviewRow; packages: { id: string; title: string }[]; onClose: () => void }) {
  const router = useRouter();
  const [customerName, setName] = useState(initial?.customerName ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [text, setText] = useState(initial?.text ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [packageId, setPackageId] = useState(initial?.packageId ?? "");
  const [avatar, setAvatar] = useState<UploadedImage[]>(initial?.avatarUrl ? [{ url: initial.avatarUrl, publicId: initial.avatarPublicId }] : []);
  const [images, setImages] = useState<UploadedImage[]>(initial?.images ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy(true); setError(""); setFields({});
    const r = await api(initial ? `/api/reviews/${initial.id}` : "/api/reviews", initial ? "PUT" : "POST", {
      customerName, location, rating, text, published, packageId: packageId || null, avatar: avatar[0] ?? null, images,
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
        <Field label="Customer name *" error={fields.customerName}><input className="input" value={customerName} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Location"><input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" /></Field>
      </div>
      <Field label="Star rating *">
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)}>
              <Star className={`h-8 w-8 ${n <= rating ? "fill-gold text-gold" : "text-slate-300"}`} />
            </button>
          ))}
        </div>
      </Field>
      <Field label="Review *" error={fields.text}><textarea className="input" rows={4} value={text} onChange={(e) => setText(e.target.value)} /></Field>
      <Field label="Related package (optional)">
        <select className="input" value={packageId} onChange={(e) => setPackageId(e.target.value)}>
          <option value="">None</option>
          {packages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </Field>
      <ImageUploader label="Customer photo (optional)" value={avatar} onChange={setAvatar} />
      <ImageUploader label="Travel photos (optional)" multiple max={6} value={images} onChange={setImages} />
      <Switch checked={published} onChange={setPublished} label="Published on website" />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-sm border border-slate-300" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary btn-sm" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
      </div>
    </form>
  );
}

export function ReviewsManager({ rows, packages }: { rows: ReviewRow[]; packages: { id: string; title: string }[] }) {
  const [editing, setEditing] = useState<ReviewRow | "new" | null>(null);
  return (
    <>
      <div className="mb-4 flex justify-end">
        <button className="btn-primary btn-sm" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> Add review</button>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No reviews yet" text="Add customer reviews to show them on the homepage." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-mist text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="p-4">Customer</th><th className="p-4">Rating</th><th className="p-4">Review</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 align-top last:border-0">
                  <td className="p-4"><p className="font-semibold">{r.customerName}</p><p className="text-xs text-slate-500">{r.location}</p></td>
                  <td className="p-4"><Stars rating={r.rating} size={14} /></td>
                  <td className="max-w-sm p-4 text-slate-600"><p className="line-clamp-2">{r.text}</p>{r.images.length > 0 && <p className="mt-1 text-xs text-slate-400">{r.images.length} photo(s)</p>}</td>
                  <td className="p-4"><ToggleButton url={`/api/reviews/${r.id}`} field="published" value={r.published} onLabel="Published" offLabel="Hidden" /></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <button className="grid h-9 w-9 place-items-center rounded-lg text-ocean hover:bg-mist" aria-label={`Edit review by ${r.customerName}`} onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></button>
                      <DeleteButton url={`/api/reviews/${r.id}`} label={`review by ${r.customerName}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <Modal title={editing === "new" ? "Add review" : "Edit review"} onClose={() => setEditing(null)}>
          <ReviewForm initial={editing === "new" ? undefined : editing} packages={packages} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}
