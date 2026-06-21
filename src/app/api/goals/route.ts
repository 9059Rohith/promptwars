import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ok, handleError, fail, clientKey } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { goalSchema } from "@/lib/validation";
import { buildAnalytics } from "@/lib/analytics";
import { todayISO } from "@/lib/utils";
import { syncAchievements } from "@/lib/gamification";

/** Goals enriched with live progress derived from activity data. */
export async function GET() {
  try {
    const session = await requireSession();
    const [goals, activities] = await Promise.all([
      prisma.goal.findMany({ where: { userId: session.sub }, orderBy: { createdAt: "desc" } }),
      prisma.activity.findMany({ where: { userId: session.sub } }),
    ]);
    const analytics = buildAnalytics(activities);

    const enriched = goals.map((g) => {
      const target = g.baselineKg * (1 - g.targetPct / 100);
      const current = analytics.monthKg;
      // progress = how far reduction has gone toward the target reduction
      const reductionNeeded = g.baselineKg - target;
      const reductionDone = Math.max(0, g.baselineKg - current);
      const progress =
        reductionNeeded <= 0 ? 100 : Math.min(100, Math.round((reductionDone / reductionNeeded) * 100));
      return { ...g, target: Math.round(target * 10) / 10, current, progress };
    });

    return ok(enriched);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const rl = rateLimit(clientKey(req, "goals"), 30, 60_000);
    if (!rl.ok) return fail("Rate limit exceeded", 429);

    const input = goalSchema.parse(await req.json());
    const activities = await prisma.activity.findMany({ where: { userId: session.sub } });
    const analytics = buildAnalytics(activities);
    const baseline = analytics.monthKg > 0 ? analytics.monthKg : 100; // sensible default

    const goal = await prisma.goal.create({
      data: {
        userId: session.sub,
        title: input.title,
        targetPct: input.targetPct,
        periodDays: input.periodDays,
        baselineKg: baseline,
        startDate: todayISO(),
      },
    });
    await syncAchievements(session.sub);
    return ok(goal, 201);
  } catch (err) {
    return handleError(err);
  }
}
