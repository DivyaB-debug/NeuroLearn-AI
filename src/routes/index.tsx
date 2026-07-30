import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, Brain, Timer, BookOpenCheck, Hand } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuroLearnAI — AI Study & ASL Learning" },
      { name: "description", content: "Learn any topic with AI study techniques, visual storytelling, Pomodoro plans, and an ASL signing avatar for concept explanations." },
      { property: "og:title", content: "NeuroLearnAI — AI Study & ASL Learning" },
      { property: "og:description", content: "AI learning platform with personalized techniques, visual lessons, study plans, and ASL concept signing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;
    if (profile?.onboarded) navigate({ to: "/learn" });
    else navigate({ to: "/diagnostic" });
  }, [user, profile, loading, navigate]);

  return (
    <main className="min-h-screen bg-background grain text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full ember-gradient" />
          <span className="font-display text-xl font-semibold">NeuroLearnAI</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/sign" search={{ tab: "avatar", text: undefined }} className="inline-flex rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:px-4">
            ASL avatar
          </Link>
          <Link to="/auth" className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
            Sign in
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-12 pb-24">
        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3" /> AI + scientific learning techniques
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] sm:text-6xl md:text-7xl">
              Learn the way <em className="text-accent not-italic">your brain</em> actually works.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              NeuroLearnAI finds your personal learning style — then explains anything from
              fractions to quantum field theory in the technique that makes it click,
              wrapped in a Pomodoro study plan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
                Know your way of learning →
              </Link>
              <Link to="/sign" search={{ tab: "avatar", text: undefined }} className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-secondary">
                <Hand className="h-4 w-4" /> Learn with ASL avatar
              </Link>
              <a href="#how" className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-secondary">
                How it works
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] ember-gradient opacity-20 blur-3xl" />
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Your style: Visual Storytelling</p>
              <h3 className="mt-2 font-display text-2xl">Photosynthesis</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                Picture a leaf as a tiny solar bakery. Sunlight pours in like flour through a window;
                water rises from the roots like buckets up a well. Inside the chloroplast kitchen,
                <em> chefs called chlorophyll</em> mix them into glucose — and exhale oxygen out the back door…
              </p>
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-secondary p-3">
                <Timer className="h-5 w-5 text-accent" />
                <div className="text-xs">
                  <div className="font-semibold">Pomodoro · 25 min</div>
                  <div className="text-muted-foreground">Read + sketch the leaf-bakery scene</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-display text-3xl md:text-4xl">Three steps. One brain. Infinite topics.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { i: Brain, t: "Discover your style", d: "Pick a topic. Read it explained six ways. A short quiz reveals which technique your brain locks onto." },
            { i: BookOpenCheck, t: "Drop in any syllabus", d: "Class notes, exam topics, a textbook chapter — NeuroLearnAI rewrites it in your style." },
            { i: Timer, t: "Study with a plan", d: "Every lesson comes with a Pomodoro schedule, key takeaways, and self-test questions." },
          ].map(({ i: Icon, t, d }, idx) => (
            <div key={t} className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"><Icon className="h-4 w-4" /></div>
                <span className="text-xs text-muted-foreground">Step {idx + 1}</span>
              </div>
              <h3 className="mt-4 font-display text-xl">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
