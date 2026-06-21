import { describe, it, expect } from "vitest";
import { buildNotifications, WEEKLY_TARGET_KG } from "@/lib/notifications";
import { buildAnalytics } from "@/lib/analytics";
import { todayISO, daysAgoISO } from "@/lib/utils";

function analyticsWith(records: { co2: number; date: string }[]) {
  return buildAnalytics(
    records.map((r) => ({ category: "transport", subtype: "car", amount: 1, ...r })),
  );
}

describe("buildNotifications", () => {
  it("warns when the weekly target is exceeded", () => {
    const analytics = analyticsWith([{ co2: WEEKLY_TARGET_KG + 20, date: todayISO() }]);
    const n = buildNotifications({ analytics, achievements: [], streak: 0 });
    expect(n.some((x) => x.id === "weekly-exceeded" && x.type === "warning")).toBe(true);
  });

  it("celebrates a streak of 3+", () => {
    const analytics = analyticsWith([{ co2: 1, date: todayISO() }]);
    const n = buildNotifications({ analytics, achievements: [], streak: 5 });
    expect(n.some((x) => x.id === "streak" && x.type === "success")).toBe(true);
  });

  it("surfaces unlocked badges", () => {
    const analytics = analyticsWith([{ co2: 1, date: todayISO() }]);
    const n = buildNotifications({ analytics, achievements: ["first_log"], streak: 0 });
    expect(n.some((x) => x.id === "badge-first_log")).toBe(true);
  });

  it("prompts to get started with no data", () => {
    const analytics = analyticsWith([]);
    const n = buildNotifications({ analytics, achievements: [], streak: 0 });
    expect(n.some((x) => x.id === "get-started" && x.type === "info")).toBe(true);
  });

  it("detects a day-over-day spike", () => {
    const analytics = analyticsWith([
      { co2: 2, date: daysAgoISO(1) },
      { co2: 10, date: daysAgoISO(0) },
    ]);
    const n = buildNotifications({ analytics, achievements: [], streak: 0 });
    expect(n.some((x) => x.id === "daily-spike")).toBe(true);
  });
});
