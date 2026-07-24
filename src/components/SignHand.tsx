// Realistic ASL handshape card with high-clarity animated transitions.
//
// Visual layers, back-to-front:
//   1. Layered gradient backdrop with subtle grid
//   2. Rotating conic "active" ring
//   3. Breathing halo
//   4. Ghost of the previous letter — fades + blurs out as the new one settles in
//      (creates a smooth morph illusion instead of a hard swap)
//   5. Current letter with an overshoot "settle" entry and gentle breathing idle
//   6. Sheen sweep for a polished, tactile feel
//   7. Motion-trace + fingertip dot for J / Z (dot rides the exact path)

import { useEffect, useRef, useState } from "react";

type Props = {
  letter: string;
  motion?: string;
  /** When true, signals a repeated/double letter — shows a small bounce. */
  repeat?: boolean;
  size?: "sm" | "md" | "lg";
};

const MOTION_PATHS: Record<string, { d: string; len: number; label: string }> = {
  J: {
    // Start high, sweep down and hook left — the classic J trace
    d: "M62 30 V60 q0 16 -16 16 q-12 0 -18 -10",
    len: 82,
    label: "Trace a J",
  },
  Z: {
    // Top bar → diagonal → bottom bar
    d: "M28 32 H72 L28 70 H72",
    len: 130,
    label: "Trace a Z",
  },
};

export function SignHand({ letter, motion, repeat, size = "lg" }: Props) {
  const dim = size === "lg" ? 260 : size === "md" ? 180 : 120;
  const path = MOTION_PATHS[letter];
  const isLetter = /^[A-Z]$/.test(letter);
  const src = isLetter ? `/asl/${letter}.svg` : null;

  // Track the previous letter so we can render it as a fading "ghost" behind
  // the new letter — this is what sells the morph.
  const [ghost, setGhost] = useState<string | null>(null);
  const prev = useRef<string>(letter);
  useEffect(() => {
    if (prev.current && prev.current !== letter && /^[A-Z]$/.test(prev.current)) {
      setGhost(prev.current);
      const t = setTimeout(() => setGhost(null), 550);
      prev.current = letter;
      return () => clearTimeout(t);
    }
    prev.current = letter;
  }, [letter]);

  const strokeW = size === "lg" ? 3.6 : size === "md" ? 2.8 : 2.2;
  const tipR = size === "lg" ? 3.2 : size === "md" ? 2.4 : 1.8;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-border shadow-[0_10px_40px_-18px_rgba(0,0,0,0.25)] ${
        repeat ? "sign-bounce" : ""
      }`}
      style={{
        width: dim,
        height: dim,
        background:
          "radial-gradient(120% 90% at 30% 20%, oklch(0.99 0.02 85) 0%, oklch(0.96 0.03 80) 40%, oklch(0.92 0.05 75) 100%)",
      }}
    >
      {/* Subtle dotted grid */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(oklch(0.72 0.18 45 / 0.15) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* Rotating conic "active" ring */}
      {size !== "sm" && (
        <span
          aria-hidden
          className="sign-ring absolute rounded-full"
          style={{ width: dim * 0.88, height: dim * 0.88 }}
        />
      )}

      {/* Breathing halo */}
      <span
        aria-hidden
        className="sign-pulse absolute rounded-full bg-[oklch(0.72_0.18_45/0.18)] blur-xl"
        style={{ width: dim * 0.6, height: dim * 0.6 }}
      />

      {/* Ghost of previous letter — the morph tail */}
      {ghost && (
        <img
          key={`ghost-${ghost}`}
          src={`/asl/${ghost}.svg`}
          alt=""
          aria-hidden
          className="sign-ghost absolute z-10 h-[78%] w-[78%] object-contain"
          draggable={false}
        />
      )}

      {/* Current ASL handshape illustration */}
      {src ? (
        <div
          key={`wrap-${letter}`}
          className="sign-settle relative z-10 flex h-full w-full items-center justify-center"
        >
          <img
            src={src}
            alt={`ASL handshape for the letter ${letter}`}
            className="sign-breathe h-[80%] w-[80%] object-contain drop-shadow-[0_6px_14px_rgba(80,40,10,0.18)]"
            draggable={false}
          />
        </div>
      ) : (
        <span
          className="relative z-10 font-display text-5xl text-muted-foreground"
          aria-label={letter}
        >
          {letter || "·"}
        </span>
      )}

      {/* Polished sheen sweep */}
      {size !== "sm" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[15] w-1/2 opacity-70"
        >
          <span className="sign-sheen block h-full w-full" />
        </span>
      )}

      {/* Animated motion trace + fingertip dot for J / Z */}
      {path && (
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 z-20 h-full w-full"
          aria-hidden
        >
          {/* Faint guide */}
          <path
            d={path.d}
            fill="none"
            stroke="currentColor"
            className="text-accent/25"
            strokeWidth={strokeW * 0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Animated ink stroke */}
          <path
            d={path.d}
            fill="none"
            stroke="currentColor"
            className="sign-trace text-accent"
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ ["--trace-len" as string]: path.len }}
          />
          {/* Fingertip dot that rides the exact path via CSS motion-path */}
          <circle
            r={tipR}
            cx={0}
            cy={0}
            className="sign-tip fill-accent"
            style={{ ["--tip-path" as string]: `"${path.d}"` }}
          />
        </svg>
      )}

      {/* Letter chip */}
      {isLetter && size !== "sm" && (
        <span className="absolute left-3 top-3 z-30 rounded-full bg-background/85 px-2 py-0.5 font-display text-xs font-bold text-foreground shadow-sm backdrop-blur-sm">
          {letter}
        </span>
      )}

      {/* Motion / repeat cue chip */}
      {size === "lg" && (motion || repeat) && (
        <span className="absolute bottom-3 right-3 z-30 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-accent shadow-sm backdrop-blur-sm">
          <span aria-hidden>{repeat ? "↻" : "✎"}</span>
          {repeat ? "Repeat — small bounce" : motion}
        </span>
      )}
    </div>
  );
}
