import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ok, fail, handleError, clientKey } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { coachSchema } from "@/lib/validation";
import { buildAnalytics } from "@/lib/analytics";
import { llmCoach } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const rl = rateLimit(clientKey(req, "coach"), 20, 60_000);
    if (!rl.ok) return fail("Rate limit exceeded — try again shortly", 429);

    const { question } = coachSchema.parse(await req.json());
    const activities = await prisma.activity.findMany({ where: { userId: session.sub } });
    const analytics = buildAnalytics(activities);

    const result = await llmCoach({
      question,
      totalKg: analytics.monthKg,
      avgPerDay: analytics.avgPerDay,
      breakdown: analytics.breakdown.map((b) => ({ category: b.category, kg: b.kg })),
    });

    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
