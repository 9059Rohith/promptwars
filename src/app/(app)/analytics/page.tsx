"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, ProgressBar } from "@/components/ui";
import { PageHeader, Spinner } from "@/components/page-header";
import { CategoryPie, TrendLine, WeeklyBars } from "@/components/lazy-charts";
import { api } from "@/lib/client";
import type { StatsPayload } from "@/lib/types";
import { CATEGORY_META } from "@/lib/emissions";
import { formatKg } from "@/lib/utils";
import { forecast } from "@/lib/prediction";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  useEffect(() => {
    api.get<StatsPayload>("/stats").then(setStats);
  }, []);
  if (!stats) return <Spinner />;
  const { analytics: a } = stats;
  const fc = forecast(a.dailySeries, 7);
  const TrendIcon = fc.trend === "rising" ? TrendingUp : fc.trend === "falling" ? TrendingDown : Minus;
  const trendColor = fc.trend === "rising" ? "text-red-500" : fc.trend === "falling" ? "text-primary" : "text-muted-foreground";

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Understand where your emissions come from" />

      <div className="mb-4 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Today", v: a.todayKg },
          { label: "This Week", v: a.weekKg },
          { label: "This Month", v: a.monthKg },
          { label: "This Year", v: a.yearKg },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-xl font-bold">{formatKg(s.v)}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-4 p-5">
        <CardHeader title="🔮 Carbon Forecast" subtitle="ML linear-regression projection from your recent trend" />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Trend</p>
            <p className={`mt-1 flex items-center gap-1.5 text-lg font-bold capitalize ${trendColor}`}>
              <TrendIcon className="h-5 w-5" /> {fc.trend}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Projected next 30 days</p>
            <p className="mt-1 text-lg font-bold">{formatKg(fc.projectedMonthlyKg)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Model fit (R²)</p>
            <p className="mt-1 text-lg font-bold">{fc.r2}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {fc.trend === "rising"
            ? "Your emissions are trending up — check the AI Coach for ways to reverse it."
            : fc.trend === "falling"
              ? "Great work — your emissions are trending down. Keep it up!"
              : "Your emissions are holding steady."}
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Emission Sources" subtitle={a.topSource ? `Top source: ${CATEGORY_META[a.topSource].label}` : undefined} />
          <div className="p-5 pt-2"><CategoryPie data={a.breakdown} /></div>
        </Card>

        <Card>
          <CardHeader title="Category Breakdown" />
          <div className="space-y-4 p-5">
            {a.breakdown.map((b) => (
              <div key={b.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{CATEGORY_META[b.category].icon} {CATEGORY_META[b.category].label}</span>
                  <span className="text-muted-foreground">{formatKg(b.kg)} · {b.pct}%</span>
                </div>
                <ProgressBar value={b.pct} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Daily Trend" subtitle="Last 30 days" />
          <div className="p-5 pt-2"><TrendLine data={a.dailySeries} /></div>
        </Card>

        <Card>
          <CardHeader title="Weekly Trend" subtitle="Last 8 weeks" />
          <div className="p-5 pt-2"><WeeklyBars data={a.weeklySeries} /></div>
        </Card>
      </div>
    </div>
  );
}
