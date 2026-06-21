import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** YYYY-MM-DD in local time. */
export function todayISO(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayISO(d);
}

export function formatKg(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${kg.toFixed(1)} kg`;
}

/** Compute streak given lastLogDate and today. */
export function nextStreak(lastLogDate: string | null, today: string, prev: number): number {
  if (!lastLogDate) return 1;
  if (lastLogDate === today) return prev; // already logged today
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().slice(0, 10);
  return lastLogDate === yesterday ? prev + 1 : 1;
}
