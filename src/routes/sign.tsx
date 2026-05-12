import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ASL_ALPHABET, SIGN_TIPS } from "@/lib/sign-language";
import { SignHand } from "@/components/SignHand";
import { useAuth } from "@/lib/auth-context";
import { Hand, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/sign")({
  component: SignPage,
  validateSearch: (s: Record<string, unknown>) => ({
    text: typeof s.text === "string" ? s.text : "",
    tab: s.tab === "spell" || s.tab === "learn" ? s.tab : undefined,
  }),
});

function SignPage() {
  const { user, loading, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [tab, setTab] = useState<"learn" | "spell">(search.tab ?? (search.text ? "spell" : "learn"));

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  return (
    <main className="min-h-screen bg-background grain">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full ember-gradient" />
          <span className="font-display text-lg font-semibold">Lumen</span>
        </Link>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Link to="/learn" className="rounded-full border border-border px-3 py-1 hover:bg-secondary">Study hub</Link>
          {profile?.display_name && <span>Hi, {profile.display_name}</span>}
          <button onClick={signOut} className="rounded-full border border-border px-3 py-1 hover:bg-secondary">Sign out</button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs">
          <Hand className="h-3 w-3" /> Sign Language Module · ASL fingerspelling
        </span>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">Learn sign language — then learn anything in it.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Start with the ASL alphabet. Once you're comfortable, drop in any word or concept and Lumen will
          fingerspell it back to you, letter by letter, at the pace you choose.
        </p>

        <div className="mt-8 inline-flex rounded-full border border-border bg-card p-1 text-sm">
          <button
            onClick={() => setTab("learn")}
            className={`rounded-full px-4 py-1.5 transition ${tab === "learn" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Learn the alphabet
          </button>
          <button
            onClick={() => setTab("spell")}
            className={`rounded-full px-4 py-1.5 transition ${tab === "spell" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Sign a concept
          </button>
        </div>

        <div className="mt-8">
          {tab === "learn" ? <LearnAlphabet /> : <FingerspellPlayer initialText={search.text} />}
        </div>
      </section>
    </main>
  );
}

function LearnAlphabet() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {ASL_ALPHABET.map((l) => (
          <article key={l.letter} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex justify-center">
              <SignHand letter={l.letter} motion={l.motion} size="sm" />
            </div>
            <h3 className="mt-3 font-display text-xl">{l.letter}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{l.shape}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-widest text-accent">Tips for fingerspelling</p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {SIGN_TIPS.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FingerspellPlayer({ initialText = "" }: { initialText?: string }) {
  const [text, setText] = useState(initialText);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [speedMs, setSpeedMs] = useState(700);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const letters = useMemo(() => {
    return text.toUpperCase().split("").map((ch) => {
      if (ch === " ") return { letter: " ", shape: "(space)" } as const;
      const found = ASL_ALPHABET.find((l) => l.letter === ch);
      return found ?? { letter: ch, shape: ch.match(/[0-9]/) ? "Number — sign the digit." : "Non-letter character — skipped." };
    });
  }, [text]);

  useEffect(() => {
    if (!playing) return;
    if (index >= letters.length - 1) { setPlaying(false); return; }
    timer.current = setTimeout(() => setIndex((i) => i + 1), speedMs);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [playing, index, letters.length, speedMs]);

  const start = () => {
    if (letters.length === 0) return;
    if (index >= letters.length - 1) setIndex(0);
    setPlaying(true);
  };
  const reset = () => { setPlaying(false); setIndex(0); };

  const current = letters[index];

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">
        <Sparkles className="mr-1 inline h-3 w-3" /> Type a word or short concept
      </label>
      <input
        value={text}
        onChange={(e) => { setText(e.target.value); reset(); }}
        placeholder="e.g. PHOTOSYNTHESIS · NEWTON · HELLO WORLD"
        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-accent"
        maxLength={60}
      />

      {letters.length > 0 && current && (
        <div className="mt-8 grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <div key={index} className="animate-fade-in">
            {current.letter === " " ? (
              <div className="flex h-[260px] w-[260px] items-center justify-center rounded-3xl border border-dashed border-border text-muted-foreground">
                · space ·
              </div>
            ) : (
              <SignHand
                letter={current.letter}
                motion={"motion" in current ? (current as { motion?: string }).motion : undefined}
                size="lg"
              />
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Letter {index + 1} of {letters.length}</p>
            <h3 className="mt-1 font-display text-3xl">{current.letter === " " ? "(space)" : current.letter}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">{current.shape}</p>

            {/* progress dots */}
            <div className="mt-5 flex flex-wrap gap-1.5">
              {letters.map((l, i) => (
                <button
                  key={i}
                  onClick={() => { setPlaying(false); setIndex(i); }}
                  className={`h-7 w-7 rounded-md text-[11px] font-semibold transition ${
                    i === index ? "bg-accent text-accent-foreground"
                    : i < index ? "bg-secondary text-foreground" : "bg-background text-muted-foreground border border-border"
                  }`}
                  aria-label={`Jump to letter ${l.letter}`}
                >
                  {l.letter === " " ? "·" : l.letter}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => { setPlaying(false); setIndex((i) => Math.max(0, i - 1)); }}
                className="rounded-full border border-border bg-background p-2 hover:bg-secondary"
                aria-label="Previous letter"
              ><ChevronLeft className="h-4 w-4" /></button>
              {playing ? (
                <button onClick={() => setPlaying(false)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
                  <Pause className="h-4 w-4" /> Pause
                </button>
              ) : (
                <button onClick={start} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
                  <Play className="h-4 w-4" /> Play
                </button>
              )}
              <button
                onClick={() => { setPlaying(false); setIndex((i) => Math.min(letters.length - 1, i + 1)); }}
                className="rounded-full border border-border bg-background p-2 hover:bg-secondary"
                aria-label="Next letter"
              ><ChevronRight className="h-4 w-4" /></button>
              <button onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs hover:bg-secondary">
                <RotateCcw className="h-3 w-3" /> Reset
              </button>

              <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                Speed
                <input
                  type="range" min={300} max={1500} step={100}
                  value={speedMs}
                  onChange={(e) => setSpeedMs(Number(e.target.value))}
                  className="accent-accent"
                />
                <span className="tabular-nums">{(speedMs / 1000).toFixed(1)}s</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {letters.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          Type any word above and press play. Lumen will fingerspell each letter at your chosen pace.
        </p>
      )}

      <p className="mt-8 border-t border-border pt-4 text-[11px] text-muted-foreground">
        Note: this module teaches ASL fingerspelling. Full lexical signs (whole-word gestures) require a 3D
        avatar or signed-video library and are on the roadmap.
      </p>
    </div>
  );
}
