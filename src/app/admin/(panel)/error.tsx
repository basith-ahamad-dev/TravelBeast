"use client";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card p-10 text-center">
      <h1 className="text-xl">Something went wrong</h1>
      <p className="mt-1 text-slate-600">We couldn&apos;t load this page.</p>
      <button onClick={reset} className="btn-blue btn-sm mt-4">Try again</button>
    </div>
  );
}
