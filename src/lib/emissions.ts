/**
 * Emission factors in kg CO2e per unit.
 * Sources: UK DEFRA 2023 conversion factors, IPCC AR6, and EPA averages.
 * These are realistic mid-range global/India-leaning estimates; exact values
 * vary by region and methodology.
 */

export type Category = "transport" | "electricity" | "food" | "shopping" | "waste";

export interface EmissionOption {
  subtype: string;
  label: string;
  /** kg CO2e per unit */
  factor: number;
  unit: string;
  icon: string;
}

export const EMISSION_FACTORS: Record<Category, EmissionOption[]> = {
  transport: [
    { subtype: "car", label: "Car (petrol)", factor: 0.192, unit: "km", icon: "🚗" },
    { subtype: "car_diesel", label: "Car (diesel)", factor: 0.171, unit: "km", icon: "🚙" },
    { subtype: "bike", label: "Motorbike", factor: 0.103, unit: "km", icon: "🏍️" },
    { subtype: "bus", label: "Bus", factor: 0.105, unit: "km", icon: "🚌" },
    { subtype: "metro", label: "Metro / Train", factor: 0.041, unit: "km", icon: "🚇" },
    { subtype: "flight", label: "Flight (short-haul)", factor: 0.255, unit: "km", icon: "✈️" },
    { subtype: "ev", label: "Electric Car", factor: 0.053, unit: "km", icon: "🔌" },
    { subtype: "walking", label: "Walking", factor: 0, unit: "km", icon: "🚶" },
    { subtype: "cycling", label: "Cycling", factor: 0, unit: "km", icon: "🚲" },
  ],
  electricity: [
    { subtype: "electricity", label: "Grid Electricity", factor: 0.475, unit: "kWh", icon: "⚡" },
    { subtype: "solar", label: "Solar / Renewable", factor: 0.041, unit: "kWh", icon: "☀️" },
  ],
  food: [
    // per meal estimates
    { subtype: "vegan", label: "Vegan meal", factor: 0.7, unit: "meal", icon: "🥗" },
    { subtype: "vegetarian", label: "Vegetarian meal", factor: 1.2, unit: "meal", icon: "🥦" },
    { subtype: "mixed", label: "Mixed meal", factor: 2.5, unit: "meal", icon: "🍲" },
    { subtype: "non_veg", label: "Non-veg (red meat)", factor: 5.0, unit: "meal", icon: "🍖" },
    { subtype: "chicken", label: "Non-veg (poultry)", factor: 1.8, unit: "meal", icon: "🍗" },
  ],
  shopping: [
    { subtype: "clothes", label: "Clothing item", factor: 15, unit: "item", icon: "👕" },
    { subtype: "electronics", label: "Electronics", factor: 120, unit: "item", icon: "📱" },
    { subtype: "furniture", label: "Furniture", factor: 90, unit: "item", icon: "🪑" },
  ],
  waste: [
    { subtype: "plastic", label: "Plastic waste", factor: 6.0, unit: "kg", icon: "🛍️" },
    { subtype: "paper", label: "Paper waste", factor: 1.3, unit: "kg", icon: "📄" },
    { subtype: "organic", label: "Organic waste", factor: 0.5, unit: "kg", icon: "🍂" },
  ],
};

export const CATEGORY_META: Record<Category, { label: string; icon: string; color: string }> = {
  transport: { label: "Transport", icon: "🚗", color: "#0ea5e9" },
  electricity: { label: "Electricity", icon: "⚡", color: "#f59e0b" },
  food: { label: "Food", icon: "🍽️", color: "#ef4444" },
  shopping: { label: "Shopping", icon: "🛍️", color: "#8b5cf6" },
  waste: { label: "Waste", icon: "♻️", color: "#10b981" },
};

export function findFactor(category: Category, subtype: string): EmissionOption | undefined {
  return EMISSION_FACTORS[category]?.find((o) => o.subtype === subtype);
}

/** Calculate kg CO2e for an activity. Returns rounded to 2 decimals. */
export function calculateCO2(category: Category, subtype: string, amount: number): number {
  const opt = findFactor(category, subtype);
  if (!opt || amount <= 0) return 0;
  return Math.round(opt.factor * amount * 100) / 100;
}

/** Trees needed to offset a given kg of CO2 over a year.
 * A mature tree absorbs ~21 kg CO2 / year. */
export const KG_CO2_PER_TREE_YEAR = 21;
export function treesToOffset(kg: number): number {
  return Math.ceil(kg / KG_CO2_PER_TREE_YEAR);
}

export const CATEGORIES = Object.keys(EMISSION_FACTORS) as Category[];
