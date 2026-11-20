import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Clock, Compass, Gem, MapPin, MessageCircle, Plane, Plus, Quote, Search, Star, Users } from "lucide-react";
import { PackageCard } from "@/components/public/PackageCard";
import { ReviewCard } from "@/components/public/ReviewCard";
import { SmartImage } from "@/components/ui/SmartImage";
import { PillButton } from "@/components/ui/PillButton";
import { DisplayHeading, Watermark } from "@/components/ui/DisplayHeading";
import { Carousel } from "@/components/ui/Carousel";
import { SriLankaMap } from "@/components/public/SriLankaMap";
import { Facebook, Instagram, LinkedIn, TikTok, WhatsApp, XTwitter } from "@/components/ui/BrandIcons";
import { cn, formatDuration, formatPrice } from "@/lib/utils";
import { featuredGallery, featuredPackages, getSettings, listDestinations, publishedReviews, reviewSummary } from "@/lib/queries";

const activities = [
  { title: "Beach & Island Escapes", q: "beach", tint: "from-amber/95 via-amber/60" },
  { title: "Wildlife Safaris", q: "safari", tint: "from-ocean/95 via-ocean/60" },
  { title: "Hiking & Trekking", q: "trek", tint: "from-sunset/95 via-sunset/60" },
  { title: "Cultural Tours", q: "culture", tint: "from-gold/95 via-gold/60" },
  { title: "Water Adventures", q: "water", tint: "from-amber/95 via-amber/60" },
  { title: "Honeymoon Getaways", q: "honeymoon", tint: "from-ocean/95 via-ocean/60" },
];

const steps = [
  { Icon: Search, title: "Choose Your Trip", text: "Browse our packages and destinations, or tell us what you have in mind: beaches, wildlife, culture or all three.", tone: "bg-sunset" },
  { Icon: MessageCircle, title: "We Plan It", text: "Our team builds your itinerary, stays and transfers around your dates and budget, and sends it for your approval.", tone: "bg-ocean" },
  { Icon: Plane, title: "You Travel", text: "Relax and enjoy. Your guide and driver look after everything on the ground, and we are one message away.", tone: "bg-gold !text-deep" },
];

const faqs = [
  { q: "Do I need a visa to visit Sri Lanka?", a: "Most visitors need an Electronic Travel Authorisation (ETA) before arrival. Requirements depend on your passport, so please check the official Sri Lanka immigration website. We are happy to point you in the right direction." },
  { q: "What is included in a package?", a: "Each package page lists exactly what is included and excluded, such as accommodation, transfers, guided activities and meals. If something is missing that you need, we can add it." },
  { q: "How do payments work?", a: "Once your itinerary is agreed we confirm the booking and share payment details. Ask us about deposit and balance terms for your trip when you send an inquiry." },
  { q: "Can I change or cancel my booking?", a: "Plans change, and we will always try to help. Cancellation and amendment terms depend on the trip and its suppliers, so we confirm them with you in writing before you pay." },
  { q: "Can you customise a trip for me?", a: "Yes. Every trip can be tailored to your dates, budget, group size and interests. Send us an inquiry and we will put an itinerary together for you." },
  { q: "Do you take family and group bookings?", a: "Yes. We arrange family trips, honeymoons and larger groups, with vehicles and stays to match. Use the Group Booking button or message us on WhatsApp." },
];

const fallbackAbout = [
  "We plan every TravelBeast trip around the traveller: clean, well-kept stays, smooth transfers and itineraries designed so the whole experience flows seamlessly.",
  "We are dedicated to providing you a quality travel experience with lots of fun and personal service. You will find a team that enjoys what they do, and everyone looks forward to sharing their knowledge and love of the places we visit with you.",
];

function timeAgo(d: Date) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000));
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const m = Math.floor(days / 30);
  if (m < 12) return `${m} month${m === 1 ? "" : "s"} ago`;
  const y = Math.floor(m / 12);
  return `${y} year${y === 1 ? "" : "s"} ago`;
}

const stars = (cls: string, size = 16) => (
  <span className="flex gap-0.5" aria-hidden>
    {[0, 1, 2, 3, 4].map((i) => <Star key={i} width={size} height={size} className={cls} />)}
  </span>
);

const perks = [
  { Icon: Compass, label: "Professionally Guided Tours" },
  { Icon: Gem, label: "Premium Stays & Transport" },
  { Icon: Users, label: "Family Friendly" },
];

