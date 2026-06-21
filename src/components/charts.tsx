"use client";

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from "recharts";
import { CATEGORY_META, type Category } from "@/lib/emissions";

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--foreground)",
  fontSize: 13,
};

export function CategoryPie({ data }: { data: { category: Category; kg: number }[] }) {
  const filtered = data.filter((d) => d.kg > 0);
  if (!filtered.length) return <EmptyChart label="No emissions logged yet" />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={filtered} dataKey="kg" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {filtered.map((d) => (
            <Cell key={d.category} fill={CATEGORY_META[d.category].color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number, n: string) => [`${v} kg`, CATEGORY_META[n as Category]?.label ?? n]}
        />
        <Legend formatter={(v: string) => CATEGORY_META[v as Category]?.label ?? v} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({ data }: { data: { date: string; kg: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} stroke="var(--muted-foreground)" fontSize={11} minTickGap={24} />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} kg`, "CO₂"]} />
        <Line type="monotone" dataKey="kg" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WeeklyBars({ data }: { data: { week: string; kg: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={11} />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} kg`, "CO₂"]} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="kg" fill="var(--primary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
