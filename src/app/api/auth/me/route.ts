import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { levelForXp } from "@/lib/scoring";

export async function GET() {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true, name: true, email: true, xp: true, streak: true, createdAt: true },
    });
    if (!user) return ok(null);
    const level = levelForXp(user.xp);
    return ok({ ...user, level });
  } catch (err) {
    return handleError(err);
  }
}
