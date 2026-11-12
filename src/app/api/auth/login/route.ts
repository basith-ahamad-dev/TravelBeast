import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSessionCookie, HttpError } from "@/lib/auth";
import { handle, parseBody, ok, rateLimit, clientIp } from "@/lib/api";
import { loginSchema } from "@/lib/validation";

// Always run a bcrypt compare, even for unknown emails, to avoid timing leaks.
const DUMMY = bcrypt.hashSync("not-a-real-password", 12);

export const POST = handle(async (req) => {
  rateLimit(`login:${clientIp(req)}`, 8, 10 * 60_000);
  const { email, password } = await parseBody(req, loginSchema);
  const user = await db.adminUser.findUnique({ where: { email } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY);
  if (!user || !valid) throw new HttpError(401, "Invalid email or password");
  await createSessionCookie({ id: user.id, email: user.email, name: user.name, role: user.role });
  return ok({ ok: true });
});
