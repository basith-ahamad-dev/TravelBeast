import { destroySessionCookie } from "@/lib/auth";
import { handle, ok } from "@/lib/api";

export const POST = handle(async () => {
  await destroySessionCookie();
  return ok({ ok: true });
});
