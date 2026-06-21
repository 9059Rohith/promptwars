"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, ProgressBar } from "@/components/ui";
import { PageHeader, Spinner } from "@/components/page-header";
import { CategoryPie, TrendLine, WeeklyBars } from "@/components/lazy-charts";
import { api } from "@/lib/client";
import type { StatsPayload } from "@/lib/types";
import { CATEGORY_META } from "@/lib/emissions";
import { formatKg } from "@/lib/utils";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  useEffect(() => {
    api.get<StatsPayload>("/stats").then(setStats);
  }, []);
  if (!stats) return <Spinner />;
  const { analytics: a } = stats;

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
