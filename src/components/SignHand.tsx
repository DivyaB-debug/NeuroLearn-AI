// Stylized hand-card visual for an ASL letter, now with animated motion clues.
// - Letters J and Z get an animated SVG trace that "draws" their motion path.
// - Letters with motion (or marked `repeat`) get a directional arrow indicator.
// - Static letters get a subtle pulse halo so the user sees the hand "settle".
// For a true avatar-based renderer, swap this component without touching the page.

type Props = {
  letter: string;
  motion?: string;
  /** When true, signals a repeated/double letter — shows a small bounce + replay cue. */
  repeat?: boolean;
  size?: "sm" | "lg";
};

// Motion path definitions in the SVG's 100x100 viewBox.
// Approx path lengths so the dash animation completes cleanly.
const MOTION_PATHS: Record<string, { d: string; len: number; label: string }> = {
  J: {
    // Start top-right, curve down and hook left like a J.
    d: "M65 28 V60 q0 14 -14 14 q-12 0 -16 -10",
    len: 80,
    label: "Trace a J",
  },
  Z: {
    // Classic Z stroke: top → right, diagonal, bottom → right.
    d: "M30 32 H72 L30 70 H72",
    len: 130,
    label: "Trace a Z",
  },
};

export function SignHand({ letter, motion, repeat, size = "lg" }: Props) {
  const dim = size === "lg" ? 260 : 120;
  const fontSize = size === "lg" ? 140 : 64;
  const path = MOTION_PATHS[letter];

  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary to-card shadow-inner"
      style={{ width: dim, height: dim }}
    >
      {/* Decorative hand silhouette */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full opacity-[0.07]"
        aria-hidden
      >
        <path
          d="M30 90 V55 q0-6 6-6 t6 6 V35 q0-6 6-6 t6 6 V32 q0-6 6-6 t6 6 V42 q0-6 6-6 t6 6 V70 q0 20-20 22 H40 q-10-2-10-2 z"
          fill="currentColor"
          className="text-foreground"
        />
      </svg>

      {/* Soft pulse halo — shows the hand "tapping" into position */}
      {!path && (
        <span
          aria-hidden
          className="sign-pulse absolute rounded-full bg-accent/15"
          style={{ width: dim * 0.55, height: dim * 0.55 }}
        />
      )}

      {/* Animated motion trace for J / Z */}
      {path && (
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <path
            d={path.d}
            fill="none"
            stroke="currentColor"
            className="sign-trace text-accent"
            strokeWidth={size === "lg" ? 3.5 : 2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ ["--trace-len" as string]: path.len }}
          />
          {/* Arrowhead at the end of the path */}
          <circle
            cx={letter === "Z" ? 72 : 35}
            cy={letter === "Z" ? 70 : 74}
            r={size === "lg" ? 2.4 : 1.8}
            className="fill-accent sign-arrow"
          />
        </svg>
      )}

      <span
        className={`relative font-display font-bold leading-none tracking-tight text-accent ${
          repeat ? "sign-bounce" : ""
        }`}
        style={{ fontSize }}
      >
        {letter}
      </span>

      {/* Motion / repeat cue chip */}
      {size === "lg" && (motion || repeat) && (
        <span className="absolute bottom-3 right-4 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-accent">
          <span aria-hidden>{repeat ? "↻" : "✎"}</span>
          {repeat ? "Repeat — small bounce" : motion}
        </span>
      )}
    </div>
  );
}
