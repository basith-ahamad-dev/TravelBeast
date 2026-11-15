import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const styles = {
  red: { btn: "bg-sunset text-white", icon: "text-sunset" },
  blue: { btn: "bg-ocean text-white", icon: "text-ocean" },
  yellow: { btn: "bg-gold text-deep", icon: "text-deep" },
} as const;

export type PillVariant = keyof typeof styles;

/** Rounded pill with a white arrow circle on the right (the template's primary button). */
export function PillButton({ href, variant = "blue", children, className }: { href: string; variant?: PillVariant; children: React.ReactNode; className?: string }) {
  const s = styles[variant];
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-5 rounded-full py-1.5 pl-6 pr-1.5 text-[15px] font-semibold shadow-[0_6px_16px_-6px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:brightness-110 sm:gap-8 sm:text-[17px]",
        s.btn,
        className,
      )}
    >
      {children}
      <span className={cn("grid h-9 w-9 place-items-center rounded-full bg-white sm:h-10 sm:w-10", s.icon)}>
        <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-12" aria-hidden />
      </span>
    </Link>
  );
}
