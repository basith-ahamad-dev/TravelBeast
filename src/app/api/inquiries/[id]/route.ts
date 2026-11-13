import { db } from "@/lib/db";
import { handle, parseBody, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { inquiryStatusSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const { status } = await parseBody(req, inquiryStatusSchema);
  return ok(await db.inquiry.update({ where: { id }, data: { status } }));
});

export const DELETE = handle<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  await db.inquiry.delete({ where: { id } });
  return ok({ ok: true });
});
