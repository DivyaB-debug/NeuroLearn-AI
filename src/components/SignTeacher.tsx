import { useEffect, useMemo, useRef, useState } from "react";
import { ASL_ALPHABET } from "@/lib/sign-language";
import { SignHand } from "@/components/SignHand";
import { Hand, Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

// Strip markdown to plain text so we can fingerspell the actual lesson content.
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

type Props = {
  /** Markdown or plain text — we strip and fingerspell the words. */
  text: string;
  /** Optional title shown above the player. */
  title?: string;
};

/**
 * Sign-language teaching panel for deaf / hard-of-hearing learners.
 * Fingerspells any lesson text word-by-word, letter-by-letter using ASL handshapes.
 */
export function SignTeacher({ text, title = "Sign-language version" }: Props) {
  const plain = useMemo(() => stripMarkdown(text), [text]);
  const words = useMemo(
    () => plain.split(/\s+/).filter(Boolean).slice(0, 600), // safety cap
    [plain]
  );

  const [wordIdx, setWordIdx] = useState(0);
  const [letterIdx, setLetterIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(550);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when text changes
  useEffect(() => {
    setWordIdx(0); setLetterIdx(0); setPlaying(false);
  }, [plain]);

  const word = words[wordIdx] ?? "";
  const upperWord = word.toUpperCase();
  const ch = upperWord[letterIdx] ?? "";
  const meta = ASL_ALPHABET.find((a) => a.letter === ch);

  // playback engine
  useEffect(() => {
    if (!playing || words.length === 0) return;
    timer.current = setTimeout(() => {
      // advance one letter; pause longer between words
      if (letterIdx < upperWord.length - 1) {
        setLetterIdx((i) => i + 1);
      } else if (wordIdx < words.length - 1) {
        setWordIdx((i) => i + 1);
        setLetterIdx(0);
      } else {
        setPlaying(false);
      }
    }, letterIdx >= upperWord.length - 1 ? speedMs * 1.6 : speedMs);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [playing, letterIdx, wordIdx, upperWord, words.length, speedMs]);

  if (words.length === 0) return null;

  const totalLetters = words.reduce((sum, w) => sum + w.length, 0);
  const doneLetters =
    words.slice(0, wordIdx).reduce((sum, w) => sum + w.length, 0) + letterIdx + 1;
  const pct = Math.round((doneLetters / Math.max(totalLetters, 1)) * 100);

  const reset = () => { setPlaying(false); setWordIdx(0); setLetterIdx(0); };
  const stepBack = () => {
    setPlaying(false);
    if (letterIdx > 0) setLetterIdx(letterIdx - 1);
    else if (wordIdx > 0) {
      const prev = words[wordIdx - 1];
      setWordIdx(wordIdx - 1);
      setLetterIdx(prev.length - 1);
    }
  };
  const stepFwd = () => {
    setPlaying(false);
    if (letterIdx < upperWord.length - 1) setLetterIdx(letterIdx + 1);
    else if (wordIdx < words.length - 1) { setWordIdx(wordIdx + 1); setLetterIdx(0); }
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Hand className="h-4 w-4 text-accent" />
          <h3 className="font-display text-lg">{title}</h3>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] text-muted-foreground">
          For Deaf / hard-of-hearing learners · ASL fingerspelling
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Plays the entire lesson letter-by-letter so you can read it through sign.
      </p>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-5 grid items-center gap-6 md:grid-cols-[auto_1fr]">
        <div key={`${wordIdx}-${letterIdx}`} className="animate-fade-in">
          {meta ? (
            <SignHand letter={ch} motion={meta.motion} size="lg" />
          ) : (
            <div className="flex h-[220px] w-[220px] items-center justify-center rounded-3xl border border-dashed border-border text-muted-foreground">
              {ch || "·"}
            </div>
          )}
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Word {wordIdx + 1} / {words.length} · letter {letterIdx + 1} / {upperWord.length}
          </p>
          <h4 className="mt-1 font-display text-3xl">
            {upperWord.split("").map((c, i) => (
              <span key={i} className={i === letterIdx ? "text-accent" : i < letterIdx ? "text-foreground" : "text-muted-foreground"}>
                {c}
              </span>
            ))}
          </h4>
          {meta && <p className="mt-2 text-sm text-foreground/90">{meta.shape}</p>}

          <div className="mt-4 max-h-24 overflow-y-auto rounded-xl bg-secondary/40 p-3 text-sm leading-relaxed">
            {words.map((w, i) => (
              <button
                key={i}
                onClick={() => { setPlaying(false); setWordIdx(i); setLetterIdx(0); }}
                className={`mr-1.5 mb-1 rounded px-1.5 py-0.5 text-left transition ${
                  i === wordIdx ? "bg-accent text-accent-foreground" : i < wordIdx ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button onClick={stepBack} className="rounded-full border border-border bg-background p-2 hover:bg-secondary" aria-label="Previous letter">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {playing ? (
              <button onClick={() => setPlaying(false)} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Pause className="h-4 w-4" /> Pause
              </button>
            ) : (
              <button onClick={() => setPlaying(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Play className="h-4 w-4" /> Play lesson
              </button>
            )}
            <button onClick={stepFwd} className="rounded-full border border-border bg-background p-2 hover:bg-secondary" aria-label="Next letter">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={reset} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs hover:bg-secondary">
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
            <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              Speed
              <input type="range" min={250} max={1200} step={50} value={speedMs}
                onChange={(e) => setSpeedMs(Number(e.target.value))} className="accent-accent" />
              <span className="tabular-nums">{(speedMs / 1000).toFixed(2)}s</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
