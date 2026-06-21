import { describe, it, expect } from "vitest";
import { buildAnalytics } from "@/lib/analytics";
import { todayISO, daysAgoISO } from "@/lib/utils";

const rec = (co2: number, date: string) => ({ category: "transport", subtype: "car", amount: 1, co2, date });

describe("buildAnalytics", () => {
  it("returns zeros for empty input", () => {
    const a = buildAnalytics([]);
    expect(a.totalKg).toBe(0);
    expect(a.topSource).toBeNull();
    expect(a.breakdown.every((b) => b.kg === 0)).toBe(true);
  });

  it("computes today/week/month windows", () => {
    const a = buildAnalytics([
      rec(5, todayISO()),
      rec(3, daysAgoISO(3)),
      rec(2, daysAgoISO(20)),
      rec(9, daysAgoISO(200)),
    ]);
    expect(a.todayKg).toBe(5);
    expect(a.weekKg).toBe(8); // today + 3 days ago
    expect(a.monthKg).toBe(10); // within 30 days
    expect(a.yearKg).toBe(19); // all within a year
  });

  it("builds a 30-point daily series", () => {
    const a = buildAnalytics([rec(5, todayISO())], 30);
    expect(a.dailySeries).toHaveLength(30);
    expect(a.dailySeries[a.dailySeries.length - 1]).toEqual({ date: todayISO(), kg: 5 });
  });

  it("builds an 8-point weekly series", () => {
    const a = buildAnalytics([rec(5, todayISO())]);
    expect(a.weeklySeries).toHaveLength(8);
  });

  it("computes category percentages that reference the total", () => {
    const a = buildAnalytics([
      { category: "food", subtype: "non_veg", amount: 1, co2: 75, date: todayISO() },
      { category: "transport", subtype: "car", amount: 1, co2: 25, date: todayISO() },
    ]);
    expect(a.breakdown.find((b) => b.category === "food")?.pct).toBe(75);
    expect(a.topSource).toBe("food");
  });

  it("averages over distinct active days", () => {
    const a = buildAnalytics([rec(4, todayISO()), rec(6, daysAgoISO(1))]);
    expect(a.avgPerDay).toBe(5); // (4+6)/2 distinct days
  });
});
