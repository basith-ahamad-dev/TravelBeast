import type { Metadata } from "next";
import { PageBanner } from "@/components/public/PageBanner";
import { DestinationCard } from "@/components/public/DestinationCard";
import { listDestinations } from "@/lib/queries";

export const metadata: Metadata = { title: "Destinations" };

export default async function DestinationsPage() {
  const destinations = await listDestinations();
  return (
    <>
      <PageBanner title="Destinations" subtitle="Explore the places we love, and the packages that take you there." image="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2000&q=70" />
      <section className="section">
        <div className="container-page">
          {destinations.length === 0 ? (
            <p className="rounded-2xl bg-mist p-12 text-center text-slate-600">Destinations are coming soon.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {destinations.map((d) => <DestinationCard key={d.id} d={d} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
