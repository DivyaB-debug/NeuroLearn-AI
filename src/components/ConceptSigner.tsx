import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Play, Pause, SkipBack, SkipForward, Sparkles, RotateCcw, Gauge } from "lucide-react";
import { toast } from "sonner";
import { generateAslGloss, type AslGloss, type AslGlossItem } from "@/lib/learning.functions";
import { lookupSign } from "@/lib/asl-signs";
import { SigningAvatar } from "./SigningAvatar";

type Props = {
  topic: string;
  lesson?: string;
  title?: string;
};

type Step =
  | { kind: "sign"; gloss: string; english?: string; durationMs: number }
  | { kind: "letter"; letter: string; wordEnglish?: string; index: number; total: number; durationMs: number };

const SPEEDS = [
  { label: "0.75×", mult: 1.33 },
  { label: "1×", mult: 1 },
  { label: "1.25×", mult: 0.8 },
  { label: "1.5×", mult: 0.66 },
];

const LETTER_MS = 620;

function expandGloss(gloss: AslGloss, speed: number): Step[] {
  const out: Step[] = [];
  for (const item of gloss.sequence) {
    if (item.kind === "sign") {
      const sign = lookupSign(item.gloss);
      // The sign plays through one loop, plus a small hold. Duration budget:
      const dur = sign ? Math.max(sign.movement.duration, 900) : 1000;
      out.push({ kind: "sign", gloss: item.gloss, english: item.english, durationMs: Math.round(dur * speed) });
    } else {
      const letters = item.text.split("");
      letters.forEach((letter, i) => {
        out.push({
          kind: "letter",
          letter,
          wordEnglish: item.english,
          index: i,
          total: letters.length,
          durationMs: Math.round(LETTER_MS * speed),
        });
      });
    }
  }
  return out;
}

function stepEmphasis(item: AslGlossItem | null): "positive" | "negative" | "questioning" | null {
  if (!item || item.kind !== "sign") return null;
  const g = item.gloss.toUpperCase();
  if (["WHAT", "WHY", "WHERE", "WHO", "HOW", "QUESTION"].includes(g)) return "questioning";
  if (["HAPPY", "LOVE", "GOOD", "YES", "EXCITED", "THANK-YOU", "WELCOME"].includes(g)) return "positive";
  if (["SAD", "ANGRY", "BAD", "NO", "FALSE", "TIRED", "SORRY"].includes(g)) return "negative";
  return null;
}

export function ConceptSigner({ topic, lesson, title = "Learn this concept in sign language" }: Props) {
  const run = useServerFn(generateAslGloss);
  const [gloss, setGloss] = useState<AslGloss | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [cursor, setCursor] = useState(0);
  const timerRef = useRef<number | null>(null);

  const steps = useMemo(
    () => (gloss ? expandGloss(gloss, SPEEDS[speedIdx].mult) : []),
    [gloss, speedIdx]
  );

  // Advance cursor when playing
  useEffect(() => {
    if (!playing || steps.length === 0) return;
    if (cursor >= steps.length) {
      setPlaying(false);
      return;
    }
    const step = steps[cursor];
    timerRef.current = window.setTimeout(() => {
      setCursor((c) => Math.min(c + 1, steps.length));
    }, step.durationMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [playing, cursor, steps]);

  // Auto-start once loaded
  useEffect(() => {
    if (gloss && steps.length > 0 && cursor === 0) setPlaying(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gloss]);

  const load = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setGloss(null);
    setCursor(0);
    try {
      const res = await run({ data: { topic: topic.trim(), lesson: lesson?.trim() } });
      setGloss(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate the ASL translation");
    } finally {
      setLoading(false);
    }
  };

  // Reset when topic changes
  useEffect(() => {
    setGloss(null);
    setCursor(0);
    setPlaying(false);
  }, [topic]);

  const current = steps[Math.min(cursor, steps.length - 1)] ?? null;
  const currentItem = useMemo(() => {
    if (!gloss || !current) return null;
    // Map back to original gloss item for emphasis lookup
    let idx = 0;
    for (const item of gloss.sequence) {
      const len = item.kind === "sign" ? 1 : item.text.length;
      if (cursor >= idx && cursor < idx + len) return item;
      idx += len;
    }
    return null;
  }, [gloss, current, cursor]);

  const movement = current?.kind === "sign" ? lookupSign(current.gloss)?.movement ?? null : null;
  const spellLetter = current?.kind === "letter" ? current.letter : null;

  const captionText = current?.kind === "sign"
    ? `${current.gloss}${current.english ? ` • ${current.english}` : ""}`
    : current?.kind === "letter"
    ? `Fingerspell: ${current.wordEnglish ?? ""} (${current.index + 1}/${current.total})`
    : "";

  const bigLabel = current?.kind === "sign"
    ? current.gloss.replace(/-/g, " ")
    : current?.kind === "letter"
    ? current.letter
    : "";

  const description = current?.kind === "sign" ? lookupSign(current.gloss)?.description ?? "" : "";

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">ASL concept signer</p>
          <h3 className="mt-1 font-display text-lg">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            A signing avatar performs real ASL word-signs — not just letters — the way Deaf ASL users actually communicate.
          </p>
        </div>
      </div>

      {!gloss && (
        <button
          onClick={load}
          disabled={loading || !topic.trim()}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Interpreting into ASL…" : "Sign this concept"}
        </button>
      )}

      {gloss && (
        <>
          <div className="mt-4 aspect-[5/6] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-secondary/40 to-background">
            <SigningAvatar
              movement={movement}
              spellLetter={spellLetter}
              playing={playing}
              caption={captionText}
              label={bigLabel}
              emphasis={stepEmphasis(currentItem)}
            />
          </div>

          {description && (
            <p className="mt-3 rounded-2xl bg-secondary/50 px-4 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">How to sign it:</span> {description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setCursor((c) => Math.max(0, c - 1)); }}
                className="rounded-full border border-border p-2 hover:bg-secondary"
                aria-label="Previous"
              >
                <SkipBack className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPlaying((p) => !p)}
                className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {playing ? "Pause" : cursor >= steps.length ? "Replay" : "Play"}
              </button>
              <button
                onClick={() => { setCursor((c) => Math.min(steps.length, c + 1)); }}
                className="rounded-full border border-border p-2 hover:bg-secondary"
                aria-label="Next"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { setCursor(0); setPlaying(true); }}
                className="rounded-full border border-border p-2 hover:bg-secondary"
                aria-label="Restart"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Gauge className="h-3 w-3" /> {SPEEDS[speedIdx].label}
            </button>
          </div>

          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${steps.length ? (Math.min(cursor + 1, steps.length) / steps.length) * 100 : 0}%` }}
            />
          </div>

          <details className="mt-4 rounded-2xl bg-secondary/40 p-3 text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Show full ASL gloss ({gloss.sequence.length} signs) — {gloss.summary}
            </summary>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {gloss.sequence.map((item, i) => (
                <span
                  key={i}
                  className={
                    item.kind === "sign"
                      ? "rounded-full bg-accent/15 px-2 py-0.5 font-medium text-accent"
                      : "rounded-full border border-dashed border-border px-2 py-0.5 text-muted-foreground"
                  }
                  title={item.english ?? ""}
                >
                  {item.kind === "sign" ? item.gloss : `#${item.text}`}
                </span>
              ))}
            </div>
          </details>

          <button
            onClick={load}
            className="mt-3 w-full rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Re-translate this lesson
          </button>
        </>
      )}
    </div>
  );
}
