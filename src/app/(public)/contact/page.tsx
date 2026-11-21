import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Facebook, Instagram, Youtube, TikTok as Music2 } from "@/components/ui/BrandIcons";
import { PageBanner } from "@/components/public/PageBanner";
import { InquiryForm } from "@/components/public/InquiryForm";
import { getSettings } from "@/lib/queries";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const s = await getSettings();
  const wa = whatsappLink(s.whatsapp, "Hello TravelBeast, I would like to plan a trip.");
  const socials = [
    { href: s.facebookUrl, label: "Facebook", Icon: Facebook },
    { href: s.instagramUrl, label: "Instagram", Icon: Instagram },
    { href: s.tiktokUrl, label: "TikTok", Icon: Music2 },
    { href: s.youtubeUrl, label: "YouTube", Icon: Youtube },
  ].filter((x) => x.href);
  const hasDetails = s.phone || s.email || s.address;

  return (
    <>
      <PageBanner title="Contact Us" subtitle="Tell us about your dream trip and we will be in touch." image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=70" />
      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="card p-6 sm:p-8">
            <h2 className="mb-6 text-2xl">Send us a message</h2>
            <InquiryForm />
          </div>
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="mb-4 text-xl">Get in touch</h2>
              {hasDetails ? (
                <ul className="space-y-4 text-[15px]">
                  {s.phone && <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-ocean" /><a href={`tel:${s.phone}`}>{s.phone}</a></li>}
                  {s.email && <li className="flex gap-3"><Mail className="h-5 w-5 shrink-0 text-ocean" /><a href={`mailto:${s.email}`} className="break-all">{s.email}</a></li>}
                  {s.address && <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-ocean" />{s.address}</li>}
                </ul>
              ) : (
                <p className="text-[15px] text-slate-600">Use the form and our team will reply as soon as possible.</p>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn mt-5 w-full bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                  <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                </a>
              )}
            </div>
            {socials.length > 0 && (
              <div className="card p-6">
                <h2 className="mb-4 text-xl">Follow us</h2>
                <div className="flex gap-3">
                  {socials.map(({ href, label, Icon }) => (
                    <a key={label} href={href!} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center rounded-full bg-ocean/10 text-ocean transition hover:bg-ocean hover:text-white">
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

