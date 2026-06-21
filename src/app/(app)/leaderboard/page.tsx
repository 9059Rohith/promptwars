"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { PageHeader, Spinner } from "@/components/page-header";
import { api } from "@/lib/client";
import type { LeaderRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const medals = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  useEffect(() => {
    api.get<LeaderRow[]>("/leaderboard").then(setRows);
  }, []);
  if (!rows) return <Spinner />;

  return (
    <div>
      <PageHeader title="Leaderboard" subtitle="Top eco-users ranked by carbon score & XP" />
      <Card className="divide-y divide-border">
        {rows.length === 0 && <p className="p-8 text-center text-muted-foreground">No users yet.</p>}
        {rows.map((r) => (
          <div
            key={r.id}
            className={cn(
              "flex items-center justify-between gap-3 p-4",
              r.isMe && "bg-primary/5",
            )}
          >
            <div className="flex items-center gap-4">
              <span className="w-8 text-center text-lg font-bold">{medals[r.rank - 1] ?? r.rank}</span>
              <div>
                <p className="font-medium">
                  {r.name} {r.isMe && <span className="text-xs text-primary">(you)</span>}
                </p>
                <p className="text-sm text-muted-foreground">
                  {r.level.emoji} {r.level.title} · 🔥 {r.streak}d
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">{r.score}</p>
              <p className="text-xs text-muted-foreground">{r.xp} XP</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
