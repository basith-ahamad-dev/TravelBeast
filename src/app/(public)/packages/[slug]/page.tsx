import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Check, X, MapPin, Info, ChevronRight, MessageCircle } from "lucide-react";
import { ImageGallery } from "@/components/public/ImageGallery";
import { InquiryForm } from "@/components/public/InquiryForm";
import { PackageCard } from "@/components/public/PackageCard";
import { ReviewCard } from "@/components/public/ReviewCard";
import { PageTop } from "@/components/public/PageBanner";
import { getPackageBySlug, getSettings, relatedPackages } from "@/lib/queries";
import { formatDuration, formatPrice, toList, whatsappLink } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPackageBySlug(slug);
  if (!p) return { title: "Package not found" };
  return {
    title: p.title,
    description: p.shortDescription,
    openGraph: { images: p.coverUrl ? [p.coverUrl] : undefined },
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();
  const [related, settings] = await Promise.all([relatedPackages(pkg.destinationId, pkg.id), getSettings()]);

  const gallery = [
    ...(pkg.coverUrl ? [{ url: pkg.coverUrl, alt: pkg.title }] : []),
    ...pkg.images.map((i) => ({ url: i.url, alt: i.alt || pkg.title })),
  ];
  const included = toList(pkg.included);
  const excluded = toList(pkg.excluded);
  const wa = whatsappLink(settings.whatsapp, `Hello, I'm interested in "${pkg.title}".`);

  return (
    <>
      <PageTop />
      <div className="border-b border-slate-100 bg-mist">
        <nav className="container-page flex flex-wrap items-center gap-1 py-3 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ocean">Home</Link><ChevronRight className="h-3.5 w-3.5" />
          <Link href="/packages" className="hover:text-ocean">Packages</Link><ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink">{pkg.title}</span>
        </nav>
      </div>

      <section className="section !pt-10">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <ImageGallery items={gallery} />

            <div className="mt-8">
              <Link href={`/destinations/${pkg.destination.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ocean hover:underline">
                <MapPin className="h-4 w-4" /> {pkg.destination.name}
                {pkg.destination.country ? `, ${pkg.destination.country}` : ""}
              </Link>
              <h1 className="mt-2 text-3xl sm:text-4xl">{pkg.title}</h1>
              <p className="mt-2 flex items-center gap-2 text-slate-600">
                <CalendarDays className="h-5 w-5 text-ocean" /> {formatDuration(pkg.durationDays, pkg.durationNights)}
              </p>
              <p className="mt-5 whitespace-pre-line text-[16px] text-slate-700">{pkg.description || pkg.shortDescription}</p>
            </div>

            {pkg.itinerary.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl sm:text-3xl">Travel Itinerary</h2>
                <ol className="mt-6 space-y-0">
                  {pkg.itinerary.map((d, i) => (
                    <li key={d.id} className="relative flex gap-4 pb-8 last:pb-0">
                      {i < pkg.itinerary.length - 1 && <span className="absolute left-5 top-11 h-[calc(100%-2.5rem)] w-0.5 bg-ocean/20" aria-hidden />}
                      <span className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ocean font-heading text-sm font-semibold text-white">
                        {d.dayNumber}
                      </span>
                      <div className="card flex-1 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-sunset">Day {d.dayNumber}</p>
                        <h3 className="text-lg">{d.title}</h3>
                        <p className="mt-1 text-[15px] text-slate-600">{d.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {(included.length > 0 || excluded.length > 0) && (
              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {included.length > 0 && (
                  <div className="card p-6">
                    <h2 className="text-xl">What&apos;s Included</h2>
                    <ul className="mt-4 space-y-2.5">
                      {included.map((x) => (
                        <li key={x} className="flex gap-2.5 text-[15px]"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {excluded.length > 0 && (
                  <div className="card p-6">
                    <h2 className="text-xl">Not Included</h2>
                    <ul className="mt-4 space-y-2.5">
                      {excluded.map((x) => (
                        <li key={x} className="flex gap-2.5 text-[15px]"><X className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {pkg.importantInfo && (
              <div className="mt-8 flex gap-3 rounded-2xl bg-gold/15 p-5 ring-1 ring-gold/40">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <h2 className="text-lg">Important Information</h2>
                  <p className="mt-1 whitespace-pre-line text-[15px] text-slate-700">{pkg.importantInfo}</p>
                </div>
              </div>
            )}

            {pkg.reviews.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl sm:text-3xl">What Travellers Say</h2>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {pkg.reviews.slice(0, 4).map((r) => <ReviewCard key={r.id} r={r} />)}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <p className="text-sm uppercase tracking-wide text-slate-500">Starting from</p>
              <p className="font-heading text-4xl font-semibold text-sunset">{formatPrice(pkg.price, pkg.currency)}</p>
              <p className="text-sm text-slate-500">per person · {formatDuration(pkg.durationDays, pkg.durationNights)}</p>
              <hr className="my-5 border-slate-100" />
              <h2 id="inquire" className="mb-4 text-lg">Request this package</h2>
              <InquiryForm compact packageId={pkg.id} defaultMessage={`Hi, I'd like more information about "${pkg.title}".`} />
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn mt-4 w-full bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                  <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
                </a>
              )}
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section bg-mist !py-14">
          <div className="container-page">
            <h2 className="mb-8 text-2xl sm:text-3xl">More in {pkg.destination.name}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => <PackageCard key={p.id} pkg={p} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
