"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { PageHeader, Spinner } from "@/components/page-header";
import { api } from "@/lib/client";
import type { ActivityDTO } from "@/lib/types";
import { EMISSION_FACTORS, CATEGORY_META, type Category } from "@/lib/emissions";
import { formatKg } from "@/lib/utils";
import { Trash2 } from "lucide-react";

function label(category: Category, subtype: string) {
  return EMISSION_FACTORS[category]?.find((o) => o.subtype === subtype)?.label ?? subtype;
}

export default function ActivitiesPage() {
  const [items, setItems] = useState<ActivityDTO[] | null>(null);

  function load() {
    api.get<ActivityDTO[]>("/activities").then(setItems);
  }
  useEffect(load, []);

  async function remove(id: string) {
    setItems((prev) => prev?.filter((a) => a.id !== id) ?? null);
    await api.del(`/activities/${id}`).catch(load);
  }

  if (!items) return <Spinner />;

  const grouped = items.reduce<Record<string, ActivityDTO[]>>((acc, a) => {
    (acc[a.date] ??= []).push(a);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <PageHeader title="Activity Log" subtitle="Your complete emission history" />

      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No activities yet.</p>
          <Link href="/calculator" className="mt-3 inline-block font-medium text-primary hover:underline">
            Log your first activity →
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => {
            const dayTotal = grouped[date].reduce((s, a) => s + a.co2, 0);
            return (
              <div key={date}>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-muted-foreground">{date}</h2>
                  <Badge>{formatKg(dayTotal)} total</Badge>
                </div>
                <Card className="divide-y divide-border">
                  {grouped[date].map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden>{CATEGORY_META[a.category].icon}</span>
                        <div>
                          <p className="font-medium">{label(a.category, a.subtype)}</p>
                          <p className="text-sm text-muted-foreground">
                            {a.amount} {a.unit}
                            {a.note ? ` · ${a.note}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatKg(a.co2)}</span>
                        <button
                          onClick={() => remove(a.id)}
                          aria-label="Delete activity"
                          className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
