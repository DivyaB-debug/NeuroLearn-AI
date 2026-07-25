import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/auth-context";
import { generateStudyPlan } from "@/lib/learning.functions";
import { TECHNIQUES, type TechniqueId } from "@/lib/ai-gateway";
import { toast } from "sonner";
import { Loader2, Timer, Play, Pause, RotateCcw, Sparkles, Hand, Upload } from "lucide-react";
import { SignTeacher } from "@/components/SignTeacher";
import { VisualStoryLesson } from "@/components/VisualStoryLesson";

export const Route = createFileRoute("/learn")({ component: Learn });

type Plan = {
  explanation: string;
  keyTakeaways: string[];
  pomodoroPlan: { block: number; focusMinutes: number; breakMinutes: number; task: string }[];
  practiceQuestions: string[];
};

function Learn() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const run = useServerFn(generateStudyPlan);
  const [topic, setTopic] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!profile?.onboarded) navigate({ to: "/diagnostic" });
  }, [user, profile, loading, navigate]);

  const style = (profile?.learning_style as TechniqueId) ?? "feynman";
  const tech = TECHNIQUES.find((t) => t.id === style)!;

  const submit = async () => {
    if (topic.trim().length < 2) { toast.error("Type something to learn"); return; }
    setBusy(true);
    setPlan(null);
    try {
      const res = await run({ data: { topic: topic.trim(), style } });
      setPlan(res as Plan);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen bg-background grain">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full ember-gradient" />
          <span className="font-display text-lg font-semibold">NeuroLearnAI</span>
        </Link>
        <div className="flex items-center gap-3 text-xs">
          <span className="hidden rounded-full bg-secondary px-3 py-1 text-muted-foreground sm:inline-flex">
            Style: <span className="ml-1 font-medium text-foreground">{tech.label}</span>
          </span>
          <Link to="/sign" className="text-muted-foreground hover:text-foreground">Sign language</Link>
          <Link to="/diagnostic" className="text-muted-foreground hover:text-foreground">Retake</Link>
          <button onClick={signOut} className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:bg-secondary">Sign out</button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 pb-24">
        <section className="rounded-3xl border border-border bg-card p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs">
            <Sparkles className="h-3 w-3" /> Explained in your style
          </span>
          <h1 className="mt-3 font-display text-4xl">What do you want to learn today?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop a single concept, a syllabus, exam topics — anything. I'll teach it as <span className="text-accent font-medium">{tech.label}</span>.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={2}
              placeholder="e.g. Chapter 4: Ohm's law and Kirchhoff's rules"
              className="flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <div className="flex gap-2 sm:flex-col">
              <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-xs hover:bg-secondary">
                <Upload className="h-3 w-3" /> File
                <input
                  type="file"
                  accept=".txt,.md,.markdown,.csv,.json,.html,.rtf,text/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 1_500_000) { toast.error("File too large (max 1.5MB)"); return; }
                    try {
                      const text = await f.text();
                      setTopic(`From "${f.name}":\n\n${text.slice(0, 8000)}`);
                      toast.success(`Loaded ${f.name}`);
                    } catch { toast.error("Couldn't read file"); }
                    e.target.value = "";
                  }}
                />
              </label>
              <button onClick={submit} disabled={busy}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Teach me →"}
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Upload a .txt / .md / .csv / .json / .html file — I'll teach its contents in your <span className="text-accent">{tech.label}</span> style.
          </p>

        </section>

        {busy && (
          <div className="mt-10 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Composing your lesson…</p>
          </div>
        )}

        {plan && (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <article className="rounded-3xl border border-border bg-card p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-widest text-accent">{tech.label}</p>
                <Link
                  to="/sign"
                  search={{ text: topic.trim().slice(0, 60), tab: "spell" as const }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Hand className="h-3 w-3" /> Sign this topic
                </Link>
              </div>
              <div className="prose prose-base mt-3 max-w-none text-foreground prose-headings:font-display prose-headings:tracking-tight prose-strong:text-foreground prose-blockquote:border-l-accent prose-blockquote:text-foreground/80">
                <ReactMarkdown>{plan.explanation}</ReactMarkdown>
              </div>

              <div className="mt-8">
                <h3 className="font-display text-xl">Key takeaways</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {plan.keyTakeaways.map((k, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="font-display text-xl">Practice questions</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-foreground/90">
                  {plan.practiceQuestions.map((q, i) => <li key={i}>{q}</li>)}
                </ol>
              </div>
            </article>

            <aside className="space-y-4">
              <VisualStoryLesson topic={topic.trim()} />

              <SignTeacher
                text={`${plan.explanation}\n\nKey takeaways: ${plan.keyTakeaways.join(". ")}`}
                title="Lesson in sign language"
              />
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-accent" />
                  <h3 className="font-display text-lg">Pomodoro plan</h3>
                </div>
                <ol className="mt-4 space-y-3 text-sm">
                  {plan.pomodoroPlan.map((b) => (
                    <li key={b.block} className="rounded-2xl bg-secondary p-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Block {b.block}</span>
                        <span>{b.focusMinutes}m focus · {b.breakMinutes}m break</span>
                      </div>
                      <p className="mt-1 text-foreground">{b.task}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <PomodoroTimer />
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function PomodoroTimer() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          const next: "focus" | "break" = mode === "focus" ? "break" : "focus";
          setMode(next);
          toast.success(next === "break" ? "Focus done — take 5." : "Break over — back to it.");
          return next === "focus" ? 25 * 60 : 5 * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, mode]);

  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  const reset = () => { setRunning(false); setMode("focus"); setSeconds(25 * 60); };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-center">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{mode === "focus" ? "Focus" : "Break"}</p>
      <p className="mt-2 font-display text-6xl tabular-nums">{m}:{s}</p>
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={() => setRunning((r) => !r)} className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
          {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={reset} className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-xs hover:bg-secondary">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>
    </div>
  );
}
