import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Leaf, BarChart3, Bot, Target, Trophy, TreePine } from "lucide-react";

const features = [
  { icon: BarChart3, title: "Smart Calculator", desc: "Realistic emission factors across transport, energy, food, shopping & waste." },
  { icon: Bot, title: "AI Sustainability Coach", desc: "Personalised, quantified tips to cut your footprint — works offline too." },
  { icon: Target, title: "Goals & Progress", desc: "Set reduction targets and watch your progress bars climb." },
  { icon: Trophy, title: "Gamification", desc: "XP, levels, streaks, badges and a global leaderboard." },
  { icon: TreePine, title: "Tree Offset", desc: "See exactly how many trees offset your annual emissions." },
  { icon: BarChart3, title: "Rich Analytics", desc: "Pie, line & trend charts reveal your biggest emission sources." },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Leaf className="h-6 w-6 text-primary" /> CarbonWise
        </div>
        <nav className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main id="main" className="cw-gradient">
        <section className="mx-auto max-w-4xl px-5 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground animate-fade-up">
            🌍 Your personal climate companion
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl animate-fade-up">
            Track your carbon.
            <br />
            <span className="text-primary">Shrink your footprint.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground animate-fade-up">
            CarbonWise turns everyday activities — driving, electricity, food, shopping — into
            actionable CO₂ insights, then coaches you to a greener lifestyle.
          </p>
          <div className="mt-8 flex justify-center gap-3 animate-fade-up">
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
            >
              Start tracking free
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-border bg-card px-6 py-3 font-medium hover:bg-muted"
            >
              I have an account
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-transform hover:-translate-y-1"
            >
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Built with Next.js 15 · CarbonWise — measure, understand, reduce.
      </footer>
    </div>
  );
}