const Squiggle = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 120 40" fill="none" aria-hidden className={cn("h-10 w-[120px] text-sunset", flip && "-scale-x-100")}>
    <path d="M2 28c14-18 22-18 30-6s16 12 26-4 22-14 34-2 20 8 26-2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M10 36c12-12 18-12 26-3s14 8 22-2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".55" />
  </svg>
);

export default async function HomePage() {
  const [settings, packages, allDest, reviews, summary, gallery] = await Promise.all([
    getSettings(),
    featuredPackages(3),
    listDestinations(),
    publishedReviews(9),
    reviewSummary(),
    featuredGallery(8),
  ]);

  // pool of photos so every section has an image even when only some content exists
  const pool = [...gallery.map((g) => g.url), ...packages.map((p) => p.coverUrl), ...allDest.map((d) => d.coverUrl)].filter((u): u is string => !!u);
  const pick = (i: number) => (pool.length ? pool[i % pool.length] : null);

  const name = settings.companyName || "TravelBeast Tourism";
  const NAME = name.toUpperCase();
  // always shown in the hero; falls back to the platform's home page until a profile URL is set in Admin > Settings
  const socials = [
    { href: settings.facebookUrl || "https://www.facebook.com", label: "Facebook", Icon: Facebook },
    { href: settings.instagramUrl || "https://www.instagram.com", label: "Instagram", Icon: Instagram },
    { href: "https://x.com", label: "X", Icon: XTwitter },
    { href: "https://www.linkedin.com", label: "LinkedIn", Icon: LinkedIn },
    { href: settings.tiktokUrl || "https://www.tiktok.com", label: "TikTok", Icon: TikTok },
  ];

  // WhatsApp link from the admin "whatsapp" setting (falls back to the phone number)
  const waDigits = (settings.whatsapp || settings.phone || "").replace(/\D/g, "");
  const whatsappHref = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent("Hi TravelBeast, I'd like to plan a trip.")}` : null;

  const aboutParas =(settings.aboutText || "").split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const aboutLead = aboutParas[0] ?? fallbackAbout[0];
  const aboutRest = aboutParas.length > 1 ? aboutParas.slice(1) : [settings.mission, settings.vision].filter(Boolean).length ? [settings.mission, settings.vision].filter(Boolean) : [fallbackAbout[1]];

  const featuredDest = allDest.slice(0, 6);

  return (
    <>
      {/* ============ HERO ============ */}
      <div className="relative">
        <section className="relative isolate flex min-h-[600px] flex-col items-center overflow-hidden bg-[#02224a] lg:min-h-[700px]">
          {/* the panorama sits at the bottom at its natural proportions (nothing cropped on desktop); its navy sky fades
              into the section colour above it, so the heading reads on clean dark blue */}
          <div
            className="absolute inset-x-0 bottom-0 h-[clamp(340px,37.5vw,560px)]"
            style={{ WebkitMaskImage: "linear-gradient(to bottom,transparent 0,#000 22%)", maskImage: "linear-gradient(to bottom,transparent 0,#000 22%)" }}
          >
            <SmartImage src="/hero-panorama.png" alt="Sunset over a Sri Lankan beach with palms and a lighthouse, above a skyline of Sri Lankan landmarks" sizes="100vw" priority className="object-[30%_100%] lg:object-center" />
          </div>
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-white" />
          <Watermark text="Adventures" className="top-6 z-0 text-white/[0.07]" />

          {/* left progress tick */}
          <div aria-hidden className="absolute left-[88px] top-[130px] hidden h-[250px] w-[3px] bg-gradient-to-b from-gold from-0% via-gold via-50% to-white/40 to-50% lg:block" />

          <div className="container-page relative z-10 pt-14 text-center text-white sm:pt-20">
            <p className="font-script text-[38px] leading-none text-gold sm:text-[56px]">Welcome to {name}</p>
            <h1 className="mx-auto -mt-1 max-w-[1180px] font-display text-[clamp(40px,6.3vw,100px)] font-extrabold uppercase leading-[0.95] tracking-tight text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.35)]">
              {settings.heroTitle}
            </h1>
            <p className="sr-only">{settings.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <PillButton href="/packages" variant="red">Book Your Trip</PillButton>
              <PillButton href="#about" variant="yellow">Discover More</PillButton>
            </div>
            <ul className="mt-6 flex items-center justify-center gap-2.5 lg:hidden">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href!} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-md transition hover:bg-gold">
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* social icons: a column on the right of the hero (desktop), a row under the buttons (mobile/tablet) */}
          <ul className="absolute right-6 top-[190px] z-10 hidden flex-col gap-2.5 lg:flex xl:right-[70px]">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a href={href!} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-md transition hover:-translate-y-0.5 hover:bg-gold">
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              </li>
            ))}
          </ul>

        </section>
      </div>

      {/* ============ GUEST REVIEWS (right after the hero) ============ */}
      <section id="reviews" className="relative scroll-mt-10 overflow-hidden px-0 pb-12 pt-16 lg:pt-24">
        <div className="container-page relative">
          <DisplayHeading script="Client Reviews" title="What our" accent="guests say" mark="right">
            Don&apos;t just take our word for it, hear from adventurers like you.
          </DisplayHeading>

          {reviews.length === 0 ? (
            <p className="mx-auto mt-12 max-w-xl rounded-2xl bg-mist p-10 text-center text-slate-600">Be the first to share your TravelBeast story.</p>
          ) : (
            <div className="mx-auto mt-12 grid max-w-[1180px] gap-6 md:grid-cols-3">
              {reviews.slice(0, 3).map((r) => (
                <ReviewCard key={r.id} r={{ ...r, images: [] }} />
              ))}
            </div>
          )}

          {/* rating summary */}
          <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[14px] text-ink">
            {summary.count > 0 && (
              <>
                <span className="flex items-center gap-2">{stars("fill-amber text-amber", 16)} <b>{summary.avg.toFixed(1)}</b> ({summary.count} reviews)</span>
                <span className="hidden h-5 w-px bg-slate-300 sm:block" aria-hidden />
              </>
            )}
            <span className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 fill-ocean text-white" aria-hidden /> Verified guest feedback</span>
            <span className="hidden h-5 w-px bg-slate-300 sm:block" aria-hidden />
            <span className="flex items-center gap-2"><MapPin className="h-5 w-5 text-sunset" aria-hidden /> {allDest.length} destinations</span>
          </div>

          {/* perks strip */}
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 lg:gap-x-16">
            <li className="hidden lg:block"><Squiggle /></li>
            {perks.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-3 font-display text-[20px] font-bold uppercase leading-[1.05] text-ink">
                <Icon className="h-9 w-9 text-sunset" strokeWidth={1.6} aria-hidden />
                <span className="max-w-[130px]">{label}</span>
              </li>
            ))}
            <li className="hidden lg:block"><Squiggle flip /></li>
          </ul>
        </div>
      </section>

      {/* ============ TOP EXPERIENCES ============ */}
      <section className="relative overflow-hidden px-0 pb-20 pt-16">
        <div className="container-page relative">
          <DisplayHeading script="Top Experiences" title="Top travel" accent="experiences" mark="left" />

          {packages.length === 0 ? (
            <p className="mx-auto mt-12 max-w-xl rounded-2xl bg-mist p-10 text-center text-slate-600">New experiences are coming soon. Check back shortly!</p>
          ) : (
            <div className="mx-auto mt-12 grid max-w-[1180px] gap-7 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((p) => <PackageCard key={p.id} pkg={p} rating={summary.count > 0 ? summary : undefined} />)}
            </div>
          )}

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <PillButton href="/packages" variant="blue">View All Packages</PillButton>
            <PillButton href="/contact" variant="red">Group Booking</PillButton>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="relative scroll-mt-10 overflow-hidden bg-mist pb-20 pt-20">
        <Watermark text="Easy Steps" className="top-6 text-ocean/[0.07]" />
        <div className="container-page relative">
          <DisplayHeading script="Simple & Stress-Free" title="How it" accent="works" mark="left">
            Three easy steps from first idea to the trip of a lifetime.
          </DisplayHeading>

          <div className="relative mx-auto mt-14 max-w-[1180px]">
            <div aria-hidden className="absolute left-[16.6%] right-[16.6%] top-[44px] hidden border-t-2 border-dashed border-ocean/30 md:block" />
            <ol className="relative grid gap-6 md:grid-cols-3">
              {steps.map(({ Icon, title, text, tone }, i) => (
                <li key={title} className="relative rounded-2xl bg-white p-7 pt-0 text-center shadow-card ring-1 ring-black/5">
                  <span className={cn("relative -top-9 mx-auto grid h-[88px] w-[88px] place-items-center rounded-full text-white shadow-lift ring-[6px] ring-white", tone)}>
                    <Icon className="h-9 w-9" strokeWidth={1.8} aria-hidden />
                    <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-white font-display text-[17px] font-extrabold text-ink shadow">{i + 1}</span>
                  </span>
                  <h3 className="-mt-3 font-display text-[26px] font-bold uppercase leading-tight text-ink">{title}</h3>
                  <p className="mt-3 text-[14px] leading-6 text-slate-600">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 flex justify-center">
            <PillButton href="/contact" variant="red">Start Planning</PillButton>
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="relative scroll-mt-10 overflow-hidden px-0 pb-24 pt-16 lg:pt-24">
        <Watermark text="About Us" className="top-[60px] text-ocean/[0.07]" />
        <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <div className="relative pb-24 pr-10 sm:pb-32">
            <div className="relative aspect-[650/660] overflow-hidden rounded-2xl">
              <SmartImage src={pick(0)} alt="" sizes="(min-width:1024px) 45vw, 100vw" />
            </div>
            <div className="absolute bottom-0 right-0 w-[58%] rounded-2xl bg-white p-3 shadow-lift sm:p-4">
              <div className="relative aspect-[350/278] overflow-hidden rounded-xl">
                <SmartImage src={pick(1)} alt="" sizes="30vw" />
              </div>
            </div>
          </div>

          <div className="relative">
            <p className="font-script text-[36px] leading-none text-ocean sm:text-[46px]">Who We Are</p>
            <h2 className="mt-1 max-w-xl font-display text-[clamp(34px,4.6vw,64px)] font-extrabold uppercase leading-[0.95] tracking-tight text-ink">
              Explore adventure with <span className="block text-sunset">{NAME}</span>
            </h2>
            <div className="mt-7 flex gap-4">
              <span className="w-1 shrink-0 rounded-full bg-gradient-to-b from-sunset to-sunset/10" aria-hidden />
              <p className="text-[15px] leading-7 text-ink">{aboutLead}</p>
            </div>
            <div className="mt-7 space-y-5 text-[14px] leading-7 text-slate-500">
              {aboutRest.slice(0, 2).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="mt-8"><PillButton href="/about" variant="blue">Read More About Us</PillButton></div>
          </div>
        </div>
      </section>

      {/* ============ FEATURED DESTINATIONS ============ */}
      <section className="relative overflow-hidden pb-24 pt-20">
        <Watermark text="Destinations" className="top-6 text-ocean/[0.1]" />
        <div className="container-page relative">
          <DisplayHeading script="Explore the Experience" title="Featured destinations with" accent={NAME} mark="right" />

          {featuredDest.length === 0 ? (
            <p className="mt-12 text-center text-slate-600">Destinations will appear here soon.</p>
          ) : (
            <div className={cn("mx-auto mt-14 grid max-w-[1330px] gap-[22px] lg:grid-cols-12", featuredDest.length > 3 ? "lg:grid-rows-[296px_296px_343px]" : "lg:grid-rows-[296px_296px]")}>
              {featuredDest.map((d, i) => {
                const big = i === 0;
                const bottom = Math.max(featuredDest.length - 3, 1);
                const bottomSpan = ({ 1: "lg:col-span-12", 2: "lg:col-span-6", 3: "lg:col-span-4" } as Record<number, string>)[bottom];
                const span = big ? "lg:col-span-7 lg:row-span-2" : i < 3 ? "lg:col-span-5" : bottomSpan;
                return (
                  <Link key={d.id} href={`/destinations/${d.slug}`} className={cn("group relative isolate block min-h-[260px] overflow-hidden rounded-2xl bg-deep", span)}>
                    <SmartImage src={d.coverUrl} alt={d.name} sizes={big ? "(min-width:1024px) 55vw, 100vw" : "(min-width:1024px) 33vw, 100vw"} className="transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40" />
                    {big && <div aria-hidden className="absolute inset-[14px] rounded-xl border border-white/25" />}
                    <div className={cn("absolute inset-x-0 flex items-center justify-between text-[12px] uppercase tracking-[0.2em] text-white", big ? "top-[14px] mx-[14px] px-[17px] pt-[14px] text-[16px]" : "top-3 mx-3 px-3 pt-1")}>
                      <span>Featured Trips</span>
                      {big ? (
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-ocean text-white"><ArrowUpRight className="h-4 w-4" /></span>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
                      )}
                    </div>
                    {big && <span aria-hidden className="absolute bottom-14 left-7 hidden text-[11px] uppercase tracking-[0.3em] text-white/70 sm:block" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{name}</span>}
                    <div className={cn("absolute bottom-0 left-0 right-0 text-white", big ? "px-14 pb-12" : "px-7 pb-6")}>
                      <h3 className={cn("font-display font-bold uppercase leading-[1.02] text-white", big ? "text-[clamp(28px,3vw,40px)]" : "text-[clamp(26px,2.6vw,36px)]")}>
                        {d.name}{d.country && !big && d.country.toLowerCase() !== d.name.toLowerCase() ? `, ${d.country}` : ""}
                      </h3>
                      {big && <p className="mt-3 line-clamp-2 max-w-md text-[14px] text-white/90">{d.shortDescription}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <PillButton href="/destinations" variant="blue">View All Destinations</PillButton>
          </div>
        </div>
      </section>

      {/* ============ SRI LANKA MAP ============ */}
      <section id="map" className="relative scroll-mt-10 overflow-x-clip bg-[#fcf9ec] pb-20 pt-20">
        <Watermark text="Sri Lanka" className="top-6 text-ocean/[0.08]" />
        <div className="container-page relative">
          <DisplayHeading script="Find Your Way" title="Explore Sri Lanka with" accent={NAME} mark="right">
            Hover over a pin, or tap it on your phone, to meet the island&apos;s must-see places and start planning your trip.
          </DisplayHeading>
          <div className="mt-12">
            <SriLankaMap />
          </div>
        </div>
      </section>

      {/* ============ ACTIVITIES ============ */}
      <section id="activities" className="relative scroll-mt-10 overflow-hidden bg-royal pb-16 pt-24 text-white">
        <Watermark text="Activities" className="top-6 text-white/[0.09]" />
        <div className="container-page relative">
          <DisplayHeading script="Travel Your Way" title="Explore the" accent={`${name.split(" ")[0].toUpperCase()} activities`} tone="dark" mark="left">
            We are dedicated to providing you a quality travel experience with lots of fun and personal service. You will find a team that enjoys what they do.
          </DisplayHeading>
        </div>
        <div className="relative mt-14 lg:pl-[calc((100vw-1330px)/2)]">
          <Carousel variant="activities" trackClassName="gap-8 px-6 lg:px-0">
            {activities.map((a, i) => (
              <Link
                key={a.title}
                href={`/packages?q=${a.q}`}
                className="group relative block h-[478px] w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[330px]"
              >
                <SmartImage src={pick(i + 2)} alt={a.title} sizes="330px" className="transition duration-700 group-hover:scale-105" />
                <div className={cn("absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t to-transparent", a.tint)} />
                <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white text-ink"><ArrowUpRight className="h-4 w-4" /></span>
                <h3 className="absolute bottom-6 left-5 right-5 font-display text-[24px] font-bold uppercase leading-tight text-white">{a.title}</h3>
              </Link>
            ))}
          </Carousel>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="relative scroll-mt-10 overflow-hidden pb-12 pt-24">
        <Watermark text="Questions" className="top-8 text-ocean/[0.07]" />
        <div className="container-page relative">
          <DisplayHeading script="Good to Know" title="Frequently asked" accent="questions" mark="right">
            Quick answers before you book. Can&apos;t find yours? Just ask us.
          </DisplayHeading>

          <div className="mx-auto mt-12 max-w-6xl space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-white shadow-card ring-1 ring-black/5 open:ring-ocean/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-6 py-4 text-[16px] font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ocean text-white transition group-open:rotate-45 group-open:bg-sunset">
                    <Plus className="h-4 w-4" aria-hidden />
                  </span>
                </summary>
                <p className="px-6 pb-5 text-[14px] leading-7 text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CALL TO ACTION ============ */}
      <section className="px-4 pb-20 pt-10 sm:px-6">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-2xl bg-gradient-to-br from-royal via-ocean to-deep px-6 py-14 text-center text-white shadow-lift sm:px-12">
          <div aria-hidden className="absolute inset-x-0 bottom-0 flex h-1.5"><span className="flex-1 bg-sunset" /><span className="flex-1 bg-amber" /><span className="flex-1 bg-gold" /><span className="flex-1 bg-sky" /></div>
          <p className="relative font-script text-[34px] leading-none text-gold sm:text-[46px]">Let&apos;s Go</p>
          <h2 className="relative mx-auto max-w-3xl font-display text-[clamp(34px,5vw,60px)] font-extrabold uppercase leading-[0.98] tracking-tight text-white">
            Ready for your <span className="text-gold">trip?</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[15px] text-white/90">
            Tell us where and when, and we&apos;ll put together a trip that fits. Chat with us on WhatsApp or send an inquiry, no obligation.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-full bg-[#25D366] py-3 pl-5 pr-7 text-[15px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:brightness-105 sm:text-[17px]">
                <WhatsApp className="h-6 w-6" /> Chat on WhatsApp
              </a>
            )}
            <PillButton href="/contact" variant="yellow">Send an Inquiry</PillButton>
          </div>
        </div>
      </section>
    </>
  );
}
