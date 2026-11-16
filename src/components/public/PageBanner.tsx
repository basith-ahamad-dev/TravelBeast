import { SmartImage } from "@/components/ui/SmartImage";
import { Art } from "@/components/ui/Art";
import { WAVE, WaveBand } from "@/components/ui/WaveBand";

export function PageBanner({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle?: string;
  image?: string | null;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-deep">
      {image && <SmartImage src={image} alt="" sizes="100vw" priority className="opacity-70" />}
      <div className="absolute inset-0 bg-gradient-to-b from-deep/70 via-deep/40 to-deep/60" />
      <div className="container-page relative pb-28 pt-20 text-center text-white sm:pb-32 sm:pt-28">
        <h1 className="text-4xl font-extrabold uppercase text-white sm:text-5xl lg:text-6xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-3 max-w-2xl text-lg font-medium text-white/90">{subtitle}</p>}
      </div>
      <Art name="sun" className="absolute bottom-5 left-4 z-10 hidden h-20 sm:block lg:left-10 lg:h-28" />
      <WaveBand className="absolute inset-x-0 bottom-0" layers={[WAVE.orange, WAVE.white]} />
    </section>
  );
}

/** Dark strip so pages without a banner still open with the brand colour under the header. */
export function PageTop() {
  return (
    <div className="relative bg-deep">
      <div className="h-24 lg:h-32" />
      <WaveBand className="absolute inset-x-0 bottom-0" layers={[WAVE.orange, WAVE.white]} />
    </div>
  );
}
