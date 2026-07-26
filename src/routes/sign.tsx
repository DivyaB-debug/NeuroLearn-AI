import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ASL_ALPHABET, SIGN_TIPS, COMMON_SIGNS, type SignWord } from "@/lib/sign-language";
import { SignHand } from "@/components/SignHand";
import { WordSignLesson } from "@/components/WordSignLesson";
import { ConceptSigner } from "@/components/ConceptSigner";
import { useAuth } from "@/lib/auth-context";
import {
  loadSignProgress,
  toggleLetterMastered,
  saveTopicProgress,
  type LetterRow,
  type TopicRow,
} from "@/lib/sign-progress";
import { toast } from "sonner";
import {
  Hand, Play, Pause, RotateCcw, ChevronLeft, ChevronRight,
  Sparkles, Check, Trophy, BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/sign")({
  head: () => ({
    meta: [
      { title: "ASL Sign Language Learning — NeuroLearnAI" },
      { name: "description", content: "Practice ASL alphabet, common word signs, and an animated avatar that explains concepts using ASL word-signs instead of spelling every letter." },
      { property: "og:title", content: "ASL Sign Language Learning — NeuroLearnAI" },
      { property: "og:description", content: "Learn with ASL hand animations, common signs, progress tracking, and concept explanations from an animated signing avatar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignPage,
  validateSearch: (s: Record<string, unknown>) => ({
    text: typeof s.text === "string" ? s.text : "",
    tab: s.tab === "spell" || s.tab === "learn" || s.tab === "words" || s.tab === "avatar" || s.tab === "stats" ? s.tab : undefined,
  }),
});


function SignPage() {
  const { user, signOut, profile } = useAuth();
  const search = Route.useSearch();
  const [tab, setTab] = useState<"avatar" | "learn" | "words" | "spell" | "stats">(
    search.tab ?? (search.text ? "spell" : "avatar")
  );

  const [letters, setLetters] = useState<Record<string, LetterRow>>({});
  const [topics, setTopics] = useState<TopicRow[]>([]);

  useEffect(() => {
    if (search.tab) setTab(search.tab);
  }, [search.tab]);

  const reload = useCallback(() => {
    if (!user) return;
    const { letters: l, topics: t } = loadSignProgress(user.id);
    setLetters(l);
    setTopics(t);
  }, [user]);

  useEffect(() => { void reload(); }, [reload]);

  const masteredCount = Object.values(letters).filter((l) => l.mastered).length;

  return (
    <main className="min-h-screen bg-background grain">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full ember-gradient" />
          <span className="font-display text-lg font-semibold">NeuroLearnAI</span>
        </Link>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {user ? <Link to="/learn" className="rounded-full border border-border px-3 py-1 hover:bg-secondary">Study hub</Link> : <Link to="/auth" className="rounded-full border border-border px-3 py-1 hover:bg-secondary">Enter name</Link>}
          {profile?.display_name && <span className="hidden sm:inline">Hi, {profile.display_name}</span>}
          {user && <button onClick={signOut} className="rounded-full border border-border px-3 py-1 hover:bg-secondary">Sign out</button>}
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs">
          <Hand className="h-3 w-3" /> Sign Language Module · ASL word-sign avatar
        </span>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">Learn sign language — then learn anything in it.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Ask for a concept and the animated avatar will explain it with ASL word-signs and actions first,
          using fingerspelling only for names, formulas, and technical words.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full bg-secondary px-3 py-1">
            <Trophy className="mr-1 inline h-3 w-3 text-accent" />
            {masteredCount}/26 letters mastered
          </span>
          <span className="rounded-full bg-secondary px-3 py-1">
            {topics.filter((t) => t.completed).length} topics completed
          </span>
        </div>

        <div className="mt-6 inline-flex flex-wrap rounded-full border border-border bg-card p-1 text-sm">
          {([
            ["avatar","Concept avatar"],
            ["learn","Learn the alphabet"],
            ["words","Common signs"],
            ["spell","Sign a concept"],
            ["stats","My progress"],
          ] as const).map(([k,label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`rounded-full px-4 py-1.5 transition ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "avatar" && <ConceptSignLab initialTopic={search.text} />}
          {tab === "learn" && <LearnAlphabet letters={letters} userId={user?.id} onChange={reload} />}
          {tab === "words" && <CommonSignsPanel />}
          {tab === "spell" && <FingerspellPlayer initialText={search.text} userId={user?.id} onSaved={reload} />}
          {tab === "stats" && <StatsPanel letters={letters} topics={topics} />}
        </div>
      </section>
    </main>
  );
}

function LearnAlphabet({
  letters, userId, onChange,
}: { letters: Record<string, LetterRow>; userId?: string; onChange: () => void }) {
  const toggleMastered = (letter: string) => {
    if (!userId) return;
    try {
      toggleLetterMastered(userId, letter);
      onChange();
    } catch {
      toast.error("Couldn't save progress");
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {ASL_ALPHABET.map((l) => {
          const m = letters[l.letter]?.mastered;
          return (
            <article key={l.letter} className={`rounded-2xl border p-4 transition ${m ? "border-accent bg-accent/5" : "border-border bg-card"}`}>
              <div className="flex justify-center">
                <SignHand letter={l.letter} motion={l.motion} size="sm" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <h3 className="font-display text-xl">{l.letter}</h3>
                <button onClick={() => toggleMastered(l.letter)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                    m ? "bg-accent text-accent-foreground" : "border border-border text-muted-foreground hover:bg-secondary"
                  }`}>
                  {m ? (<><Check className="h-3 w-3" /> Mastered</>) : "Mark learned"}
                </button>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{l.shape}</p>
            </article>
          );
        })}
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

function FingerspellPlayer({
  initialText = "", userId, onSaved,
}: { initialText?: string; userId?: string; onSaved: () => void }) {
  const [text, setText] = useState(initialText);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [speedMs, setSpeedMs] = useState(700);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxReachedRef = useRef(0);
  const savedKeyRef = useRef<string>("");

  const letters = useMemo(() => {
    return text.toUpperCase().split("").map((ch) => {
      if (ch === " ") return { letter: " ", shape: "(space)" } as const;
      const found = ASL_ALPHABET.find((l) => l.letter === ch);
      return found ?? { letter: ch, shape: ch.match(/[0-9]/) ? "Number — sign the digit." : "Non-letter character — skipped." };
    });
  }, [text]);

  const signableTotal = useMemo(
    () => letters.filter((l) => l.letter !== " " && ASL_ALPHABET.some((a) => a.letter === l.letter)).length,
    [letters]
  );
  const topicKey = text.trim().toUpperCase();

  // reset progress tracking when text changes
  useEffect(() => {
    maxReachedRef.current = 0;
    savedKeyRef.current = "";
  }, [topicKey]);

  // persist progress whenever the user advances further than before
  useEffect(() => {
    if (!userId || letters.length === 0 || !topicKey) return;
    if (index <= maxReachedRef.current && savedKeyRef.current === topicKey) return;
    maxReachedRef.current = Math.max(maxReachedRef.current, index);
    savedKeyRef.current = topicKey;
    const reachedSignable = letters
      .slice(0, maxReachedRef.current + 1)
      .filter((l) => l.letter !== " " && ASL_ALPHABET.some((a) => a.letter === l.letter)).length;
    const completed = maxReachedRef.current >= letters.length - 1;
    try {
      saveTopicProgress(userId, {
        topic: text.trim().slice(0, 200),
        topic_key: topicKey,
        total_letters: signableTotal,
        letters_completed: reachedSignable,
        completed,
      });
      if (completed) onSaved();
    } catch (err) {
      console.warn("save topic progress", err);
    }
  }, [index, letters, topicKey, signableTotal, text, userId, onSaved]);

  useEffect(() => {
    if (!playing) return;
    if (index >= letters.length - 1) { setPlaying(false); onSaved(); return; }
    timer.current = setTimeout(() => setIndex((i) => i + 1), speedMs);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [playing, index, letters.length, speedMs, onSaved]);

  const start = () => {
    if (letters.length === 0) return;
    if (index >= letters.length - 1) setIndex(0);
    setPlaying(true);
  };
  const reset = () => { setPlaying(false); setIndex(0); };

  const current = letters[index];
  const progressPct = letters.length ? Math.round(((index + 1) / letters.length) * 100) : 0;

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
        <>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-accent transition-all" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="mt-6 grid items-center gap-8 md:grid-cols-[auto_1fr]">
            <div key={index} className="animate-fade-in">
              {current.letter === " " ? (
                <div className="flex h-[260px] w-[260px] items-center justify-center rounded-3xl border border-dashed border-border text-muted-foreground">
                  · space ·
                </div>
              ) : (
                <SignHand
                  letter={current.letter}
                  motion={"motion" in current ? (current as { motion?: string }).motion : undefined}
                  repeat={index > 0 && letters[index - 1]?.letter === current.letter}
                  size="lg"
                />
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Letter {index + 1} of {letters.length}</p>
              <h3 className="mt-1 font-display text-3xl">{current.letter === " " ? "(space)" : current.letter}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{current.shape}</p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {letters.map((l, i) => (
                  <button key={i} onClick={() => { setPlaying(false); setIndex(i); }}
                    className={`h-7 w-7 rounded-md text-[11px] font-semibold transition ${
                      i === index ? "bg-accent text-accent-foreground"
                      : i < index ? "bg-secondary text-foreground" : "bg-background text-muted-foreground border border-border"
                    }`}
                    aria-label={`Jump to letter ${l.letter}`}>
                    {l.letter === " " ? "·" : l.letter}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={() => { setPlaying(false); setIndex((i) => Math.max(0, i - 1)); }}
                  className="rounded-full border border-border bg-background p-2 hover:bg-secondary" aria-label="Previous letter">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {playing ? (
                  <button onClick={() => setPlaying(false)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
                    <Pause className="h-4 w-4" /> Pause
                  </button>
                ) : (
                  <button onClick={start} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
                    <Play className="h-4 w-4" /> Play
                  </button>
                )}
                <button onClick={() => { setPlaying(false); setIndex((i) => Math.min(letters.length - 1, i + 1)); }}
                  className="rounded-full border border-border bg-background p-2 hover:bg-secondary" aria-label="Next letter">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs hover:bg-secondary">
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>

                <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                  Speed
                  <input type="range" min={300} max={1500} step={100} value={speedMs}
                    onChange={(e) => setSpeedMs(Number(e.target.value))} className="accent-accent" />
                  <span className="tabular-nums">{(speedMs / 1000).toFixed(1)}s</span>
                </label>
              </div>
            </div>
          </div>
        </>
      )}

      {letters.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          Type any word above and press play. NeuroLearnAI will fingerspell each letter at your chosen pace, and your progress is saved automatically.
        </p>
      )}

      <p className="mt-8 border-t border-border pt-4 text-[11px] text-muted-foreground">
        Note: this module teaches ASL fingerspelling. Full lexical signs (whole-word gestures) require a 3D
        avatar or signed-video library and are on the roadmap.
      </p>
    </div>
  );
}

function StatsPanel({ letters, topics }: { letters: Record<string, LetterRow>; topics: TopicRow[] }) {
  const masteredCount = Object.values(letters).filter((l) => l.mastered).length;
  const completed = topics.filter((t) => t.completed);
  const inProgress = topics.filter((t) => !t.completed);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-widest text-accent">Alphabet mastery</p>
        <p className="mt-2 font-display text-4xl">{masteredCount}<span className="text-muted-foreground text-2xl">/26</span></p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-accent" style={{ width: `${(masteredCount / 26) * 100}%` }} />
        </div>
        <div className="mt-5 grid grid-cols-9 gap-1.5 sm:grid-cols-13">
          {ASL_ALPHABET.map((l) => {
            const r = letters[l.letter];
            return (
              <div key={l.letter}
                className={`flex h-7 items-center justify-center rounded-md text-[11px] font-semibold ${
                  r?.mastered ? "bg-accent text-accent-foreground" : "border border-border text-muted-foreground"
                }`}
                title={`${l.letter}${r ? ` · practiced ${r.practice_count}×` : ""}`}>
                {l.letter}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-widest text-accent">Topics</p>
        <div className="mt-2 flex gap-6 text-sm">
          <div><div className="font-display text-3xl">{completed.length}</div><div className="text-xs text-muted-foreground">completed</div></div>
          <div><div className="font-display text-3xl">{inProgress.length}</div><div className="text-xs text-muted-foreground">in progress</div></div>
        </div>
        <ul className="mt-5 max-h-72 space-y-2 overflow-y-auto pr-1">
          {topics.length === 0 && <li className="text-sm text-muted-foreground">No topics yet — try the "Sign a concept" tab.</li>}
          {topics.map((t) => {
            const pct = t.total_letters ? Math.round((t.letters_completed / t.total_letters) * 100) : 0;
            return (
              <li key={t.topic_key} className="rounded-2xl border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium">{t.topic}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${t.completed ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {t.completed ? "Completed" : `${pct}%`}
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {t.letters_completed}/{t.total_letters} letters · last {new Date(t.last_practiced_at).toLocaleDateString()}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function CommonSignsPanel() {
  const categories = useMemo(() => {
    const map = new Map<SignWord["category"], SignWord[]>();
    for (const s of COMMON_SIGNS) {
      const arr = map.get(s.category) ?? [];
      arr.push(s);
      map.set(s.category, arr);
    }
    return Array.from(map.entries());
  }, []);

  const [active, setActive] = useState<SignWord>(COMMON_SIGNS[0]);
  const [step, setStep] = useState(0);

  // animate through the handshapes used in the active sign
  useEffect(() => {
    setStep(0);
    const shapes = active.handshapes ?? [];
    if (shapes.length <= 1) return;
    const id = setInterval(() => setStep((s) => (s + 1) % shapes.length), 1100);
    return () => clearInterval(id);
  }, [active]);

  const shape = active.handshapes?.[step];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <aside className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          <h2 className="font-display text-lg">Globally common ASL signs</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Whole-word signs used every day. Tap any to see how it's formed.
        </p>
        <div className="mt-4 max-h-[520px] space-y-5 overflow-y-auto pr-1">
          {categories.map(([cat, items]) => (
            <div key={cat}>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{cat}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {items.map((s) => (
                  <button
                    key={s.word}
                    onClick={() => setActive(s)}
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      active.word === s.word
                        ? "bg-accent text-accent-foreground"
                        : "border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {s.word}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <article className="space-y-6">
        <div className="rounded-3xl border border-border bg-card p-7">
          <p className="text-xs uppercase tracking-widest text-accent">{active.category}</p>
          <h3 className="mt-1 font-display text-4xl">{active.word}</h3>

          <div className="mt-6 grid items-center gap-6 sm:grid-cols-[auto_1fr]">
            <div className="flex justify-center">
              {shape ? (
                <SignHand letter={shape} size="lg" />
              ) : (
                <div className="flex h-[260px] w-[260px] items-center justify-center rounded-3xl border border-dashed border-border text-muted-foreground">
                  Whole-body sign
                </div>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">How to sign it</p>
              <p className="mt-2 text-base leading-relaxed text-foreground/90">{active.description}</p>

              {active.handshapes && active.handshapes.length > 0 && (
                <div className="mt-5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Handshapes used</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {active.handshapes.map((h, i) => (
                      <button
                        key={`${h}-${i}`}
                        onClick={() => setStep(i)}
                        className={`flex items-center gap-2 rounded-2xl border p-2 transition ${
                          i === step ? "border-accent bg-accent/5" : "border-border bg-background hover:bg-secondary"
                        }`}
                        aria-label={`Show handshape ${h}`}
                      >
                        <SignHand letter={h} size="sm" />
                        <span className="pr-2 font-display text-lg">{h}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <WordSignLesson sign={active} />
      </article>
    </div>
  );
}
