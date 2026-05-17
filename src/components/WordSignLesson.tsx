import { useEffect, useMemo, useRef, useState } from "react";
import { SignHand } from "@/components/SignHand";
import type { SignWord } from "@/lib/sign-language";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Gauge } from "lucide-react";

type Step =
  | { kind: "intro"; title: string; body: string; hold: number }
  | { kind: "shape"; letter: string; title: string; body: string; hold: number }
  | { kind: "motion"; title: string; body: string; hold: number }
  | { kind: "done"; title: string; body: string; hold: number };

// Build a teachable sequence from a SignWord.
function buildSteps(sign: SignWord, baseHold: number): Step[] {
  const shapes = sign.handshapes ?? [];
  const steps: Step[] = [
    {
      kind: "intro",
      title: `Get ready — ${sign.word}`,
      body: `Sit or stand relaxed. Bring your dominant hand to about chest height, facing the person you're signing to.`,
      hold: Math.round(baseHold * 0.9),
    },
  ];

  if (shapes.length === 0) {
    steps.push({
      kind: "motion",
      title: "Form the sign",
      body: sign.description,
      hold: Math.round(baseHold * 2),
    });
  } else {
    shapes.forEach((letter, i) => {
      steps.push({
        kind: "shape",
        letter,
        title:
          shapes.length === 1
            ? `Form the "${letter}" handshape`
            : `Step ${i + 1} of ${shapes.length} — handshape "${letter}"`,
        body: `Shape your hand into "${letter}". Hold it steady and check that the fingers, thumb, and palm orientation match the illustration.`,
        hold: baseHold,
      });
    });
    steps.push({
      kind: "motion",
      title: "Now add the movement",
      body: sign.description,
      hold: Math.round(baseHold * 1.6),
    });
  }

  steps.push({
    kind: "done",
    title: "Repeat to lock it in",
    body: `Sign "${sign.word}" three more times slowly, then once at normal speed. Mouth the word silently as you sign — it helps the reader follow along.`,
    hold: Math.round(baseHold * 1.2),
  });

  return steps;
}

const SPEED_PRESETS: { label: string; multiplier: number }[] = [
  { label: "Very slow", multiplier: 2 },
  { label: "Slow", multiplier: 1.4 },
  { label: "Normal", multiplier: 1 },
  { label: "Brisk", multiplier: 0.7 },
];

type Props = { sign: SignWord };

export function WordSignLesson({ sign }: Props) {
  const [speed, setSpeed] = useState(1.4); // start slow
  const [baseHold, setBaseHold] = useState(1600); // ms per shape at 1x
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = useMemo(() => buildSteps(sign, baseHold), [sign, baseHold]);
  const step = steps[idx];
  const stepHold = Math.round(step.hold * speed);

  // Reset whenever sign changes
  useEffect(() => {
    setIdx(0);
    setPlaying(false);
    setRemaining(0);
  }, [sign.word]);

  // Reset countdown whenever we land on a new step
  useEffect(() => {
    setRemaining(stepHold);
  }, [idx, stepHold]);

  // Countdown timer drives playback
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (!playing) return;
    timer.current = setInterval(() => {
      setRemaining((r) => {
        const next = r - 100;
        if (next <= 0) {
          if (idx >= steps.length - 1) {
            setPlaying(false);
            return 0;
          }
          setIdx((i) => i + 1);
          return 0; // will be re-seeded by the effect above
        }
        return next;
      });
    }, 100);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, idx, steps.length]);

  const pct = Math.max(0, Math.min(100, ((stepHold - remaining) / Math.max(stepHold, 1)) * 100));
  const overallPct = Math.round(((idx + pct / 100) / steps.length) * 100);

  const reset = () => {
    setPlaying(false);
    setIdx(0);
  };
  const prev = () => {
    setPlaying(false);
    setIdx((i) => Math.max(0, i - 1));
  };
  const next = () => {
    setPlaying(false);
    setIdx((i) => Math.min(steps.length - 1, i + 1));
  };

  const visual =
    step.kind === "shape" ? (
      <SignHand letter={step.letter} size="lg" />
    ) : step.kind === "motion" ? (
      <div className="relative flex h-[260px] w-[260px] items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-background via-secondary/60 to-card">
        <span className="sign-pulse absolute h-32 w-32 rounded-full bg-accent/15 blur-md" />
        <span className="relative z-10 text-center font-display text-2xl text-foreground">
          Move ➜
        </span>
      </div>
    ) : (
      <div className="flex h-[260px] w-[260px] items-center justify-center rounded-3xl border border-dashed border-border bg-card text-muted-foreground">
        <span className="font-display text-4xl">{sign.word}</span>
      </div>
    );

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-accent">Step-by-step lesson</p>
          <h4 className="font-display text-2xl">Learn to sign “{sign.word}”</h4>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SPEED_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setSpeed(p.multiplier)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                speed === p.multiplier
                  ? "bg-accent text-accent-foreground"
                  : "border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overall progress */}
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-accent transition-all" style={{ width: `${overallPct}%` }} />
      </div>

      <div className="mt-6 grid items-start gap-6 md:grid-cols-[auto_1fr]">
        <div key={`${sign.word}-${idx}`} className="flex justify-center animate-fade-in">
          {visual}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Step {idx + 1} / {steps.length}
          </p>
          <h5 className="mt-1 font-display text-xl">{step.title}</h5>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{step.body}</p>

          {/* Per-step hold bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Hold this step</span>
              <span className="tabular-nums">{(remaining / 1000).toFixed(1)}s / {(stepHold / 1000).toFixed(1)}s</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-[width] duration-100 ease-linear"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              onClick={prev}
              disabled={idx === 0}
              className="rounded-full border border-border bg-background p-2 hover:bg-secondary disabled:opacity-40"
              aria-label="Previous step"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {playing ? (
              <button
                onClick={() => setPlaying(false)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <Pause className="h-4 w-4" /> Pause
              </button>
            ) : (
              <button
                onClick={() => {
                  if (idx >= steps.length - 1) setIdx(0);
                  setPlaying(true);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <Play className="h-4 w-4" /> Play lesson
              </button>
            )}
            <button
              onClick={next}
              disabled={idx === steps.length - 1}
              className="rounded-full border border-border bg-background p-2 hover:bg-secondary disabled:opacity-40"
              aria-label="Next step"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs hover:bg-secondary"
            >
              <RotateCcw className="h-3 w-3" /> Restart
            </button>

            <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              Hold time
              <input
                type="range"
                min={800}
                max={3500}
                step={100}
                value={baseHold}
                onChange={(e) => setBaseHold(Number(e.target.value))}
                className="accent-accent"
              />
              <span className="tabular-nums">{(baseHold / 1000).toFixed(1)}s</span>
            </label>
          </div>

          {/* Step rail */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setPlaying(false);
                  setIdx(i);
                }}
                className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest transition ${
                  i === idx
                    ? "bg-accent text-accent-foreground"
                    : i < idx
                      ? "bg-secondary text-foreground"
                      : "border border-border bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                {i + 1}. {s.kind === "shape" ? s.letter : s.kind}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
