/**
 * Lightweight carbon forecasting using ordinary least-squares linear
 * regression over the recent daily emission series. Pure & deterministic.
 */

export interface DailyPoint {
  date: string;
  kg: number;
}

export interface Forecast {
  /** Projected emissions for each of the next `horizon` days. */
  points: { date: string; kg: number }[];
  /** Projected total over the next 30 days. */
  projectedMonthlyKg: number;
  /** Per-day slope (kg/day): >0 rising, <0 falling. */
  slope: number;
  trend: "rising" | "falling" | "stable";
  /** Goodness of fit (R²), 0..1. */
  r2: number;
}

function nextDateISO(iso: string, addDays: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + addDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Fit y = a + b·x over the series (x = day index) and project forward.
 * `horizon` days are forecast; negatives are clamped to 0 (no negative CO₂).
 */
export function forecast(series: DailyPoint[], horizon = 7): Forecast {
  const n = series.length;
  if (n < 2) {
    return { points: [], projectedMonthlyKg: 0, slope: 0, trend: "stable", r2: 0 };
  }

  const xs = series.map((_, i) => i);
  const ys = series.map((p) => p.kg);
  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  const meanY = ys.reduce((s, y) => s + y, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;

  // R²
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const pred = intercept + slope * xs[i];
    ssRes += (ys[i] - pred) ** 2;
    ssTot += (ys[i] - meanY) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  const lastDate = series[n - 1].date;
  const points = Array.from({ length: horizon }, (_, k) => {
    const x = n + k;
    const kg = Math.max(0, Math.round((intercept + slope * x) * 100) / 100);
    return { date: nextDateISO(lastDate, k + 1), kg };
  });

  const projectedMonthlyKg = Math.round(points.reduce((s, p) => s + p.kg, 0) * (30 / horizon) * 10) / 10;
  const trend: Forecast["trend"] = Math.abs(slope) < 0.05 ? "stable" : slope > 0 ? "rising" : "falling";

  return { points, projectedMonthlyKg, slope: Math.round(slope * 1000) / 1000, trend, r2: Math.round(r2 * 100) / 100 };
}
