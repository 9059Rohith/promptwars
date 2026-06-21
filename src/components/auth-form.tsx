"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { Button, Card, Input, Label } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { api, ApiError } from "@/lib/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSignup = mode === "signup";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd) as Record<string, string>;
    try {
      await api.post(isSignup ? "/auth/signup" : "/auth/login", payload);
      router.push(params.get("from") || "/dashboard");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? typeof err.details === "object" && err.details
            ? Object.values(err.details as Record<string, string[]>)[0]?.[0] ?? err.message
            : err.message
          : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 cw-gradient">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md p-8 animate-fade-up">
        <Link href="/" className="mb-6 flex items-center gap-2 font-bold text-lg">
          <Leaf className="h-6 w-6 text-primary" /> CarbonWise
        </Link>
        <h1 className="text-2xl font-bold">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSignup ? "Start your journey to a lower footprint." : "Log in to continue tracking."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {isSignup && (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" autoComplete="name" required placeholder="Jane Green" />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={isSignup ? 8 : undefined}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {isSignup ? "Create account" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account? " : "New to CarbonWise? "}
          <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-primary hover:underline">
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </Card>
    </div>
  );
}
