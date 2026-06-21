import { z } from "zod";
import { CATEGORIES } from "./emissions";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const activitySchema = z.object({
  category: z.enum(CATEGORIES as [string, ...string[]]),
  subtype: z.string().min(1),
  amount: z.number().positive("Amount must be greater than 0").max(1_000_000),
  note: z.string().max(200).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional(),
});

export const goalSchema = z.object({
  title: z.string().min(2).max(80),
  targetPct: z.number().int().min(5).max(90),
  periodDays: z.number().int().min(7).max(365).default(30),
});

export const coachSchema = z.object({
  question: z.string().max(500).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type GoalInput = z.infer<typeof goalSchema>;
