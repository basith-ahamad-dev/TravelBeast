"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { Loader2, UploadCloud, X, Star } from "lucide-react";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";

export type UploadedImage = {
  url: string;
  publicId?: string | null;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  alt?: string | null;
};

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Multi/single image uploader with previews. Uploads immediately to /api/upload
 * and reports the stored metadata via onChange. Images uploaded in this session
 * but removed before saving are deleted from storage right away.
 */
export function ImageUploader({
  value,
  onChange,
  multiple = false,
  max = 12,
  label,
  hint,
}: {
  value: UploadedImage[];
  onChange: (v: UploadedImage[]) => void;
  multiple?: boolean;
  max?: number;
  label?: string;
  hint?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const fresh = useRef(new Set<string>());
  const [busy, setBusy] = useState<{ id: string; preview: string }[]>([]);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);

  async function handleFiles(list: FileList | File[]) {
    setError("");
    let files = Array.from(list);
    const room = multiple ? max - value.length : 1;
    if (files.length > room) {
      setError(multiple ? `You can add ${Math.max(room, 0)} more image(s) (max ${max}).` : "");
      files = files.slice(0, Math.max(room, 1));
    }
    for (const f of files) {
      if (!TYPES.includes(f.type)) return setError(`"${f.name}" must be a JPG, PNG or WebP image.`);
      if (f.size > MAX_BYTES) return setError(`"${f.name}" is larger than 8 MB.`);
    }
    if (files.length === 0) return;

    const previews = files.map((f) => ({ id: crypto.randomUUID(), preview: URL.createObjectURL(f) }));
    setBusy((b) => [...b, ...previews]);
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Upload failed. Please try again.");
      } else {
        const imgs = data.images as UploadedImage[];
        imgs.forEach((i) => i.publicId && fresh.current.add(i.publicId));
        onChange(multiple ? [...value, ...imgs] : imgs.slice(0, 1));
      }
    } catch {
      setError("Network error during upload.");
    } finally {
      previews.forEach((p) => URL.revokeObjectURL(p.preview));
      setBusy((b) => b.filter((x) => !previews.some((p) => p.id === x.id)));
      if (input.current) input.current.value = "";
    }
  }

  async function remove(img: UploadedImage) {
    onChange(value.filter((v) => v.url !== img.url));
    if (img.publicId && fresh.current.has(img.publicId)) {
      fresh.current.delete(img.publicId);
      await api("/api/upload", "DELETE", { publicId: img.publicId });
    }
  }

  function makeFirst(img: UploadedImage) {
    onChange([img, ...value.filter((v) => v.url !== img.url)]);
  }

  return (
    <div>
      {label && <p className="label">{label}</p>}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-4 transition",
          drag ? "border-ocean bg-ocean/5" : "border-slate-300 bg-slate-50",
        )}
      >
        {(value.length > 0 || busy.length > 0) && (
          <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {value.map((img, i) => (
              <li key={img.url} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-white ring-1 ring-black/10">
                <Image src={img.url} alt={img.alt || "Uploaded image"} fill sizes="200px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => remove(img)}
                  aria-label="Remove image"
                  className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/65 text-white hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
                {multiple && i > 0 && (
                  <button
                    type="button"
                    onClick={() => makeFirst(img)}
                    className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[11px] text-white opacity-0 transition hover:bg-ocean group-hover:opacity-100 focus:opacity-100"
                  >
                    <Star className="h-3 w-3" /> Make first
                  </button>
                )}
              </li>
            ))}
            {busy.map((b) => (
              <li key={b.id} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.preview} alt="Uploading" className="h-full w-full object-cover opacity-50" />
                <span className="absolute inset-0 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-ocean" /></span>
              </li>
            ))}
          </ul>
        )}
        <input
          ref={input}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          className="sr-only"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <label htmlFor={id} className="flex cursor-pointer flex-col items-center gap-1 py-4 text-center text-sm text-slate-600 hover:text-ocean">
          <UploadCloud className="h-8 w-8 text-ocean" />
          <span className="font-semibold text-ink">{multiple ? "Click to upload images" : value.length ? "Replace image" : "Click to upload an image"}</span>
          <span>or drag and drop · JPG, PNG, WebP · up to 8 MB each</span>
        </label>
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
