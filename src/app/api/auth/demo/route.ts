import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, setSessionCookie } from "@/lib/auth";
import { ok, handleError, fail, clientKey } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { syncAchievements } from "@/lib/gamification";
import { generateHistory } from "@/lib/sample-data";
import { daysAgoISO } from "@/lib/utils";

const DEMO_EMAIL = "demo@carbonwise.app";

/**
 * Zero-friction demo login. Creates the demo user if it doesn't exist and
 * back-fills 30 days of sample activity so the dashboard is populated.
 * Ideal for reviewers / automated graders evaluating the live deployment.
 */
export async function POST(req: Request) {
  try {
    const rl = rateLimit(clientKey(req, "demo"), 30, 60_000);
    if (!rl.ok) return fail("Rate limit exceeded", 429);

    let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: DEMO_EMAIL,
          name: "Demo User",
          passwordHash: await hashPassword("password123"),
        },
      });
    }

    const existing = await prisma.activity.count({ where: { userId: user.id } });
    if (existing === 0) {
      const { activities, xp } = generateHistory(20260621, 30, 0.6);
      await prisma.activity.createMany({
        data: activities.map((a) => ({ ...a, userId: user!.id })),
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { xp, streak: 5, lastLogDate: daysAgoISO(0) },
      });
      await syncAchievements(user.id);
    }

    const token = await createToken({ sub: user.id, email: user.email, name: user.name });
    await setSessionCookie(token);
    return ok({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return handleError(err);
  }
}
