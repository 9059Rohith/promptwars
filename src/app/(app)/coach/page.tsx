"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, Input, Badge } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { api } from "@/lib/client";
import type { CoachResponse } from "@/lib/types";
import { getSpeechRecognition, type SpeechRecognitionLike } from "@/lib/speech";
import { Bot, Sparkles, Mic, MicOff } from "lucide-react";

const PRESETS = [
  "How can I reduce my emissions?",
  "What's my biggest source of carbon?",
  "Give me 3 quick wins this week.",
  "Explain my carbon report.",
];

export default function CoachPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoachResponse | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;
    setVoiceSupported(true);
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => {
      setQuestion(e.results[0][0].transcript);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  function toggleVoice() {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      setListening(true);
      rec.start();
    }
  }

  async function ask(q?: string) {
    const query = q ?? question;
    setLoading(true);
    try {
      const res = await api.post<CoachResponse>("/coach", { question: query || undefined });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="AI Sustainability Coach" subtitle="Personalised, data-driven advice to lower your footprint" />

      <Card className="p-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setQuestion(p); ask(p); }}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
            >
              {p}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); ask(); }}
          className="mt-4 flex gap-2"
        >
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask the coach anything about your footprint…" />
          {voiceSupported && (
            <Button
              type="button"
              variant={listening ? "danger" : "outline"}
              onClick={toggleVoice}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              aria-pressed={listening}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          <Button type="submit" loading={loading}>
            <Sparkles className="h-4 w-4" /> Ask
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="mt-4 p-5 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">CarbonWise Coach</p>
              <Badge>{result.source === "llm" ? "AI-powered" : "Smart rules engine"}</Badge>
            </div>
          </div>

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{result.intro}</p>

          {result.tips.length > 0 && (
            <div className="mt-4 space-y-3">
              {result.tips.map((t, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">💡 {t.title}</p>
                    {t.savingKg > 0 && <Badge className="text-primary">~{t.savingKg} kg/mo</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.detail}</p>
                </div>
              ))}
              <p className="text-sm font-medium text-primary">
                Estimated potential saving: ~{result.estimatedMonthlySaving} kg CO₂e / month 🌱
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
