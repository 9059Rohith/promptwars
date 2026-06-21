import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { buildAnalytics } from "@/lib/analytics";
import { buildNotifications } from "@/lib/notifications";

export async function GET() {
  try {
    const session = await requireSession();
    const [user, activities, achievements] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.sub }, select: { streak: true } }),
      prisma.activity.findMany({ where: { userId: session.sub } }),
      prisma.achievement.findMany({ where: { userId: session.sub }, select: { code: true } }),
    ]);

    const analytics = buildAnalytics(activities);
    const notifications = buildNotifications({
      analytics,
      achievements: achievements.map((a) => a.code),
      streak: user?.streak ?? 0,
    });

    return ok(notifications);
  } catch (err) {
    return handleError(err);
  }
}
