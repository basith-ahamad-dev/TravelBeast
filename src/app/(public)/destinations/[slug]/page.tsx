import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/public/PageBanner";
import { PackageCard } from "@/components/public/PackageCard";
import { ImageGallery } from "@/components/public/ImageGallery";
import { CtaSection } from "@/components/public/CtaSection";
import { getDestinationBySlug, getSettings } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await getDestinationBySlug((await params).slug);
  return d ? { title: d.name, description: d.shortDescription } : { title: "Destination not found" };
}

export default async function DestinationPage({ params }: Props) {
  const d = await getDestinationBySlug((await params).slug);
  if (!d) notFound();
  const settings = await getSettings();
  const gallery = [
    ...(d.coverUrl && !d.galleryImages.some((g) => g.url === d.coverUrl) ? [{ url: d.coverUrl, alt: d.name }] : []),
    ...d.galleryImages.map((g) => ({ url: g.url, alt: g.title })),
  ];

  return (
    <>
      <PageBanner title={d.name} subtitle={d.country ? `${d.country} · ${d.shortDescription}` : d.shortDescription} image={d.coverUrl} />
      <section className="section">
        <div className="container-page">
          {d.description && <p className="mx-auto max-w-3xl whitespace-pre-line text-center text-lg text-slate-700">{d.description}</p>}
          {gallery.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-6 text-2xl sm:text-3xl">Gallery</h2>
              <ImageGallery items={gallery} layout="grid" />
            </div>
          )}
          <div className="mt-16">
            <h2 className="mb-6 text-2xl sm:text-3xl">Packages in {d.name}</h2>
            {d.packages.length === 0 ? (
              <p className="rounded-2xl bg-mist p-10 text-center text-slate-600">No packages here yet. Contact us for a custom trip!</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {d.packages.map((p, i) => <PackageCard key={p.id} pkg={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </section>
      <CtaSection whatsapp={settings.whatsapp} />
    </>
  );
}
