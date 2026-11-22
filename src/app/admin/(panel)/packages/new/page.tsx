import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { PackageForm, emptyPackage } from "@/components/admin/PackageForm";
import { EmptyState } from "@/components/admin/ui";

export default async function NewPackagePage() {
  const destinations = await db.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  return (
    <>
      <PageHeader title="New package" />
      {destinations.length === 0 ? (
        <EmptyState title="Add a destination first" text="Packages must belong to a destination." action={<Link href="/admin/destinations" className="btn-primary btn-sm">Go to destinations</Link>} />
      ) : (
        <PackageForm initial={emptyPackage} destinations={destinations} />
      )}
    </>
  );
}
