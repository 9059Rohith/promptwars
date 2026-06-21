/** Badge definitions & unlock evaluation. */

export interface BadgeDef {
  code: string;
  title: string;
  emoji: string;
  description: string;
}

export const BADGES: BadgeDef[] = [
  { code: "first_log", title: "Eco Beginner", emoji: "🌱", description: "Logged your first activity" },
  { code: "green_streak_3", title: "Streak Starter", emoji: "🔥", description: "Logged 3 days in a row" },
  { code: "green_hero", title: "Green Hero", emoji: "🦸", description: "Reached level 4" },
  { code: "climate_champion", title: "Climate Champion", emoji: "🌎", description: "Reached level 5" },
  { code: "recycling_master", title: "Recycling Master", emoji: "♻️", description: "Logged 10 waste-recycling activities" },
  { code: "cycle_king", title: "Cycle King", emoji: "🚲", description: "Cycled or walked 50+ km total" },
  { code: "low_carbon_day", title: "Low-Carbon Day", emoji: "🍃", description: "Kept a day under 6 kg CO₂e" },
  { code: "goal_crusher", title: "Goal Crusher", emoji: "🎯", description: "Completed a reduction goal" },
];

export interface UserStats {
  totalActivities: number;
  streak: number;
  level: number;
  wasteActivities: number;
  zeroEmissionKm: number;
  hadLowCarbonDay: boolean;
  completedGoal: boolean;
}

/** Returns badge codes the user qualifies for given their stats. */
export function evaluateBadges(stats: UserStats): string[] {
  const earned: string[] = [];
  if (stats.totalActivities >= 1) earned.push("first_log");
  if (stats.streak >= 3) earned.push("green_streak_3");
  if (stats.level >= 4) earned.push("green_hero");
  if (stats.level >= 5) earned.push("climate_champion");
  if (stats.wasteActivities >= 10) earned.push("recycling_master");
  if (stats.zeroEmissionKm >= 50) earned.push("cycle_king");
  if (stats.hadLowCarbonDay) earned.push("low_carbon_day");
  if (stats.completedGoal) earned.push("goal_crusher");
  return earned;
}

export function badgeByCode(code: string): BadgeDef | undefined {
  return BADGES.find((b) => b.code === code);
}
