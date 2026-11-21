import type { Metadata } from "next";
import Image from "next/image";
import { Target, Eye, Compass, Wallet, Headphones, Palmtree } from "lucide-react";
import { PageBanner } from "@/components/public/PageBanner";
import { CtaSection } from "@/components/public/CtaSection";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "About Us" };

const why = [
  { Icon: Compass, t: "Carefully planned", d: "Every trip is built around smooth logistics and meaningful experiences." },
  { Icon: Wallet, t: "Honest value", d: "Clear pricing with no surprises, and options for different budgets." },
  { Icon: Headphones, t: "Real support", d: "Talk to real people who know the destinations first-hand." },
  { Icon: Palmtree, t: "Memorable places", d: "From quiet beaches to cultural highlights, we pick what is worth your time." },
];

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <>
      <PageBanner title="About TravelBeast Tourism" subtitle="Travel experiences planned with care." image="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=70" />
      <section className="section">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-card ring-1 ring-black/5">
            <Image src={s.logoUrl || "/logo.jpg"} alt="TravelBeast Tourism logo" fill sizes="448px" className="object-contain p-4" />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-sunset">Who we are</p>
            <h2 className="h-section">Your partner for unforgettable journeys</h2>
            <p className="mt-4 whitespace-pre-line text-lg text-slate-700">{s.aboutText || "TravelBeast Tourism creates carefully planned travel experiences."}</p>
          </div>
        </div>
      </section>

      {(s.mission || s.vision) && (
        <section className="section bg-mist !py-14">
          <div className="container-page grid gap-6 md:grid-cols-2">
            {s.mission && (
              <div className="card p-8">
                <Target className="h-9 w-9 text-sunset" />
                <h3 className="mt-3 text-2xl">Our Mission</h3>
                <p className="mt-2 text-slate-700">{s.mission}</p>
              </div>
            )}
            {s.vision && (
              <div className="card p-8">
                <Eye className="h-9 w-9 text-ocean" />
                <h3 className="mt-3 text-2xl">Our Vision</h3>
                <p className="mt-2 text-slate-700">{s.vision}</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section">
        <div className="container-page">
          <h2 className="h-section mb-10 text-center">Why TravelBeast Tourism?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {why.map(({ Icon, t, d }) => (
              <div key={t} className="card p-6 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ocean/10 text-ocean"><Icon className="h-7 w-7" /></span>
                <h3 className="mt-4 text-xl">{t}</h3>
                <p className="mt-2 text-[15px] text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaSection whatsapp={s.whatsapp} />
    </>
  );
}
