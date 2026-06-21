"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";

export function DemoButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      await api.post("/auth/demo");
      router.push("/dashboard");
      router.refresh();
    } catch {
      router.push("/login");
    }
  }

  return (
    <button
      onClick={go}
      disabled={loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium hover:bg-muted disabled:opacity-60",
        className,
      )}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      🌱 View live demo
    </button>
  );
}
