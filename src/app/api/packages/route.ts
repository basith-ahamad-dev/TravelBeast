import { handle, parseBody, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { packageSchema } from "@/lib/validation";
import { listPackages } from "@/lib/queries";
import { createPackage } from "@/server/packages";

// Public: published packages with filters
export const GET = handle(async (req) => {
  const sp = new URL(req.url).searchParams;
  const duration = sp.get("duration");
  const data = await listPackages({
    q: sp.get("q")?.slice(0, 100) || undefined,
    destination: sp.get("destination") || undefined,
    maxPrice: Number(sp.get("maxPrice")) || undefined,
    duration: duration === "short" || duration === "medium" || duration === "long" ? duration : undefined,
    page: Number(sp.get("page")) || 1,
  });
  return ok(data);
});

// Admin: create
export const POST = handle(async (req) => {
  await requireAdmin();
  const input = await parseBody(req, packageSchema);
  const pkg = await createPackage(input);
  return ok(pkg, 201);
});
