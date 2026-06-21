import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { buildAnalytics } from "@/lib/analytics";
import { carbonScore, bandForDaily, levelForXp } from "@/lib/scoring";
import { treesToOffset } from "@/lib/emissions";

/** Aggregated dashboard payload: analytics + score + gamification + badges. */
export async function GET() {
  try {
    const session = await requireSession();
    const [user, activities, achievements] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.sub } }),
      prisma.activity.findMany({ where: { userId: session.sub } }),
      prisma.achievement.findMany({ where: { userId: session.sub } }),
    ]);

    const analytics = buildAnalytics(activities);
    const score = carbonScore(analytics.avgPerDay);
    const band = bandForDaily(analytics.avgPerDay);
    const level = levelForXp(user?.xp ?? 0);
    const treesNeeded = treesToOffset(analytics.yearKg || analytics.monthKg * 12);

    return ok({
      analytics,
      score,
      band,
      level,
      xp: user?.xp ?? 0,
      streak: user?.streak ?? 0,
      treesNeeded,
      achievements: achievements.map((a) => a.code),
      activityCount: activities.length,
    });
  } catch (err) {
    return handleError(err);
  }
}
