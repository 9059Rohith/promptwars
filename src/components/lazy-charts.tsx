"use client";

import dynamic from "next/dynamic";

/**
 * Code-split the Recharts-powered charts into a separate client chunk so the
 * (heavy) charting library is not part of the initial page bundle. Each chart
 * shows a lightweight skeleton while its chunk loads.
 */
function ChartSkeleton() {
  return (
    <div className="flex h-[260px] w-full items-center justify-center rounded-lg bg-muted/40" aria-hidden>
      <div className="h-32 w-32 animate-pulse rounded-full bg-muted" />
    </div>
  );
}

export const CategoryPie = dynamic(() => import("./charts").then((m) => m.CategoryPie), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
export const TrendLine = dynamic(() => import("./charts").then((m) => m.TrendLine), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
export const WeeklyBars = dynamic(() => import("./charts").then((m) => m.WeeklyBars), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
