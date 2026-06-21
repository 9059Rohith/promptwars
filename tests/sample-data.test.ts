import { describe, it, expect } from "vitest";
import { generateHistory, seededRng } from "@/lib/sample-data";

describe("seededRng", () => {
  it("is deterministic for a given seed", () => {
    const a = seededRng(42);
    const b = seededRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it("produces values in [0,1)", () => {
    const r = seededRng(7);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("generateHistory", () => {
  it("is reproducible for the same seed", () => {
    const a = generateHistory(123, 30, 0.6);
    const b = generateHistory(123, 30, 0.6);
    expect(a.activities.length).toBe(b.activities.length);
    expect(a.xp).toBe(b.xp);
  });

  it("covers the requested number of days", () => {
    const { activities } = generateHistory(1, 10, 0.5);
    const days = new Set(activities.map((x) => x.date));
    expect(days.size).toBeLessThanOrEqual(10);
    expect(activities.length).toBeGreaterThanOrEqual(10);
  });

  it("computes consistent co2 and positive xp", () => {
    const { activities, xp } = generateHistory(99, 30, 0.7);
    expect(xp).toBeGreaterThan(0);
    for (const a of activities) {
      expect(a.co2).toBeGreaterThanOrEqual(0);
      expect(a.unit).toBeTruthy();
    }
  });
});
