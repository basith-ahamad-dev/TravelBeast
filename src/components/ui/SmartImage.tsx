import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** next/image `fill` wrapper with a branded placeholder when there is no image. */
export function SmartImage({
  src,
  alt,
  sizes = "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw",
  className,
  priority,
}: {
  src?: string | null;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src)
    return (
      <div className={cn("absolute inset-0 grid place-items-center bg-gradient-to-br from-sky/30 to-ocean/30 text-ocean/60", className)}>
        <ImageIcon className="h-10 w-10" aria-hidden />
      </div>
    );
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />;
}
