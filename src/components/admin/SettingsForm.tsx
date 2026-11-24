"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { api } from "@/lib/client";
import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";
import { Field, Notice } from "@/components/admin/ui";

export type SettingsData = {
  companyName: string; email: string; phone: string; whatsapp: string; address: string;
  facebookUrl: string; instagramUrl: string; tiktokUrl: string; youtubeUrl: string;
  heroTitle: string; heroSubtitle: string; heroImageUrl: string; logoUrl: string;
  aboutText: string; mission: string; vision: string; footerText: string;
};

export function SettingsForm({ initial }: { initial: SettingsData }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [hero, setHero] = useState<UploadedImage[]>(initial.heroImageUrl ? [{ url: initial.heroImageUrl }] : []);
  const [logo, setLogo] = useState<UploadedImage[]>(initial.logoUrl ? [{ url: initial.logoUrl }] : []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const set = (k: keyof SettingsData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS({ ...s, [k]: e.target.value });

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy(true); setError(""); setFields({}); setOk(false);
    const r = await api("/api/settings", "PUT", { ...s, heroImageUrl: hero[0]?.url ?? "", logoUrl: logo[0]?.url ?? "" });
    setBusy(false);
    if (!r.ok) { setError(r.data.error ?? "Could not save"); setFields(r.data.fields ?? {}); return; }
    setOk(true);
    router.refresh();
  }

  const text = (k: keyof SettingsData, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field label={label} error={fields[k]}><input className="input" value={s[k]} onChange={set(k)} {...props} /></Field>
  );

  return (
    <form onSubmit={save} className="space-y-6" noValidate>
      {error && <Notice kind="error">{error}</Notice>}
      {ok && <Notice kind="success">Settings saved. Changes are live on the website.</Notice>}

      <section className="card space-y-4 p-6">
        <h2 className="text-lg">Company contact information</h2>
        {text("companyName", "Company name *")}
        <ImageUploader label="Website logo" value={logo} onChange={setLogo} hint="Leave empty to use the default TravelBeast logo. Square image on a white background works best." />
        <div className="grid gap-4 sm:grid-cols-2">
          {text("email", "Email", { type: "email" })}
          {text("phone", "Phone")}
          {text("whatsapp", "WhatsApp number (with country code)", { placeholder: "e.g. 94771234567" })}
          {text("address", "Address")}
        </div>
        <p className="text-xs text-slate-500">Only filled-in details are shown publicly.</p>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg">Social media links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("facebookUrl", "Facebook URL", { placeholder: "https://facebook.com/…" })}
          {text("instagramUrl", "Instagram URL", { placeholder: "https://instagram.com/…" })}
          {text("tiktokUrl", "TikTok URL")}
          {text("youtubeUrl", "YouTube URL")}
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg">Homepage hero</h2>
        {text("heroTitle", "Heading *")}
        <Field label="Supporting text *" error={fields.heroSubtitle}><textarea className="input" rows={2} value={s.heroSubtitle} onChange={set("heroSubtitle")} /></Field>
        <ImageUploader label="Hero background image" value={hero} onChange={setHero} hint="Use a wide, high-quality landscape photo (at least 1920px)." />
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg">About page & footer</h2>
        <Field label="About text"><textarea className="input" rows={4} value={s.aboutText} onChange={set("aboutText")} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mission"><textarea className="input" rows={3} value={s.mission} onChange={set("mission")} /></Field>
          <Field label="Vision"><textarea className="input" rows={3} value={s.vision} onChange={set("vision")} /></Field>
        </div>
        <Field label="Footer description"><textarea className="input" rows={2} value={s.footerText} onChange={set("footerText")} /></Field>
      </section>

      <div className="flex justify-end">
        <button className="btn-primary" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save settings</button>
      </div>
    </form>
  );
}
