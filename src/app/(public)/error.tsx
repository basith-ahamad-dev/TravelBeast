"use client";

import { PageTop } from "@/components/public/PageBanner";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <PageTop />
      <section className="container-page grid min-h-[50vh] place-items-center py-20 text-center">
        <div>
          <h1 className="text-3xl">Something went wrong</h1>
          <p className="mt-2 text-slate-600">We couldn&apos;t load this page. Please try again.</p>
          <button onClick={reset} className="btn-blue mt-6">Try again</button>
        </div>
      </section>
    </>
  );
}
