import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";
import { hashPassword, createToken, setSessionCookie } from "@/lib/auth";
import { ok, fail, handleError, clientKey } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(clientKey(req, "signup"), 10, 60_000);
    if (!rl.ok) return fail("Too many attempts, slow down", 429);

    const body = await req.json();
    const input = signupSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) return fail("An account with that email already exists", 409);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: await hashPassword(input.password),
      },
    });

    const token = await createToken({ sub: user.id, email: user.email, name: user.name });
    await setSessionCookie(token);
    return ok({ id: user.id, name: user.name, email: user.email }, 201);
  } catch (err) {
    return handleError(err);
  }
}
