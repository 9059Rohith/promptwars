import { calculateCO2, findFactor, type Category } from "./emissions";
import { xpForActivity } from "./scoring";
import { daysAgoISO } from "./utils";

/** A representative activity mix used to populate demo / seed accounts. */
const SAMPLE_MIX: { category: Category; subtype: string }[] = [
  { category: "transport", subtype: "car" },
  { category: "transport", subtype: "metro" },
  { category: "transport", subtype: "cycling" },
  { category: "electricity", subtype: "electricity" },
  { category: "food", subtype: "non_veg" },
  { category: "food", subtype: "vegetarian" },
  { category: "waste", subtype: "plastic" },
];

/** Deterministic pseudo-random generator so generated data is reproducible. */
export function seededRng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface GeneratedActivity {
  category: string;
  subtype: string;
  amount: number;
  unit: string;
  co2: number;
  date: string;
}

export interface GeneratedHistory {
  activities: GeneratedActivity[];
  xp: number;
}

/**
 * Generate `days` of realistic activity history for a user.
 * `intensity` (0..1) scales typical amounts. Pure & deterministic given a seed.
 */
export function generateHistory(seed: number, days = 30, intensity = 0.6): GeneratedHistory {
  const rand = seededRng(seed);
  const activities: GeneratedActivity[] = [];
  let xp = 0;

  for (let day = 0; day < days; day++) {
    const count = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < count; i++) {
      const pick = SAMPLE_MIX[Math.floor(rand() * SAMPLE_MIX.length)];
      const factor = findFactor(pick.category, pick.subtype);
      if (!factor) continue;
      const amount = Math.round((1 + rand() * 30 * intensity) * 10) / 10;
      const co2 = calculateCO2(pick.category, pick.subtype, amount);
      xp += xpForActivity(co2);
      activities.push({
        category: pick.category,
        subtype: pick.subtype,
        amount,
        unit: factor.unit,
        co2,
        date: daysAgoISO(day),
      });
    }
  }

  return { activities, xp };
}
