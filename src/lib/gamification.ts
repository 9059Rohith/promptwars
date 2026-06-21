import { prisma } from "./prisma";
import { evaluateBadges, type UserStats } from "./achievements";
import { levelForXp } from "./scoring";
import { buildAnalytics } from "./analytics";

/**
 * Recompute a user's achievements from their current data and persist any
 * newly-unlocked badges. Returns the list of newly unlocked badge codes.
 */
export async function syncAchievements(userId: string): Promise<string[]> {
  const [user, activities, goals, existing] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.activity.findMany({ where: { userId } }),
    prisma.goal.findMany({ where: { userId } }),
    prisma.achievement.findMany({ where: { userId }, select: { code: true } }),
  ]);
  if (!user) return [];

  const analytics = buildAnalytics(activities);
  const level = levelForXp(user.xp).current.level;

  const zeroEmissionKm = activities
    .filter((a) => a.category === "transport" && (a.subtype === "walking" || a.subtype === "cycling"))
    .reduce((s, a) => s + a.amount, 0);

  const hadLowCarbonDay = analytics.dailySeries.some((d) => d.kg > 0 && d.kg < 6);

  const stats: UserStats = {
    totalActivities: activities.length,
    streak: user.streak,
    level,
    wasteActivities: activities.filter((a) => a.category === "waste").length,
    zeroEmissionKm,
    hadLowCarbonDay,
    completedGoal: goals.some((g) => g.achieved),
  };

  const earned = evaluateBadges(stats);
  const have = new Set(existing.map((e) => e.code));
  const fresh = earned.filter((c) => !have.has(c));

  if (fresh.length) {
    await prisma.achievement.createMany({
      data: fresh.map((code) => ({ userId, code })),
    });
  }
  return fresh;
}
