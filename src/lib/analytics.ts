import { CATEGORIES, type Category } from "./emissions";
import { daysAgoISO, todayISO } from "./utils";

export interface ActivityRecord {
  category: string;
  subtype: string;
  amount: number;
  co2: number;
  date: string;
}

export interface AnalyticsSummary {
  totalKg: number;
  todayKg: number;
  weekKg: number;
  monthKg: number;
  yearKg: number;
  avgPerDay: number;
  breakdown: { category: Category; kg: number; pct: number }[];
  topSource: Category | null;
  dailySeries: { date: string; kg: number }[];
  weeklySeries: { week: string; kg: number }[];
}

function sumInRange(acts: ActivityRecord[], fromISO: string): number {
  return acts.filter((a) => a.date >= fromISO).reduce((s, a) => s + a.co2, 0);
}

/** Build the full analytics summary used by dashboard, analytics & reports. */
export function buildAnalytics(acts: ActivityRecord[], days = 30): AnalyticsSummary {
  const today = todayISO();
  const totalKg = round(acts.reduce((s, a) => s + a.co2, 0));
  const todayKg = round(sumInRange(acts, today));
  const weekKg = round(sumInRange(acts, daysAgoISO(6)));
  const monthKg = round(sumInRange(acts, daysAgoISO(29)));
  const yearKg = round(sumInRange(acts, daysAgoISO(364)));

  // Category breakdown
  const byCat = new Map<Category, number>();
  for (const c of CATEGORIES) byCat.set(c, 0);
  for (const a of acts) {
    const c = a.category as Category;
    if (byCat.has(c)) byCat.set(c, byCat.get(c)! + a.co2);
  }
  const total = totalKg || 1;
  const breakdown = CATEGORIES.map((category) => {
    const kg = round(byCat.get(category) ?? 0);
    return { category, kg, pct: Math.round((kg / total) * 100) };
  });
  const topSource =
    breakdown.filter((b) => b.kg > 0).sort((a, b) => b.kg - a.kg)[0]?.category ?? null;

  // Daily series for the last `days` days
  const dailyMap = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) dailyMap.set(daysAgoISO(i), 0);
  for (const a of acts) {
    if (dailyMap.has(a.date)) dailyMap.set(a.date, dailyMap.get(a.date)! + a.co2);
  }
  const dailySeries = [...dailyMap.entries()].map(([date, kg]) => ({
    date,
    kg: round(kg),
  }));

  // Weekly series (last 8 weeks)
  const weeklySeries: { week: string; kg: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const start = daysAgoISO(w * 7 + 6);
    const end = daysAgoISO(w * 7);
    const kg = acts
      .filter((a) => a.date >= start && a.date <= end)
      .reduce((s, a) => s + a.co2, 0);
    weeklySeries.push({ week: `W-${w}`, kg: round(kg) });
  }

  // Average per active day (avoid dividing by huge zero ranges)
  const distinctDays = new Set(acts.map((a) => a.date)).size || 1;
  const avgPerDay = round(totalKg / distinctDays);

  return {
    totalKg,
    todayKg,
    weekKg,
    monthKg,
    yearKg,
    avgPerDay,
    breakdown,
    topSource,
    dailySeries,
    weeklySeries,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
