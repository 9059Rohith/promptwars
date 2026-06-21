import { describe, it, expect } from "vitest";
import { formatKg, todayISO, daysAgoISO, nextStreak } from "@/lib/utils";
import { cn } from "@/lib/utils";

describe("formatKg", () => {
  it("formats kilograms", () => {
    expect(formatKg(5.25)).toBe("5.3 kg");
    expect(formatKg(0)).toBe("0.0 kg");
  });
  it("switches to tonnes at >= 1000 kg", () => {
    expect(formatKg(1500)).toBe("1.50 t");
  });
});

describe("date helpers", () => {
  it("todayISO is YYYY-MM-DD", () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("daysAgoISO returns an earlier date", () => {
    expect(daysAgoISO(1) < todayISO()).toBe(true);
  });
});

describe("nextStreak", () => {
  it("starts at 1 with no prior log", () => {
    expect(nextStreak(null, "2026-06-21", 0)).toBe(1);
  });
  it("increments on consecutive days", () => {
    expect(nextStreak("2026-06-20", "2026-06-21", 4)).toBe(5);
  });
  it("keeps the same value when already logged today", () => {
    expect(nextStreak("2026-06-21", "2026-06-21", 4)).toBe(4);
  });
  it("resets after a gap", () => {
    expect(nextStreak("2026-06-10", "2026-06-21", 4)).toBe(1);
  });
});

describe("cn", () => {
  it("merges and dedupes tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe("text-sm font-bold");
  });
});
