import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Facebook, Instagram, Youtube, TikTok } from "@/components/ui/BrandIcons";
import { Watermark } from "@/components/ui/DisplayHeading";
import { NewsletterForm } from "@/components/public/NewsletterForm";
import type { WebsiteSettings } from "@prisma/client";
import { whatsappLink } from "@/lib/utils";

type Dest = { id: string; name: string; slug: string };

const links: [string, string][] = [["/", "Home"], ["/about", "About Us"], ["/packages", "Travel Packages"], ["/destinations", "Destinations"], ["/contact", "Contact"]];
const other: [string, string][] = [["/#activities", "Activities"], ["/#reviews", "Reviews"], ["/contact", "Send an Inquiry"], ["/packages", "All Packages"]];

export function Footer({ s, destinations = [] }: { s: WebsiteSettings; destinations?: Dest[] }) {
  const wa = whatsappLink(s.whatsapp);
  const socials = [
    { href: s.facebookUrl, label: "Facebook", Icon: Facebook, cls: "bg-[#3b75c4]" },
    { href: s.instagramUrl, label: "Instagram", Icon: Instagram, cls: "bg-gradient-to-r from-[#f9a03f] via-[#e1306c] to-[#8a3ab9]" },
    { href: s.youtubeUrl, label: "YouTube", Icon: Youtube, cls: "bg-[#ff0000]" },
    { href: s.tiktokUrl, label: "TikTok", Icon: TikTok, cls: "bg-black" },
    { href: wa, label: "WhatsApp", Icon: MessageCircle, cls: "bg-[#25D366]" },
  ].filter((x) => x.href);

  const col = "border-white/20 md:border-l md:pl-10 lg:pl-12";
  return (
    <footer className="relative overflow-hidden bg-deep text-white">
      {/* newsletter row */}
      <div className="relative">
        <Watermark text="Newsletter" className="top-6 text-white/[0.07]" />
        <div className="container-page relative max-w-[1300px]">
          <div className="border-b border-white/25">
            <NewsletterForm variant="bar" message="Newsletter signup: please add me to the TravelBeast mailing list for offers and travel tips." />
          </div>
        </div>
      </div>

      {/* link columns */}
      <div className="container-page max-w-[1300px]">
        <div className="grid md:grid-cols-[1.5fr_1fr_1.1fr_1fr]">
          <div className="py-10 pr-8">
            <Link href="/" className="inline-block rounded-2xl bg-white p-3 shadow-lg" aria-label={s.companyName}>
              <Image src="/logo-full.png" alt={s.companyName} width={832} height={1000} className="h-32 w-auto object-contain" />
            </Link>
            <h3 className="mt-3 text-2xl font-normal text-white">Book your Trip</h3>
            <div className="mt-5 max-w-sm">
              <NewsletterForm variant="compact" message="Please contact me about booking a trip with TravelBeast." />
            </div>
            <ul className="mt-6 space-y-2.5 text-sm text-white/85">
              {s.phone && <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> <a href={`tel:${s.phone}`} className="hover:text-gold">{s.phone}</a></li>}
              {s.email && <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> <a href={`mailto:${s.email}`} className="break-all hover:text-gold">{s.email}</a></li>}
              {s.address && <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {s.address}</li>}
            </ul>
            {s.footerText && <p className="mt-4 max-w-sm text-sm text-white/70">{s.footerText}</p>}
          </div>

          <nav className={`${col} py-10`} aria-label="Links">
            <h3 className="text-2xl font-normal text-white">Links</h3>
            <ul className="mt-6 space-y-3 text-sm text-white/85">
              {links.map(([href, label]) => <li key={label}><Link href={href} className="transition hover:text-gold">{label}</Link></li>)}
            </ul>
          </nav>

          <nav className={`${col} py-10`} aria-label="Featured trips">
            <h3 className="text-2xl font-normal text-white">Featured Trips</h3>
            <ul className="mt-6 space-y-3 text-sm text-white/85">
              {destinations.slice(0, 6).map((d) => <li key={d.id}><Link href={`/destinations/${d.slug}`} className="transition hover:text-gold">{d.name}</Link></li>)}
              {destinations.length === 0 && <li><Link href="/packages" className="transition hover:text-gold">Browse packages</Link></li>}
            </ul>
          </nav>

          <nav className={`${col} border-r-0 py-10 md:border-r md:border-white/20`} aria-label="Other links">
            <h3 className="text-2xl font-normal text-white">Other Links</h3>
            <ul className="mt-6 space-y-3 text-sm text-white/85">
              {other.map(([href, label]) => <li key={label}><Link href={href} className="transition hover:text-gold">{label}</Link></li>)}
            </ul>
          </nav>
        </div>
      </div>

      {/* follow us */}
      <div className="bg-white/[0.08]">
        <div className="container-page flex max-w-[1300px] flex-col items-start gap-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[15px] uppercase tracking-wide text-white/70">Follow us online:</p>
            <p className="font-display text-4xl font-extrabold uppercase leading-none">{s.companyName}</p>
          </div>
          {socials.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {socials.map(({ href, label, Icon, cls }) => (
                <a key={label} href={href!} target="_blank" rel="noopener noreferrer" className={`flex min-w-[150px] items-center justify-center gap-2.5 rounded-full px-5 py-3.5 text-sm font-medium text-white transition hover:brightness-110 ${cls}`}>
                  <Icon className="h-5 w-5" /> {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-sm text-white/90">
        Copyright &copy; {new Date().getFullYear()} {s.companyName}. All Rights Reserved
      </div>
    </footer>
  );
}
