"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { api } from "@/lib/client";
import { Notice } from "@/components/admin/ui";

export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true); setError("");
    const r = await api("/api/auth/login", "POST", { email: fd.get("email"), password: fd.get("password") });
    if (!r.ok) {
      setBusy(false);
      setError(r.data.error ?? "Login failed");
      return;
    }
    router.replace("/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {error && <Notice kind="error">{error}</Notice>}
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Sign in
      </button>
    </form>
  );
}
