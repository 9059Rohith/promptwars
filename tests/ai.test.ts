import { describe, it, expect } from "vitest";
import { ruleBasedCoach } from "@/lib/ai";

describe("ruleBasedCoach", () => {
  it("returns a get-started style intro when there are no emissions", () => {
    const r = ruleBasedCoach({ breakdown: [], totalKg: 0, avgPerDay: 0 });
    expect(r.source).toBe("rules");
    expect(r.tips).toHaveLength(0);
    expect(r.intro.toLowerCase()).toContain("no logged emissions");
  });

  it("orders tips by the largest emission source", () => {
    const r = ruleBasedCoach({
      totalKg: 100,
      avgPerDay: 5,
      breakdown: [
        { category: "transport", kg: 10 },
        { category: "food", kg: 60 },
        { category: "electricity", kg: 30 },
      ],
    });
    expect(r.tips[0].title.toLowerCase()).toContain("food");
    expect(r.intro).toContain("Food");
  });

  it("produces a positive estimated saving", () => {
    const r = ruleBasedCoach({
      totalKg: 50,
      avgPerDay: 3,
      breakdown: [{ category: "waste", kg: 50 }],
    });
    expect(r.estimatedMonthlySaving).toBeGreaterThan(0);
  });

  it("caps tips at five", () => {
    const r = ruleBasedCoach({
      totalKg: 50,
      avgPerDay: 3,
      breakdown: [
        { category: "transport", kg: 10 },
        { category: "electricity", kg: 10 },
        { category: "food", kg: 10 },
        { category: "shopping", kg: 10 },
        { category: "waste", kg: 10 },
      ],
    });
    expect(r.tips.length).toBeLessThanOrEqual(5);
  });

  it("ignores zero-emission categories", () => {
    const r = ruleBasedCoach({
      totalKg: 5,
      avgPerDay: 1,
      breakdown: [
        { category: "transport", kg: 5 },
        { category: "food", kg: 0 },
      ],
    });
    expect(r.tips).toHaveLength(1);
  });
});
