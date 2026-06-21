import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ok, fail, handleError, clientKey } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { activitySchema } from "@/lib/validation";
import { calculateCO2, findFactor, type Category } from "@/lib/emissions";
import { xpForActivity } from "@/lib/scoring";
import { nextStreak, todayISO } from "@/lib/utils";
import { syncAchievements } from "@/lib/gamification";

export async function GET() {
  try {
    const session = await requireSession();
    const activities = await prisma.activity.findMany({
      where: { userId: session.sub },
      orderBy: { date: "desc" },
      take: 500,
    });
    return ok(activities);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const rl = rateLimit(clientKey(req, "activities"), 120, 60_000);
    if (!rl.ok) return fail("Rate limit exceeded", 429);

    const input = activitySchema.parse(await req.json());
    const category = input.category as Category;
    const factor = findFactor(category, input.subtype);
    if (!factor) return fail("Unknown activity subtype", 400);

    const co2 = calculateCO2(category, input.subtype, input.amount);
    const date = input.date ?? todayISO();

    const activity = await prisma.activity.create({
      data: {
        userId: session.sub,
        category,
        subtype: input.subtype,
        amount: input.amount,
        unit: factor.unit,
        co2,
        note: input.note,
        date,
      },
    });

    // Update gamification: XP + streak.
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (user) {
      const today = todayISO();
      const streak = nextStreak(user.lastLogDate, today, user.streak);
      await prisma.user.update({
        where: { id: user.id },
        data: { xp: user.xp + xpForActivity(co2), streak, lastLogDate: today },
      });
    }

    const newBadges = await syncAchievements(session.sub);
    return ok({ activity, newBadges }, 201);
  } catch (err) {
    return handleError(err);
  }
}
