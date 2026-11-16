import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { Art } from "@/components/ui/Art";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=70";

/** Full-bleed photo banner with a call to action (sits between content sections). */
export function CtaSection({ whatsapp, image }: { whatsapp?: string | null; image?: string | null }) {
  return (
    <section className="relative isolate overflow-hidden bg-deep">
      <SmartImage src={image || DEFAULT_IMAGE} alt="" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-deep/80 via-deep/45 to-deep/10" />
      <Art name="sparkle-gold" className="absolute right-[8%] top-10 hidden h-24 sm:block" />
      <div className="container-page relative py-20 sm:py-28">
        <div className="max-w-xl text-white">
          <h2 className="text-4xl text-white sm:text-5xl">Your Next Adventure Starts Here.</h2>
          <p className="mt-4 text-lg font-semibold text-gold">Tell us your dream destination.</p>
          <p className="mt-2 text-white/90">We will take care of the rest, from flights to hidden gems.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/packages" className="btn-primary">
              Explore Packages <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-ghost">
              <MessageCircle className="h-4 w-4" /> Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
