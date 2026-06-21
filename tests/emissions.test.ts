import { describe, it, expect } from "vitest";
import { calculateCO2, treesToOffset, findFactor } from "@/lib/emissions";
import { carbonScore, bandForDaily, levelForXp, xpForActivity } from "@/lib/scoring";
import { buildAnalytics } from "@/lib/analytics";
import { evaluateBadges } from "@/lib/achievements";
import { nextStreak } from "@/lib/utils";

describe("emissions", () => {
  it("computes CO2 from factor and amount", () => {
    expect(calculateCO2("transport", "car", 25)).toBe(4.8); // 25 * 0.192
    expect(calculateCO2("electricity", "electricity", 150)).toBe(71.25);
  });

  it("treats walking/cycling as zero emission", () => {
    expect(calculateCO2("transport", "walking", 10)).toBe(0);
    expect(calculateCO2("transport", "cycling", 100)).toBe(0);
  });

  it("returns 0 for invalid input", () => {
    expect(calculateCO2("transport", "car", 0)).toBe(0);
    expect(calculateCO2("transport", "nope", 10)).toBe(0);
  });

  it("finds factors", () => {
    expect(findFactor("food", "vegan")?.factor).toBe(0.7);
  });

  it("computes trees to offset", () => {
    expect(treesToOffset(21)).toBe(1);
    expect(treesToOffset(22)).toBe(2);
    expect(treesToOffset(0)).toBe(0);
  });
});

describe("scoring", () => {
  it("scores greener for lower emissions", () => {
    expect(carbonScore(0)).toBe(100);
    expect(carbonScore(25)).toBe(0);
    expect(carbonScore(6)).toBeGreaterThan(carbonScore(20));
  });

  it("bands daily emissions", () => {
    expect(bandForDaily(3).label).toBe("Excellent");
    expect(bandForDaily(8).label).toBe("Good");
    expect(bandForDaily(30).label).toBe("High Impact");
  });

  it("levels up with xp", () => {
    expect(levelForXp(0).current.level).toBe(1);
    expect(levelForXp(1500).current.level).toBe(5);
  });

  it("rewards low-carbon choices with more xp", () => {
    expect(xpForActivity(0)).toBeGreaterThan(xpForActivity(50));
  });
});

describe("analytics", () => {
  it("aggregates totals and breakdown", () => {
    const today = new Date().toISOString().slice(0, 10);
    const a = buildAnalytics([
      { category: "transport", subtype: "car", amount: 10, co2: 2, date: today },
      { category: "food", subtype: "non_veg", amount: 1, co2: 5, date: today },
    ]);
    expect(a.totalKg).toBe(7);
    expect(a.topSource).toBe("food");
    expect(a.breakdown.find((b) => b.category === "food")?.kg).toBe(5);
  });
});

describe("streak", () => {
  it("increments on consecutive days and resets on gaps", () => {
    expect(nextStreak(null, "2026-01-02", 0)).toBe(1);
    expect(nextStreak("2026-01-01", "2026-01-02", 3)).toBe(4);
    expect(nextStreak("2026-01-02", "2026-01-02", 3)).toBe(3); // same day
    expect(nextStreak("2025-12-20", "2026-01-02", 3)).toBe(1); // gap
  });
});

describe("achievements", () => {
  it("unlocks first_log and streak badge", () => {
    const badges = evaluateBadges({
      totalActivities: 5, streak: 3, level: 1, wasteActivities: 0,
      zeroEmissionKm: 0, hadLowCarbonDay: false, completedGoal: false,
    });
    expect(badges).toContain("first_log");
    expect(badges).toContain("green_streak_3");
  });
});
