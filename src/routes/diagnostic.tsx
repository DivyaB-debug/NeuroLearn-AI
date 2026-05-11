import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { generateDiagnostic } from "@/lib/learning.functions";
import { TECHNIQUES, type TechniqueId } from "@/lib/ai-gateway";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/diagnostic")({ component: Diagnostic });

type DiagItem = {
  technique: TechniqueId;
  explanation: string;
  question: string;
  choices: string[];
  correctIndex: number;
};

function Diagnostic() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const runDiag = useServerFn(generateDiagnostic);

  const [topic, setTopic] = useState("");
  const [phase, setPhase] = useState<"intro" | "loading" | "study" | "quiz" | "result">("intro");
  const [items, setItems] = useState<DiagItem[]>([]);
  const [answers, setAnswers] = useState<Record<TechniqueId, number | null>>({} as never);
  const [winner, setWinner] = useState<TechniqueId | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const start = async () => {
    if (topic.trim().length < 2) { toast.error("Type a topic first"); return; }
    setPhase("loading");
    try {
      const res = await runDiag({ data: { topic: topic.trim() } });
      setItems(res.items as DiagItem[]);
      setPhase("study");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
      setPhase("intro");
    }
  };

  const submit = async () => {
    const scores: Record<string, number> = {};
    items.forEach((it) => {
      scores[it.technique] = answers[it.technique] === it.correctIndex ? 1 : 0;
    });
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top = (sorted[0]?.[0] as TechniqueId) ?? items[0].technique;
    setWinner(top);
    setPhase("result");
    if (user) {
      const { error } = await supabase.from("profiles")
        .update({ learning_style: top, onboarded: true }).eq("id", user.id);
      if (error) toast.error("Couldn't save your style");
      else await refreshProfile();
    }
  };

  return (
    <main className="min-h-screen bg-background grain">
      <Header />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        {phase === "intro" && (
          <section className="rounded-3xl border border-border bg-card p-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs">
              <Sparkles className="h-3 w-3" /> Step 1 of 1 · Diagnostic
            </span>
            <h1 className="mt-4 font-display text-4xl">Know your way of learning</h1>
            <p className="mt-3 text-muted-foreground">
              Pick any topic — a school concept, a college subject, or something you're just curious about.
              We'll explain it six different ways. Whichever your brain locks onto becomes your style.
            </p>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis · Newton's laws · Recursion · French Revolution"
              className="mt-6 w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-accent"
            />
            <button onClick={start} className="mt-4 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Start diagnostic →
            </button>
          </section>
        )}

        {phase === "loading" && (
          <div className="flex flex-col items-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Crafting six explanations of <span className="text-foreground font-medium">{topic}</span>…</p>
          </div>
        )}

        {phase === "study" && (
          <section>
            <h2 className="font-display text-3xl">Read all six.</h2>
            <p className="mt-1 text-sm text-muted-foreground">Notice which one feels easiest. Don't overthink — your brain knows.</p>
            <div className="mt-6 space-y-4">
              {items.map((it) => {
                const t = TECHNIQUES.find((x) => x.id === it.technique)!;
                return (
                  <article key={it.technique} className="rounded-3xl border border-border bg-card p-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-xl">{t.label}</h3>
                      <span className="text-xs text-muted-foreground">{t.blurb}</span>
                    </div>
                    <div className="prose prose-sm mt-3 max-w-none text-foreground/90">
                      <ReactMarkdown>{it.explanation}</ReactMarkdown>
                    </div>
                  </article>
                );
              })}
            </div>
            <button onClick={() => setPhase("quiz")} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
              I've read them — start the quiz
            </button>
          </section>
        )}

        {phase === "quiz" && (
          <section>
            <h2 className="font-display text-3xl">One quick question per style.</h2>
            <div className="mt-6 space-y-4">
              {items.map((it) => {
                const t = TECHNIQUES.find((x) => x.id === it.technique)!;
                return (
                  <div key={it.technique} className="rounded-3xl border border-border bg-card p-6">
                    <p className="text-xs uppercase tracking-widest text-accent">{t.label}</p>
                    <p className="mt-2 font-medium">{it.question}</p>
                    <div className="mt-3 grid gap-2">
                      {it.choices.map((c, idx) => {
                        const sel = answers[it.technique] === idx;
                        return (
                          <button key={idx}
                            onClick={() => setAnswers((a) => ({ ...a, [it.technique]: idx }))}
                            className={`rounded-xl border px-4 py-2.5 text-left text-sm transition ${sel ? "border-accent bg-accent/10" : "border-border bg-background hover:border-foreground/40"}`}>
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={submit}
              disabled={items.some((it) => answers[it.technique] == null)}
              className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              See my learning style →
            </button>
          </section>
        )}

        {phase === "result" && winner && (
          <section className="rounded-3xl border border-border bg-card p-10 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Your learning style</p>
            <h2 className="mt-2 font-display text-5xl text-accent">
              {TECHNIQUES.find((t) => t.id === winner)!.label}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              {TECHNIQUES.find((t) => t.id === winner)!.blurb} From now on, every topic you ask about
              will be explained this way.
            </p>
            <Link to="/learn" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
              Start learning →
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

function Header() {
  const { signOut, profile } = useAuth();
  return (
    <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
      <Link to="/" className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full ember-gradient" />
        <span className="font-display text-lg font-semibold">Lumen</span>
      </Link>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {profile?.display_name && <span>Hi, {profile.display_name}</span>}
        <button onClick={signOut} className="rounded-full border border-border px-3 py-1 hover:bg-secondary">Sign out</button>
      </div>
    </header>
  );
}
