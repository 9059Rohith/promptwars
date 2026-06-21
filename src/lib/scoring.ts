/** Carbon score & sustainability level logic. */

export interface ScoreBand {
  label: string;
  color: string;
  emoji: string;
  min: number;
  max: number;
}

/**
 * Daily emission bands (kg CO2e/day). A sustainable global target to keep
 * warming under 1.5C is roughly ~6 kg/person/day by 2030.
 */
export const SCORE_BANDS: ScoreBand[] = [
  { label: "Excellent", color: "#22c55e", emoji: "🟢", min: 0, max: 6 },
  { label: "Good", color: "#eab308", emoji: "🟡", min: 6, max: 12 },
  { label: "Needs Improvement", color: "#f97316", emoji: "🟠", min: 12, max: 20 },
  { label: "High Impact", color: "#ef4444", emoji: "🔴", min: 20, max: Infinity },
];

export function bandForDaily(avgKgPerDay: number): ScoreBand {
  return SCORE_BANDS.find((b) => avgKgPerDay >= b.min && avgKgPerDay < b.max) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

/**
 * Carbon score 0–100 (higher = greener). Maps average daily emissions to a
 * score where ~6 kg/day -> 80, 0 -> 100, 20+ -> low.
 */
export function carbonScore(avgKgPerDay: number): number {
  if (avgKgPerDay <= 0) return 100;
  const score = 100 - (avgKgPerDay / 25) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export interface Level {
  level: number;
  title: string;
  emoji: string;
  minXp: number;
}

export const LEVELS: Level[] = [
  { level: 1, title: "Eco Beginner", emoji: "🌱", minXp: 0 },
  { level: 2, title: "Green Sprout", emoji: "🌿", minXp: 100 },
  { level: 3, title: "Eco Warrior", emoji: "🌳", minXp: 300 },
  { level: 4, title: "Green Hero", emoji: "🦸", minXp: 700 },
  { level: 5, title: "Climate Champion", emoji: "🌎", minXp: 1500 },
  { level: 6, title: "Planet Guardian", emoji: "🛡️", minXp: 3000 },
];

export function levelForXp(xp: number): { current: Level; next: Level | null; progress: number } {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.minXp) current = l;
  const next = LEVELS.find((l) => l.minXp > current.minXp) ?? null;
  const progress = next
    ? Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100)
    : 100;
  return { current, next, progress };
}

/** XP earned for logging an activity — reward low-emission choices more. */
export function xpForActivity(co2: number): number {
  if (co2 === 0) return 25; // walking/cycling
  if (co2 < 2) return 15;
  if (co2 < 10) return 10;
  return 5;
}
