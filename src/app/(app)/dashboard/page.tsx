"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, ProgressBar, Badge } from "@/components/ui";
import { PageHeader, Spinner } from "@/components/page-header";
import { CategoryPie, TrendLine, WeeklyBars } from "@/components/charts";
import { api } from "@/lib/client";
import type { StatsPayload } from "@/lib/types";
import { formatKg } from "@/lib/utils";
import { Flame, TreePine, Zap, Gauge, CalendarDays } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<StatsPayload>("/stats").then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return <Spinner />;

  const { analytics: a, band, level } = stats;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your carbon footprint at a glance" />

      {stats.activityCount === 0 && (
        <Card className="mb-6 p-5">
          <p className="text-sm">
            👋 Welcome! You haven&apos;t logged anything yet.{" "}
            <Link href="/calculator" className="font-medium text-primary hover:underline">
              Use the calculator
            </Link>{" "}
            to record your first activity and unlock your stats.
          </p>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Gauge className="h-5 w-5" />} label="Carbon Score" value={`${stats.score}/100`} accent={band.color}>
          <Badge className="mt-2" >{band.emoji} {band.label}</Badge>
        </StatCard>
        <StatCard icon={<Zap className="h-5 w-5" />} label="Today" value={formatKg(a.todayKg)} sub="CO₂e emitted today" />
        <StatCard icon={<CalendarDays className="h-5 w-5" />} label="This Month" value={formatKg(a.monthKg)} sub={`${formatKg(a.weekKg)} this week`} />
        <StatCard icon={<TreePine className="h-5 w-5" />} label="Trees to Offset" value={`${stats.treesNeeded}`} sub="for your annual rate" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Flame className="h-5 w-5" />} label="Green Streak" value={`${stats.streak} days`} sub="Keep logging daily!" />
        <Card className="p-5 sm:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sustainability Level</p>
              <p className="mt-1 text-xl font-bold">{level.current.emoji} {level.current.title}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {stats.xp} XP
              {level.next && <p className="text-xs">Next: {level.next.title}</p>}
            </div>
          </div>
          <ProgressBar value={level.progress} className="mt-3" />
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Emission Sources" subtitle="Breakdown by category" />
          <div className="p-5 pt-2"><CategoryPie data={a.breakdown} /></div>
        </Card>
        <Card>
          <CardHeader title="30-Day Trend" subtitle="Daily CO₂e" />
          <div className="p-5 pt-2"><TrendLine data={a.dailySeries} /></div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Weekly Trend" subtitle="Last 8 weeks" />
          <div className="p-5 pt-2"><WeeklyBars data={a.weeklySeries} /></div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, sub, accent, children,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: string; children?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span style={accent ? { color: accent } : undefined} className="text-muted-foreground">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold" style={accent ? { color: accent } : undefined}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      {children}
    </Card>
  );
}
