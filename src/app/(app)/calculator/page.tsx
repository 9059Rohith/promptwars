"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardHeader, Input, Label, Select, Badge } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { EMISSION_FACTORS, CATEGORY_META, CATEGORIES, calculateCO2, type Category } from "@/lib/emissions";
import { api, ApiError } from "@/lib/client";
import { formatKg, todayISO } from "@/lib/utils";

export default function CalculatorPage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("transport");
  const [subtype, setSubtype] = useState(EMISSION_FACTORS.transport[0].subtype);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const options = EMISSION_FACTORS[category];
  const selected = options.find((o) => o.subtype === subtype) ?? options[0];
  const numericAmount = parseFloat(amount) || 0;
  const co2 = useMemo(
    () => calculateCO2(category, subtype, numericAmount),
    [category, subtype, numericAmount],
  );

  function onCategoryChange(c: Category) {
    setCategory(c);
    setSubtype(EMISSION_FACTORS[c][0].subtype);
  }

  async function save() {
    if (numericAmount <= 0) {
      setToast({ msg: "Enter an amount greater than 0", ok: false });
      return;
    }
    setSaving(true);
    setToast(null);
    try {
      const res = await api.post<{ newBadges: string[] }>("/activities", {
        category, subtype, amount: numericAmount, date, note: note || undefined,
      });
      const badgeMsg = res.newBadges.length ? ` 🏅 New badge unlocked!` : "";
      setToast({ msg: `Logged ${formatKg(co2)} CO₂e.${badgeMsg}`, ok: true });
      setAmount("");
      setNote("");
      router.refresh();
    } catch (e) {
      setToast({ msg: e instanceof ApiError ? e.message : "Failed to save", ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Carbon Calculator" subtitle="Log an activity and see its CO₂ impact instantly" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          {/* Category tabs */}
          <Label>Category</Label>
          <div className="mb-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => onCategoryChange(c)}
                aria-pressed={category === c}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                {CATEGORY_META[c].icon} {CATEGORY_META[c].label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="subtype">Type</Label>
              <Select id="subtype" value={subtype} onChange={(e) => setSubtype(e.target.value)}>
                {options.map((o) => (
                  <option key={o.subtype} value={o.subtype}>
                    {o.icon} {o.label} ({o.factor} kg/{o.unit})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount ({selected.unit})</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`e.g. 25 ${selected.unit}`}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Input id="note" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="Commute to work" />
            </div>
          </div>

          <Button onClick={save} loading={saving} size="lg" className="mt-5 w-full sm:w-auto">
            Log activity
          </Button>

          {toast && (
            <p
              role="status"
              aria-live="polite"
              className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                toast.ok ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500"
              }`}
            >
              {toast.msg}
            </p>
          )}
        </Card>

        {/* Live preview */}
        <Card className="p-5">
          <CardHeader title="Live Estimate" subtitle="Updates as you type" />
          <div className="mt-6 text-center">
            <div className="text-5xl">{selected.icon}</div>
            <p className="mt-4 text-4xl font-extrabold text-primary">{co2}</p>
            <p className="text-sm text-muted-foreground">kg CO₂e</p>
            <div className="mt-4 rounded-lg bg-muted p-3 text-left text-sm">
              <p className="font-mono">
                {numericAmount || 0} {selected.unit} × {selected.factor} = {co2} kg
              </p>
            </div>
            {co2 === 0 && numericAmount > 0 && (
              <Badge className="mt-3 text-primary">🌱 Zero-emission choice!</Badge>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
