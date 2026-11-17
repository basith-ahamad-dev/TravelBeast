"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send, AlertCircle } from "lucide-react";

export function InquiryForm({
  packageId,
  defaultMessage = "",
  compact,
}: {
  packageId?: string;
  defaultMessage?: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState("sending");
    setError("");
    setFields({});
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          message: fd.get("message"),
          website: fd.get("website"),
          packageId: packageId ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFields(data.fields ?? {});
        setError(data.error ?? "Could not send your message.");
        setState("error");
        return;
      }
      form.reset();
      setState("done");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setState("error");
    }
  }

  if (state === "done")
    return (
      <div className="rounded-2xl bg-emerald-50 p-8 text-center ring-1 ring-emerald-200" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h3 className="mt-3 text-xl">Thank you, we received your inquiry!</h3>
        <p className="mt-1 text-slate-600">Our team will get back to you shortly.</p>
        <button className="btn-outline btn-sm mt-5" onClick={() => setState("idle")}>
          Send another message
        </button>
      </div>
    );

  const err = (k: string) => fields[k] && <p className="mt-1 text-sm text-red-600">{fields[k]}</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label htmlFor="name" className="label">Full name *</label>
          <input id="name" name="name" className="input" required maxLength={100} autoComplete="name" />
          {err("name")}
        </div>
        <div>
          <label htmlFor="email" className="label">Email *</label>
          <input id="email" name="email" type="email" className="input" required autoComplete="email" />
          {err("email")}
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="label">Phone / WhatsApp</label>
        <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" />
        {err("phone")}
      </div>
      <div>
        <label htmlFor="message" className="label">Message *</label>
        <textarea
          id="message"
          name="message"
          rows={compact ? 4 : 5}
          className="input resize-y"
          required
          maxLength={3000}
          defaultValue={defaultMessage}
          placeholder="Tell us your travel dates, group size and anything else we should know."
        />
        {err("message")}
      </div>
      {/* honeypot – hidden from humans */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state === "error" && (
        <p className="flex items-start gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-700" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}
      <button type="submit" disabled={state === "sending"} className="btn-primary w-full sm:w-auto">
        {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {state === "sending" ? "Sending…" : "Send Inquiry"}
      </button>
    </form>
  );
}
