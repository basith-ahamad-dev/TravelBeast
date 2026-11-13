import { db } from "@/lib/db";
import { handle, parseBody, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { destinationSchema } from "@/lib/validation";
import { listDestinations } from "@/lib/queries";
import { uniqueSlug } from "@/server/packages";

export const GET = handle(async () => ok(await listDestinations()));

export const POST = handle(async (req) => {
  await requireAdmin();
  const { cover, ...rest } = await parseBody(req, destinationSchema);
  const slug = await uniqueSlug("destination", rest.name);
  const d = await db.destination.create({
    data: { ...rest, country: rest.country || null, slug, coverUrl: cover?.url ?? null, coverPublicId: cover?.publicId ?? null },
  });
  return ok(d, 201);
});
