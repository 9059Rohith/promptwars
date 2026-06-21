"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardHeader, Input, Label, ProgressBar, Badge } from "@/components/ui";
import { PageHeader, Spinner } from "@/components/page-header";
import { api, ApiError } from "@/lib/client";
import type { GoalDTO } from "@/lib/types";
import { formatKg } from "@/lib/utils";

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalDTO[] | null>(null);
  const [title, setTitle] = useState("");
  const [pct, setPct] = useState(20);
  const [days, setDays] = useState(30);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function load() {
    api.get<GoalDTO[]>("/goals").then(setGoals);
  }
  useEffect(load, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await api.post("/goals", { title, targetPct: Number(pct), periodDays: Number(days) });
      setTitle("");
      load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Reduction Goals" subtitle="Commit to cutting your footprint and track progress" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <CardHeader title="New Goal" />
          <form onSubmit={create} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} required maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Cut my commute emissions" />
            </div>
            <div>
              <Label htmlFor="pct">Reduce by: {pct}%</Label>
              <input id="pct" type="range" min={5} max={90} step={5} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
            </div>
            <div>
              <Label htmlFor="days">Period (days)</Label>
              <Input id="days" type="number" min={7} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} />
            </div>
            {err && <p className="text-sm text-red-500">{err}</p>}
            <Button type="submit" loading={saving} className="w-full">Create goal</Button>
          </form>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          {!goals ? (
            <Spinner />
          ) : goals.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No goals yet — create one to get started.</Card>
          ) : (
            goals.map((g) => (
              <Card key={g.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{g.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Reduce {g.targetPct}% over {g.periodDays} days · target {formatKg(g.target)}/mo
                    </p>
                  </div>
                  {g.progress >= 100 ? <Badge className="text-primary">✅ Achieved</Badge> : <Badge>{g.progress}%</Badge>}
                </div>
                <ProgressBar value={g.progress} className="mt-4" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Baseline {formatKg(g.baselineKg)} · current {formatKg(g.current)}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
