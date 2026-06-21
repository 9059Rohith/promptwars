"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { PageHeader, Spinner } from "@/components/page-header";
import { api } from "@/lib/client";
import type { StatsPayload } from "@/lib/types";
import { BADGES } from "@/lib/achievements";
import { LEVELS } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export default function AchievementsPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  useEffect(() => {
    api.get<StatsPayload>("/stats").then(setStats);
  }, []);
  if (!stats) return <Spinner />;

  const unlocked = new Set(stats.achievements);

  return (
    <div>
      <PageHeader
        title="Achievements"
        subtitle={`${unlocked.size} of ${BADGES.length} badges unlocked · Level ${stats.level.current.level}`}
      />

      <Card className="mb-6 p-5">
        <p className="text-sm font-medium">Level progress</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <div
              key={l.level}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
                stats.level.current.level >= l.level
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground",
              )}
            >
              {l.emoji} {l.title}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BADGES.map((b) => {
          const got = unlocked.has(b.code);
          return (
            <Card key={b.code} className={cn("p-5 text-center transition-opacity", !got && "opacity-50")}>
              <div className={cn("text-5xl", !got && "grayscale")}>{b.emoji}</div>
              <h3 className="mt-3 font-semibold">{b.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{b.description}</p>
              <p className={cn("mt-3 text-xs font-medium", got ? "text-primary" : "text-muted-foreground")}>
                {got ? "✓ Unlocked" : "🔒 Locked"}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
