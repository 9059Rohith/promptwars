"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardHeader } from "@/components/ui";
import { PageHeader, Spinner } from "@/components/page-header";
import { CategoryPie, WeeklyBars } from "@/components/charts";
import { api } from "@/lib/client";
import type { StatsPayload, ActivityDTO } from "@/lib/types";
import { CATEGORY_META } from "@/lib/emissions";
import { formatKg, todayISO } from "@/lib/utils";
import { Download, Printer } from "lucide-react";

export default function ReportPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [acts, setActs] = useState<ActivityDTO[]>([]);

  useEffect(() => {
    api.get<StatsPayload>("/stats").then(setStats);
    api.get<ActivityDTO[]>("/activities").then(setActs);
  }, []);

  function exportCsv() {
    const header = "date,category,subtype,amount,unit,co2_kg,note";
    const rows = acts.map((a) =>
      [a.date, a.category, a.subtype, a.amount, a.unit, a.co2, JSON.stringify(a.note ?? "")].join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carbonwise-export-${todayISO()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!stats) return <Spinner />;
  const { analytics: a, band } = stats;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <PageHeader title="Carbon Report" subtitle="A shareable summary of your impact" />
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> CSV</Button>
          <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> Download PDF</Button>
        </div>
      </div>

      <div id="report" className="space-y-4">
        <Card className="p-6 print:border-0 print:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🌍 CarbonWise Report</h2>
              <p className="text-sm text-muted-foreground">Generated {todayISO()}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold" style={{ color: band.color }}>{stats.score}/100</p>
              <p className="text-sm">{band.emoji} {band.label}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Metric label="This Month" value={formatKg(a.monthKg)} />
            <Metric label="This Year" value={formatKg(a.yearKg)} />
            <Metric label="Avg / day" value={formatKg(a.avgPerDay)} />
            <Metric label="Trees to offset" value={`${stats.treesNeeded} 🌳`} />
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Emission Sources" />
            <div className="p-5 pt-2"><CategoryPie data={a.breakdown} /></div>
          </Card>
          <Card>
            <CardHeader title="Weekly Trend" />
            <div className="p-5 pt-2"><WeeklyBars data={a.weeklySeries} /></div>
          </Card>
        </div>

        <Card className="p-5">
          <h3 className="font-semibold">Category Breakdown</h3>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Category</th>
                <th className="py-2">Emissions</th>
                <th className="py-2">Share</th>
              </tr>
            </thead>
            <tbody>
              {a.breakdown.map((b) => (
                <tr key={b.category} className="border-t border-border">
                  <td className="py-2">{CATEGORY_META[b.category].icon} {CATEGORY_META[b.category].label}</td>
                  <td className="py-2">{formatKg(b.kg)}</td>
                  <td className="py-2">{b.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Recommendations</h3>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Focus on your top source: {a.topSource ? CATEGORY_META[a.topSource].label : "—"}.</li>
            <li>Aim to keep daily emissions under 6 kg CO₂e for an &quot;Excellent&quot; score.</li>
            <li>Plant or sponsor {stats.treesNeeded} trees to offset your annual footprint.</li>
            <li>Visit the AI Coach for personalised, quantified reduction tips.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
