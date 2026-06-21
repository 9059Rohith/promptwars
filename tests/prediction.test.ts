import { describe, it, expect } from "vitest";
import { forecast } from "@/lib/prediction";

const mk = (kgs: number[]) =>
  kgs.map((kg, i) => ({ date: `2026-06-${String(i + 1).padStart(2, "0")}`, kg }));

describe("forecast", () => {
  it("returns an empty forecast for insufficient data", () => {
    const f = forecast(mk([5]), 7);
    expect(f.points).toHaveLength(0);
    expect(f.trend).toBe("stable");
  });

  it("detects a rising trend and projects forward", () => {
    const f = forecast(mk([1, 2, 3, 4, 5, 6, 7]), 7);
    expect(f.trend).toBe("rising");
    expect(f.slope).toBeGreaterThan(0);
    expect(f.points).toHaveLength(7);
    expect(f.points[0].kg).toBeGreaterThan(7); // continues upward
  });

  it("detects a falling trend", () => {
    const f = forecast(mk([10, 9, 8, 7, 6, 5, 4]), 7);
    expect(f.trend).toBe("falling");
    expect(f.slope).toBeLessThan(0);
  });

  it("classifies a flat series as stable with high fit", () => {
    const f = forecast(mk([5, 5, 5, 5, 5]), 7);
    expect(f.trend).toBe("stable");
    expect(f.r2).toBe(1);
  });

  it("never projects negative emissions", () => {
    const f = forecast(mk([5, 4, 3, 2, 1]), 10);
    expect(f.points.every((p) => p.kg >= 0)).toBe(true);
  });

  it("produces a fit between 0 and 1", () => {
    const f = forecast(mk([1, 3, 2, 5, 4, 7, 6]), 7);
    expect(f.r2).toBeGreaterThanOrEqual(0);
    expect(f.r2).toBeLessThanOrEqual(1);
  });

  it("advances forecast dates past the last observed day", () => {
    const f = forecast(mk([1, 2, 3]), 2);
    expect(f.points[0].date).toBe("2026-06-04");
    expect(f.points[1].date).toBe("2026-06-05");
  });
});
