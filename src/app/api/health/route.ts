import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Liveness + DB connectivity probe. Open /api/health on the deployed site to
 * confirm the database connection and env vars are wired correctly.
 */
export async function GET() {
  const checks = {
    server: true,
    database: false,
    ai: Boolean(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY),
  };
  let dbError: string | undefined;

  try {
    await prisma.user.count();
    checks.database = true;
  } catch (e) {
    dbError = e instanceof Error ? e.message.split("\n")[0] : "unknown";
  }

  const healthy = checks.server && checks.database;
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", checks, dbError },
    { status: healthy ? 200 : 503 },
  );
}
