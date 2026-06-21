import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema, activitySchema, goalSchema, coachSchema } from "@/lib/validation";

describe("signupSchema", () => {
  it("accepts valid input", () => {
    expect(signupSchema.safeParse({ name: "Jane", email: "j@x.com", password: "password123" }).success).toBe(true);
  });
  it("rejects short name", () => {
    expect(signupSchema.safeParse({ name: "J", email: "j@x.com", password: "password123" }).success).toBe(false);
  });
  it("rejects bad email", () => {
    expect(signupSchema.safeParse({ name: "Jane", email: "nope", password: "password123" }).success).toBe(false);
  });
  it("rejects short password", () => {
    expect(signupSchema.safeParse({ name: "Jane", email: "j@x.com", password: "short" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a non-empty password", () => {
    expect(loginSchema.safeParse({ email: "j@x.com", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "j@x.com", password: "x" }).success).toBe(true);
  });
});

describe("activitySchema", () => {
  it("accepts a valid activity", () => {
    const r = activitySchema.safeParse({ category: "transport", subtype: "car", amount: 10 });
    expect(r.success).toBe(true);
  });
  it("rejects an unknown category", () => {
    expect(activitySchema.safeParse({ category: "rocket", subtype: "x", amount: 1 }).success).toBe(false);
  });
  it("rejects non-positive amount", () => {
    expect(activitySchema.safeParse({ category: "food", subtype: "vegan", amount: 0 }).success).toBe(false);
    expect(activitySchema.safeParse({ category: "food", subtype: "vegan", amount: -3 }).success).toBe(false);
  });
  it("rejects malformed date", () => {
    expect(activitySchema.safeParse({ category: "food", subtype: "vegan", amount: 1, date: "21-06-2026" }).success).toBe(false);
    expect(activitySchema.safeParse({ category: "food", subtype: "vegan", amount: 1, date: "2026-06-21" }).success).toBe(true);
  });
});

describe("goalSchema", () => {
  it("bounds targetPct between 5 and 90", () => {
    expect(goalSchema.safeParse({ title: "Cut", targetPct: 4, periodDays: 30 }).success).toBe(false);
    expect(goalSchema.safeParse({ title: "Cut", targetPct: 95, periodDays: 30 }).success).toBe(false);
    expect(goalSchema.safeParse({ title: "Cut", targetPct: 20, periodDays: 30 }).success).toBe(true);
  });
  it("defaults periodDays to 30", () => {
    const r = goalSchema.parse({ title: "Cut", targetPct: 20 });
    expect(r.periodDays).toBe(30);
  });
});

describe("coachSchema", () => {
  it("allows empty / missing question", () => {
    expect(coachSchema.safeParse({}).success).toBe(true);
  });
  it("rejects an over-long question", () => {
    expect(coachSchema.safeParse({ question: "x".repeat(501) }).success).toBe(false);
  });
});
