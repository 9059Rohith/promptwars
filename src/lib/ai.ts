import { CATEGORY_META, type Category } from "./emissions";
import { treesToOffset } from "./emissions";

export interface CategoryBreakdown {
  category: Category;
  kg: number;
}

export interface CoachInput {
  question?: string;
  breakdown: CategoryBreakdown[];
  totalKg: number;
  avgPerDay: number;
}

export interface CoachResult {
  source: "llm" | "rules";
  intro: string;
  tips: { title: string; detail: string; savingKg: number }[];
  estimatedMonthlySaving: number;
}

/**
 * Deterministic, fully-offline recommendation engine. Analyses the user's
 * category breakdown and produces concrete, quantified tips. Used as the
 * default and as a fallback when no LLM key is configured.
 */
export function ruleBasedCoach(input: CoachInput): CoachResult {
  const sorted = [...input.breakdown].sort((a, b) => b.kg - a.kg);
  const tips: CoachResult["tips"] = [];

  for (const { category, kg } of sorted) {
    if (kg <= 0) continue;
    switch (category) {
      case "transport":
        tips.push({
          title: "Shift to low-carbon transport",
          detail:
            "Replace short car trips with metro, bus, cycling or walking. Switching ~40% of car km to public transit roughly quarters those emissions.",
          savingKg: Math.round(kg * 0.3),
        });
        break;
      case "electricity":
        tips.push({
          title: "Cut electricity emissions",
          detail:
            "Switch to LED lighting, set AC to 24°C, unplug idle devices, and explore a renewable/solar tariff to slash the grid factor.",
          savingKg: Math.round(kg * 0.25),
        });
        break;
      case "food":
        tips.push({
          title: "Eat lower on the food chain",
          detail:
            "Replacing 2–3 red-meat meals per week with vegetarian or poultry options is one of the highest-impact personal changes.",
          savingKg: Math.round(kg * 0.35),
        });
        break;
      case "shopping":
        tips.push({
          title: "Buy less, buy durable",
          detail:
            "Repair and buy second-hand where possible, and extend the life of electronics — manufacturing dominates their footprint.",
          savingKg: Math.round(kg * 0.2),
        });
        break;
      case "waste":
        tips.push({
          title: "Reduce & segregate waste",
          detail:
            "Cut single-use plastic, compost organic waste, and recycle paper/metal to avoid landfill methane.",
          savingKg: Math.round(kg * 0.4),
        });
        break;
    }
  }

  const top = sorted[0];
  const intro =
    input.totalKg <= 0
      ? "You have no logged emissions yet — start logging activities to get personalised guidance."
      : `Your largest source is ${top ? CATEGORY_META[top.category].label : "—"} ` +
        `(${top ? top.kg.toFixed(1) : 0} kg CO₂e). At your current rate you'd need about ` +
        `${treesToOffset(input.avgPerDay * 365)} trees a year to offset. Here's where to focus:`;

  const estimatedMonthlySaving = tips.reduce((s, t) => s + t.savingKg, 0);
  return { source: "rules", intro, tips: tips.slice(0, 5), estimatedMonthlySaving };
}

/** Optional LLM coach. Falls back to rules on any error or missing key. */
export async function llmCoach(input: CoachInput): Promise<CoachResult> {
  const groq = process.env.GROQ_API_KEY;
  const openai = process.env.OPENAI_API_KEY;
  const gemini = process.env.GEMINI_API_KEY;
  if (!groq && !openai && !gemini) return ruleBasedCoach(input);

  const rules = ruleBasedCoach(input);
  const prompt = buildPrompt(input);

  try {
    // Groq is OpenAI-compatible; preferred when available (fast + free tier).
    if (groq) {
      const text = await callOpenAICompatible(
        "https://api.groq.com/openai/v1/chat/completions",
        groq,
        "llama-3.3-70b-versatile",
        prompt,
      );
      return { ...rules, source: "llm", intro: text };
    }
    if (openai) {
      const text = await callOpenAICompatible(
        "https://api.openai.com/v1/chat/completions",
        openai,
        "gpt-4.1-mini",
        prompt,
      );
      return { ...rules, source: "llm", intro: text };
    }
    if (gemini) {
      const text = await callGemini(gemini, prompt);
      return { ...rules, source: "llm", intro: text };
    }
  } catch {
    return ruleBasedCoach(input);
  }
  return rules;
}

function buildPrompt(input: CoachInput): string {
  const lines = input.breakdown
    .map((b) => `- ${b.category}: ${b.kg.toFixed(1)} kg CO2e`)
    .join("\n");
  return [
    "You are a friendly, concise sustainability coach.",
    `User question: ${input.question || "How can I reduce my carbon footprint?"}`,
    `Total footprint: ${input.totalKg.toFixed(1)} kg CO2e (avg ${input.avgPerDay.toFixed(1)} kg/day).`,
    "Category breakdown:",
    lines,
    "Give 3-5 specific, quantified, encouraging recommendations in plain language.",
  ].join("\n");
}

/** Works with any OpenAI-compatible chat-completions endpoint (OpenAI, Groq, …). */
async function callOpenAICompatible(
  url: string,
  key: string,
  model: string,
  prompt: string,
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a concise, encouraging sustainability coach." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callGemini(key: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}
