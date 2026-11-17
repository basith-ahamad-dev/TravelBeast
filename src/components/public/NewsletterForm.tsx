"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail, Send } from "lucide-react";

/**
 * Footer email forms. Both variants reach the team as an inquiry, so nothing extra has to be set up:
 *  - "bar": the wide NEWSLETTER row   - "compact": the small "Book your Trip" row
 */
export function NewsletterForm({ variant, message }: { variant: "bar" | "compact"; message: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Website visitor", email: fd.get("email"), phone: "", message, website: fd.get("website") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.fields?.email ?? data.error ?? "Could not send. Please try again.");
        setState("error");
        return;
      }
      form.reset();
      setState("done");
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  if (state === "done")
    return (
      <p className="flex items-center gap-2 py-4 text-white" role="status">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-gold" /> Thank you! We&apos;ll be in touch soon.
      </p>
    );

  const bar = variant === "bar";
  return (
    <form onSubmit={onSubmit} noValidate>
      <div className={bar ? "flex items-center gap-4 pb-5 pt-14 sm:pt-20" : "flex items-center gap-3 border-b border-white/30 pb-3"}>
        {bar && <Mail className="h-5 w-5 shrink-0 text-white" aria-hidden />}
        <input
          name="email"
          type="email"
          required
          aria-label="Email address"
          placeholder={bar ? "Enter Your Email Address" : "Enter Your Email..."}
          className={bar ? "min-w-0 flex-1 bg-transparent text-lg text-white outline-none placeholder:text-white" : "min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white"}
        />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button
          type="submit"
          disabled={state === "sending"}
          aria-label={bar ? "Subscribe" : "Send"}
          className={bar ? "text-white transition hover:text-gold" : "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/30 transition hover:bg-gold hover:text-deep"}
        >
          {state === "sending" ? <Loader2 className="h-6 w-6 animate-spin" /> : bar ? <Send className="h-8 w-8" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-sm text-gold" role="alert">{error}</p>}
    </form>
  );
}
