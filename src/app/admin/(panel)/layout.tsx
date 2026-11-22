import { requireAdminPage } from "@/lib/auth";
import { AdminShell } from "@/components/admin/Shell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage(); // server-side authorization check
  return <AdminShell user={{ name: user.name, email: user.email }}>{children}</AdminShell>;
}
