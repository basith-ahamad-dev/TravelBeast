import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { handle, parseBody, ok, rateLimit, clientIp, pageParams } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { inquirySchema } from "@/lib/validation";

// Public: submit an inquiry (no account needed)
export const POST = handle(async (req) => {
  rateLimit(`inq:${clientIp(req)}`, 5, 10 * 60_000);
  const input = await parseBody(req, inquirySchema);
  if (input.website) return ok({ ok: true }); // honeypot tripped: pretend success
  let packageId = input.packageId || null;
  if (packageId && !(await db.package.findUnique({ where: { id: packageId }, select: { id: true } }))) packageId = null;
  await db.inquiry.create({
    data: { name: input.name, email: input.email, phone: input.phone || null, message: input.message, packageId },
  });
  return ok({ ok: true }, 201);
});

// Admin: paginated list
export const GET = handle(async (req) => {
  await requireAdmin();
  const url = new URL(req.url);
  const { page, size, skip } = pageParams(url);
  const status = url.searchParams.get("status");
  const where: Prisma.InquiryWhereInput = status === "PENDING" || status === "CONTACTED" || status === "COMPLETED" ? { status } : {};
  const [items, total] = await Promise.all([
    db.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: size,
      include: { package: { select: { title: true } } },
    }),
    db.inquiry.count({ where }),
  ]);
  return ok({ items, total, page, pages: Math.max(1, Math.ceil(total / size)) });
});

