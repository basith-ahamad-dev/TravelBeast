import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/queries";

export default async function AdminSettingsPage() {
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Website settings" subtitle="Contact details, social links, homepage and footer content." />
      <SettingsForm
        initial={{
          companyName: s.companyName, email: s.email ?? "", phone: s.phone ?? "", whatsapp: s.whatsapp ?? "", address: s.address ?? "",
          facebookUrl: s.facebookUrl ?? "", instagramUrl: s.instagramUrl ?? "", tiktokUrl: s.tiktokUrl ?? "", youtubeUrl: s.youtubeUrl ?? "",
          heroTitle: s.heroTitle, heroSubtitle: s.heroSubtitle, heroImageUrl: s.heroImageUrl ?? "", logoUrl: s.logoUrl ?? "",
          aboutText: s.aboutText, mission: s.mission, vision: s.vision, footerText: s.footerText,
        }}
      />
    </>
  );
}
