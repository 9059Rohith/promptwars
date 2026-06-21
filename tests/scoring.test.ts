import { describe, it, expect } from "vitest";
import { carbonScore, bandForDaily, levelForXp, xpForActivity, LEVELS, SCORE_BANDS } from "@/lib/scoring";
import { evaluateBadges } from "@/lib/achievements";
import { treesToOffset, KG_CO2_PER_TREE_YEAR, EMISSION_FACTORS, CATEGORIES, calculateCO2 } from "@/lib/emissions";

describe("carbonScore boundaries", () => {
  it("clamps within 0..100", () => {
    expect(carbonScore(-5)).toBe(100);
    expect(carbonScore(1000)).toBe(0);
  });
  it("decreases monotonically with emissions", () => {
    expect(carbonScore(2)).toBeGreaterThan(carbonScore(10));
    expect(carbonScore(10)).toBeGreaterThan(carbonScore(18));
  });
});

describe("bandForDaily", () => {
  it("covers every band", () => {
    expect(bandForDaily(0).label).toBe("Excellent");
    expect(bandForDaily(6).label).toBe("Good");
    expect(bandForDaily(15).label).toBe("Needs Improvement");
    expect(bandForDaily(100).label).toBe("High Impact");
  });
  it("has contiguous, ordered bands", () => {
    for (let i = 1; i < SCORE_BANDS.length; i++) {
      expect(SCORE_BANDS[i].min).toBe(SCORE_BANDS[i - 1].max);
    }
  });
});

describe("levelForXp", () => {
  it("returns progress 100 at max level", () => {
    const max = LEVELS[LEVELS.length - 1];
    const r = levelForXp(max.minXp + 5000);
    expect(r.next).toBeNull();
    expect(r.progress).toBe(100);
  });
  it("computes partial progress toward next level", () => {
    const r = levelForXp(50); // between level 1 (0) and level 2 (100)
    expect(r.current.level).toBe(1);
    expect(r.progress).toBe(50);
  });
});

describe("xpForActivity", () => {
  it("rewards zero-emission the most", () => {
    expect(xpForActivity(0)).toBe(25);
    expect(xpForActivity(1)).toBe(15);
    expect(xpForActivity(5)).toBe(10);
    expect(xpForActivity(50)).toBe(5);
  });
});

describe("treesToOffset", () => {
  it("uses the documented absorption rate", () => {
    expect(treesToOffset(KG_CO2_PER_TREE_YEAR * 3)).toBe(3);
  });
});

describe("emission factors integrity", () => {
  it("every option has a non-negative factor and a unit", () => {
    for (const c of CATEGORIES) {
      for (const o of EMISSION_FACTORS[c]) {
        expect(o.factor).toBeGreaterThanOrEqual(0);
        expect(o.unit).toBeTruthy();
        // computed co2 must match factor * amount
        expect(calculateCO2(c, o.subtype, 4)).toBe(Math.round(o.factor * 4 * 100) / 100);
      }
    }
  });
});

describe("evaluateBadges thresholds", () => {
  it("unlocks recycling, cycle and level badges", () => {
    const b = evaluateBadges({
      totalActivities: 20, streak: 1, level: 5, wasteActivities: 10,
      zeroEmissionKm: 60, hadLowCarbonDay: true, completedGoal: true,
    });
    expect(b).toEqual(expect.arrayContaining([
      "first_log", "green_hero", "climate_champion", "recycling_master",
      "cycle_king", "low_carbon_day", "goal_crusher",
    ]));
  });
  it("unlocks nothing meaningful for an empty user", () => {
    const b = evaluateBadges({
      totalActivities: 0, streak: 0, level: 1, wasteActivities: 0,
      zeroEmissionKm: 0, hadLowCarbonDay: false, completedGoal: false,
    });
    expect(b).toHaveLength(0);
  });
});
