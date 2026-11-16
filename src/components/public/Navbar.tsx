"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Mail, Menu, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Facebook, Instagram, TikTok, Youtube } from "@/components/ui/BrandIcons";

const left = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/packages", label: "Packages" },
  { href: "/destinations", label: "Destinations" },
];
const right = [
  { href: "/#activities", label: "Activities" },
  { href: "/#reviews", label: "Reviews" },
];
const all = [...left, ...right];

type Props = {
  logoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
};

export function Navbar({ logoUrl, email, phone, facebookUrl, instagramUrl, tiktokUrl, youtubeUrl }: Props) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const active = (href: string) => (href === "/" ? path === "/" : !href.includes("#") && path.startsWith(href));
  const link = (l: { href: string; label: string }) => (
    <Link
      key={l.href}
      href={l.href}
      aria-current={active(l.href) ? "page" : undefined}
      className={cn(
        "group relative whitespace-nowrap px-2 py-2 text-[13px] font-semibold uppercase tracking-wide transition hover:text-sunset xl:px-3.5 xl:text-[14px]",
        active(l.href) ? "text-sunset" : "text-ink",
      )}
    >
      {l.label}
      <span className={cn("absolute inset-x-2 -bottom-0.5 h-[3px] origin-left rounded-full bg-gold transition-transform duration-300 xl:inset-x-3.5", active(l.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
    </Link>
  );

  // an admin-uploaded logo still overrides the default brand mark
  const src = !logoUrl || logoUrl === "/logo.jpg" ? "/logo-full.png" : logoUrl;
  // the mark has black outlines, so it sits on a white circle (ringed in the header navy) to stay visible
  const logo = (circle: string, img: string) => (
    <Link href="/" aria-label="TravelBeast Tourism home" className={cn("grid place-items-center rounded-full bg-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5)] ring-[5px] ring-[#02224a]", circle)}>
      <Image src={src} alt="TravelBeast Tourism" width={832} height={1000} priority className={cn("w-auto max-w-none object-contain", img)} />
    </Link>
  );

  // shown on every page; falls back to the platform home page until a profile URL is set in Admin > Settings
  const socials = [
    { href: facebookUrl || "https://www.facebook.com", label: "Facebook", Icon: Facebook },
    { href: instagramUrl || "https://www.instagram.com", label: "Instagram", Icon: Instagram },
    { href: tiktokUrl || "https://www.tiktok.com", label: "TikTok", Icon: TikTok },
    { href: youtubeUrl || "https://www.youtube.com", label: "YouTube", Icon: Youtube },
  ];

  return (
    <header className="relative z-40 bg-[#02224a] pb-9 text-white lg:pb-9">
      <div className="mx-auto max-w-[1240px] px-4">
        {/* contact row: email left, phone + social icons right */}
        <div className="flex h-10 items-center justify-between text-sm">
          {email ? (
            <a href={`mailto:${email}`} className="flex items-center gap-2 font-medium hover:text-gold">
              <Mail className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">{email}</span>
            </a>
          ) : (
            <span className="hidden sm:inline">Discover the World, One Adventure at a Time</span>
          )}
          <div className="flex items-center gap-3 sm:gap-4">
            {phone ? (
              <a href={`tel:${phone}`} className="flex items-center gap-2 text-[15px] font-semibold hover:text-gold">
                <Phone className="h-4 w-4 fill-current" aria-hidden />
                {phone}
              </a>
            ) : (
              <Link href="/contact" className="font-semibold hover:text-gold">Plan your trip &rarr;</Link>
            )}
            <div className="hidden items-center gap-2 sm:flex">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-7 w-7 place-items-center rounded-full border border-white/80 transition hover:border-gold hover:bg-gold hover:text-deep">
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* white pill nav, the logo hangs over it at the centre */}
        <div className="relative mt-2">
          <div className="relative hidden h-[60px] items-center rounded-full bg-white px-3 text-ink shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] lg:grid lg:grid-cols-[1fr_150px_1fr]">
            <nav className="flex items-center justify-between pl-4 pr-2" aria-label="Main">{left.map(link)}</nav>
            <div aria-hidden />
            <div className="flex items-center justify-between pl-2">
              <nav className="flex items-center" aria-label="More">{right.map(link)}</nav>
              <Link href="/contact" className="group flex items-center gap-3 rounded-full bg-ocean py-1 pl-5 pr-1 text-[14px] font-semibold text-white shadow-md transition hover:brightness-110">
                Contact Us Now
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-ocean"><ArrowUpRight className="h-4 w-4" /></span>
              </Link>
            </div>
          </div>
          <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:block">{logo("h-[124px] w-[124px]", "h-[94px]")}</div>

          {/* mobile / tablet */}
          <div className="relative flex h-14 items-center justify-between rounded-full bg-white pl-5 pr-1.5 text-ink shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] lg:hidden">
            <Link href="/contact" className="text-[13px] font-semibold uppercase tracking-wide text-ink hover:text-sunset">Contact</Link>
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">{logo("h-[80px] w-[80px]", "h-[60px]")}</div>
            <button
              className="grid h-11 w-11 place-items-center rounded-full bg-ocean text-white shadow"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
          {open && (
            <nav className="absolute inset-x-0 top-[calc(100%+44px)] z-20 rounded-3xl bg-white p-3 text-ink shadow-xl lg:hidden" aria-label="Mobile">
              {all.map((l) => (
                <Link key={l.href} href={l.href} className={cn("block rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-wide", active(l.href) ? "bg-mist text-sunset" : "text-ink hover:bg-mist")}>
                  {l.label}
                </Link>
              ))}
              <Link href="/contact" className="btn-blue mt-2 w-full">Contact Us Now</Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
