import { db } from "@/lib/db";
import { handle, parseBody, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { reviewSchema } from "@/lib/validation";
import { publishedReviews } from "@/lib/queries";
import { reviewData } from "@/server/reviews";

export const GET = handle(async () => ok(await publishedReviews(12)));

export const POST = handle(async (req) => {
  await requireAdmin();
  const input = await parseBody(req, reviewSchema);
  const r = await db.review.create({ data: reviewData(input) });
  return ok(r, 201);
});
