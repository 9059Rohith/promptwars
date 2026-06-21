import type { AnalyticsSummary } from "./analytics";
import { badgeByCode } from "./achievements";

export interface Notification {
  id: string;
  type: "warning" | "success" | "info";
  title: string;
  message: string;
}

/** Sustainable weekly target (kg CO2e) — ~6 kg/day. */
export const WEEKLY_TARGET_KG = 42;

/**
 * Derive actionable notifications from a user's analytics, badges and streak.
 * Pure function — easy to unit test.
 */
export function buildNotifications(input: {
  analytics: AnalyticsSummary;
  achievements: string[];
  streak: number;
}): Notification[] {
  const { analytics, achievements, streak } = input;
  const out: Notification[] = [];

  if (analytics.weekKg > WEEKLY_TARGET_KG) {
    const over = Math.round(((analytics.weekKg - WEEKLY_TARGET_KG) / WEEKLY_TARGET_KG) * 100);
    out.push({
      id: "weekly-exceeded",
      type: "warning",
      title: "Weekly target exceeded",
      message: `You're ${over}% over your ${WEEKLY_TARGET_KG} kg weekly target. Try walking or transit tomorrow.`,
    });
  }

  // Compare last two days for a spike.
  const series = analytics.dailySeries;
  if (series.length >= 2) {
    const today = series[series.length - 1].kg;
    const yesterday = series[series.length - 2].kg;
    if (yesterday > 0 && today > yesterday * 1.15) {
      const up = Math.round(((today - yesterday) / yesterday) * 100);
      out.push({
        id: "daily-spike",
        type: "warning",
        title: "Emissions rising",
        message: `Today's emissions are up ${up}% vs yesterday.`,
      });
    }
  }

  if (streak >= 3) {
    out.push({
      id: "streak",
      type: "success",
      title: `🔥 ${streak}-day green streak`,
      message: "Keep logging daily to grow your streak and earn XP.",
    });
  }

  for (const code of achievements.slice(-3)) {
    const badge = badgeByCode(code);
    if (badge) {
      out.push({
        id: `badge-${code}`,
        type: "success",
        title: `${badge.emoji} Badge unlocked: ${badge.title}`,
        message: badge.description,
      });
    }
  }

  if (analytics.totalKg === 0) {
    out.push({
      id: "get-started",
      type: "info",
      title: "Start tracking",
      message: "Log your first activity in the calculator to unlock insights.",
    });
  }

  return out;
}
