import type { AnalyticsSummary } from "./analytics";
import type { ScoreBand, Level } from "./scoring";
import type { Category } from "./emissions";

export interface StatsPayload {
  analytics: AnalyticsSummary;
  score: number;
  band: ScoreBand;
  level: { current: Level; next: Level | null; progress: number };
  xp: number;
  streak: number;
  treesNeeded: number;
  achievements: string[];
  activityCount: number;
}

export interface ActivityDTO {
  id: string;
  category: Category;
  subtype: string;
  amount: number;
  unit: string;
  co2: number;
  note?: string | null;
  date: string;
  createdAt: string;
}

export interface GoalDTO {
  id: string;
  title: string;
  targetPct: number;
  baselineKg: number;
  periodDays: number;
  startDate: string;
  achieved: boolean;
  target: number;
  current: number;
  progress: number;
}

export interface LeaderRow {
  id: string;
  name: string;
  xp: number;
  streak: number;
  score: number;
  level: Level;
  rank: number;
  isMe: boolean;
}

export interface CoachResponse {
  source: "llm" | "rules";
  intro: string;
  tips: { title: string; detail: string; savingKg: number }[];
  estimatedMonthlySaving: number;
}
