"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Package, MapPin, Star, Images, Inbox, Settings, LogOut, Menu, X, ExternalLink,
} from "lucide-react";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/packages", label: "Packages", Icon: Package },
  { href: "/admin/destinations", label: "Destinations", Icon: MapPin },
  { href: "/admin/reviews", label: "Reviews", Icon: Star },
  { href: "/admin/gallery", label: "Gallery", Icon: Images },
  { href: "/admin/inquiries", label: "Inquiries", Icon: Inbox },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export function AdminShell({ user, children }: { user: { name: string; email: string }; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  async function logout() {
    await api("/api/auth/logout", "POST");
    router.replace("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-deep text-white/85">
      <div className="flex items-center gap-3 border-b border-white/10 p-4">
        <span className="rounded-xl bg-white p-1"><Image src="/logo.jpg" alt="TravelBeast" width={44} height={44} className="h-11 w-11 object-contain" /></span>
        <div className="leading-tight">
          <p className="font-heading font-semibold text-white">TravelBeast</p>
          <p className="text-xs text-white/60">Admin Dashboard</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin">
        {nav.map(({ href, label, Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-medium transition",
                active ? "bg-white text-deep shadow" : "hover:bg-white/10",
              )}
            >
              <Icon className="h-5 w-5" /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm hover:bg-white/10">
          <ExternalLink className="h-4 w-4" /> View website
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%]">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button className="grid h-10 w-10 place-items-center rounded-lg hover:bg-mist lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
          <p className="hidden text-sm text-slate-500 lg:block">Manage your website content</p>
          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <button onClick={logout} className="btn-outline btn-sm">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
