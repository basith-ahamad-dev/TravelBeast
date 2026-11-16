import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { getSettings, listDestinations } from "@/lib/queries";
import { whatsappLink } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

// Content is edited from the admin dashboard, so always render fresh data.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, destinations] = await Promise.all([getSettings(), listDestinations()]);
  const wa = whatsappLink(settings.whatsapp, "Hello TravelBeast, I would like to know more about your packages.");
  return (
    <>
      <Navbar logoUrl={settings.logoUrl} email={settings.email} phone={settings.phone} facebookUrl={settings.facebookUrl} instagramUrl={settings.instagramUrl} tiktokUrl={settings.tiktokUrl} youtubeUrl={settings.youtubeUrl} />
      <main className="relative">{children}</main>
      <Footer s={settings} destinations={destinations} />
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      )}
    </>
  );
}
