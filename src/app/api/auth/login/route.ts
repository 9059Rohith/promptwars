import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { verifyPassword, createToken, setSessionCookie } from "@/lib/auth";
import { ok, fail, handleError, clientKey } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(clientKey(req, "login"), 10, 60_000);
    if (!rl.ok) return fail("Too many attempts, slow down", 429);

    const body = await req.json();
    const input = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    // Constant-ish response to avoid user enumeration.
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      return fail("Invalid email or password", 401);
    }

    const token = await createToken({ sub: user.id, email: user.email, name: user.name });
    await setSessionCookie(token);
    return ok({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return handleError(err);
  }
}
