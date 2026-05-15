// Realistic ASL handshape card.
// - Renders the actual public-domain ASL handshape illustration (Wikimedia / Public domain)
//   from /asl/{LETTER}.svg.
// - Letters J and Z get an animated SVG motion trace overlaid on top.
// - Smooth crossfade + subtle "settle" scale on every letter change so the hand
//   feels like it's moving from shape to shape, not just flashing.

type Props = {
  letter: string;
  motion?: string;
  /** When true, signals a repeated/double letter — shows a small bounce. */
  repeat?: boolean;
  size?: "sm" | "md" | "lg";
};

const MOTION_PATHS: Record<string, { d: string; len: number; label: string }> = {
  J: {
    d: "M62 30 V62 q0 14 -14 14 q-12 0 -16 -10",
    len: 80,
    label: "Trace a J",
  },
  Z: {
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

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-background via-secondary/60 to-card shadow-inner ${
        repeat ? "sign-bounce" : ""
      }`}
      style={{ width: dim, height: dim }}
    >
      {/* Soft halo */}
      <span
        aria-hidden
        className="sign-pulse absolute rounded-full bg-accent/10 blur-md"
        style={{ width: dim * 0.6, height: dim * 0.6 }}
      />

      {/* The real ASL handshape illustration */}
      {src ? (
        <img
          key={letter /* re-mount to retrigger fade-in */}
          src={src}
          alt={`ASL handshape for the letter ${letter}`}
          className="relative z-10 h-[80%] w-[80%] animate-fade-in object-contain drop-shadow-sm"
          draggable={false}
        />
      ) : (
        <span
          className="relative z-10 font-display text-5xl text-muted-foreground"
          aria-label={letter}
        >
          {letter || "·"}
        </span>
      )}

      {/* Animated motion trace for J / Z, drawn on top of the hand */}
      {path && (
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 z-20 h-full w-full"
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
          <circle
            cx={letter === "Z" ? 72 : 32}
            cy={letter === "Z" ? 70 : 76}
            r={size === "lg" ? 2.6 : 2}
            className="fill-accent sign-arrow"
          />
        </svg>
      )}

      {/* Letter chip */}
      {isLetter && size !== "sm" && (
        <span className="absolute left-3 top-3 z-20 rounded-full bg-background/85 px-2 py-0.5 font-display text-xs font-bold text-foreground backdrop-blur-sm">
          {letter}
        </span>
      )}

      {/* Motion / repeat cue chip */}
      {size === "lg" && (motion || repeat) && (
        <span className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-accent">
          <span aria-hidden>{repeat ? "↻" : "✎"}</span>
          {repeat ? "Repeat — small bounce" : motion}
        </span>
      )}
    </div>
  );
}
