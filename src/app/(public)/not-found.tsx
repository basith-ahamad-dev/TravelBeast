import Link from "next/link";
import { PageTop } from "@/components/public/PageBanner";
import { Art } from "@/components/ui/Art";

export default function NotFound() {
  return (
    <>
      <PageTop />
      <section className="container-page grid min-h-[50vh] place-items-center py-20 text-center">
        <div>
          <Art name="compass" className="mx-auto mb-4 h-24" />
          <p className="font-heading text-6xl font-bold text-sunset">404</p>
          <h1 className="mt-2 text-3xl">We couldn&apos;t find that page</h1>
          <p className="mt-2 text-slate-600">It may have moved, or the trip is no longer available.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/" className="btn-blue">Go home</Link>
            <Link href="/packages" className="btn-outline">Browse packages</Link>
          </div>
        </div>
      </section>
    </>
  );
}
