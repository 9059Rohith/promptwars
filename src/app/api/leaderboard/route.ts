import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { buildAnalytics } from "@/lib/analytics";
import { carbonScore, levelForXp } from "@/lib/scoring";

/** Public leaderboard ranked by carbon score (greenest first) then XP. */
export async function GET() {
  try {
    const session = await getSession();
    const users = await prisma.user.findMany({
      select: { id: true, name: true, xp: true, streak: true, activities: true },
      take: 100,
    });

    const ranked = users
      .map((u) => {
        const analytics = buildAnalytics(
          u.activities.map((a) => ({
            category: a.category,
            subtype: a.subtype,
            amount: a.amount,
            co2: a.co2,
            date: a.date,
          })),
        );
        return {
          id: u.id,
          name: u.name,
          xp: u.xp,
          streak: u.streak,
          score: carbonScore(analytics.avgPerDay),
          level: levelForXp(u.xp).current,
          isMe: session?.sub === u.id,
        };
      })
      .sort((a, b) => b.score - a.score || b.xp - a.xp)
      .map((u, i) => ({ ...u, rank: i + 1 }));

    return ok(ranked);
  } catch (err) {
    return handleError(err);
  }
}
