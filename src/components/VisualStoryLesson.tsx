import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Play, Pause, SkipBack, SkipForward, Sparkles, Film } from "lucide-react";
import { generateVisualStory } from "@/lib/learning.functions";
import { toast } from "sonner";

type Scene = { caption: string; imagePrompt: string; img?: string };

export function VisualStoryLesson({ topic }: { topic: string }) {
  const planStory = useServerFn(generateVisualStory);
  const [title, setTitle] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(0);
  const tickRef = useRef<number | null>(null);
  const lastTopicRef = useRef<string>("");

  const build = async () => {
    if (!topic.trim()) { toast.error("Type a topic first"); return; }
    setBusy(true);
    setScenes([]);
    setImgLoaded(0);
    setActive(0);
    setPlaying(false);
    try {
      const plan = await planStory({ data: { topic: topic.trim() } });
      setTitle(plan.title);
      const drafts: Scene[] = plan.scenes.map((s) => ({ ...s }));
      setScenes(drafts);

      // Generate images in parallel; update each as it lands.
      await Promise.all(
        drafts.map(async (s, i) => {
          try {
            const r = await fetch("/api/lesson-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: s.imagePrompt }),
            });
            const data = (await r.json()) as { b64?: string; error?: string };
            if (!r.ok || !data.b64) throw new Error(data.error || "image failed");
            setScenes((prev) => {
              const next = [...prev];
              next[i] = { ...next[i], img: `data:image/png;base64,${data.b64}` };
              return next;
            });
            setImgLoaded((n) => n + 1);
          } catch (e) {
            console.error("scene", i, e);
          }
        })
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Story failed");
    } finally {
      setBusy(false);
    }
  };

  // Auto-advance "video" playback through scenes (5s each).
  useEffect(() => {
    if (!playing || scenes.length === 0) return;
    tickRef.current = window.setTimeout(() => {
      setActive((a) => {
        const next = a + 1;
        if (next >= scenes.length) { setPlaying(false); return a; }
        return next;
      });
    }, 5000);
    return () => { if (tickRef.current) clearTimeout(tickRef.current); };
  }, [playing, active, scenes.length]);

  if (!scenes.length && !busy) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-accent/15 p-2"><Film className="h-4 w-4 text-accent" /></div>
          <div className="flex-1">
            <h3 className="font-display text-lg">Visual story</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Turn this topic into a 4-scene animated story with AI-illustrated scenes.
            </p>
          </div>
        </div>
        <button onClick={build} disabled={busy || !topic.trim()}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
          <Sparkles className="h-3 w-3" /> Generate visual story
        </button>
      </div>
    );
  }

  if (busy && !scenes.length) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
        Planning your visual story…
      </div>
    );
  }

  const cur = scenes[active];
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">Visual story</p>
          <h3 className="font-display text-lg leading-tight">{title}</h3>
        </div>
        <span className="text-xs text-muted-foreground">{imgLoaded}/{scenes.length} ready</span>
      </div>

      <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
        {cur?.img ? (
          <img
            key={active}
            src={cur.img}
            alt={cur.caption}
            className="h-full w-full animate-[kenburns_8s_ease-out_forwards] object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4">
          <p className="text-sm text-white">{cur?.caption}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => { setActive((a) => Math.max(0, a - 1)); setPlaying(false); }}
          className="rounded-full border border-border p-2 hover:bg-secondary" aria-label="Previous">
          <SkipBack className="h-3 w-3" />
        </button>
        <button onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : "Play story"}
        </button>
        <button onClick={() => { setActive((a) => Math.min(scenes.length - 1, a + 1)); setPlaying(false); }}
          className="rounded-full border border-border p-2 hover:bg-secondary" aria-label="Next">
          <SkipForward className="h-3 w-3" />
        </button>
        <div className="ml-auto flex gap-1">
          {scenes.map((_, i) => (
            <button key={i} onClick={() => { setActive(i); setPlaying(false); }}
              className={`h-1.5 w-6 rounded-full transition ${i === active ? "bg-accent" : "bg-border"}`}
              aria-label={`Scene ${i + 1}`} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1) translate(0,0); }
          100% { transform: scale(1.12) translate(-2%, -2%); }
        }
      `}</style>
    </div>
  );
}
