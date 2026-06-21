import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity || activity.userId !== session.sub) {
      return fail("Activity not found", 404);
    }
    await prisma.activity.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
