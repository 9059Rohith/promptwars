"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, Badge, ProgressBar } from "@/components/ui";
import { PageHeader, Spinner } from "@/components/page-header";
import { api } from "@/lib/client";
import type { Level } from "@/lib/scoring";

interface Me {
  id: string;
  name: string;
  email: string;
  xp: number;
  streak: number;
  createdAt: string;
  level: { current: Level; next: Level | null; progress: number };
}

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    api.get<Me>("/auth/me").then(setMe);
  }, []);
  if (!me) return <Spinner />;

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your account & progress" />
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {me.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{me.name}</h2>
            <p className="text-sm text-muted-foreground">{me.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Member since {me.createdAt.slice(0, 10)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Level" value={`${me.level.current.emoji} ${me.level.current.title}`} />
          <Stat label="XP" value={`${me.xp}`} />
          <Stat label="Streak" value={`🔥 ${me.streak} days`} />
        </div>

        <div className="mt-6">
          <div className="mb-1 flex justify-between text-sm">
            <span>Progress to {me.level.next?.title ?? "max level"}</span>
            <span className="text-muted-foreground">{me.level.progress}%</span>
          </div>
          <ProgressBar value={me.level.progress} />
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
