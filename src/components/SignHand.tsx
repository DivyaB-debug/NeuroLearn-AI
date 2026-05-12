// Stylized hand-card visual for an ASL letter. We render a clean, abstract
// "hand frame" with the letter glyph as the focal element. The animation comes
// from the parent player (fade/scale transitions between letters). For a true
// avatar-based renderer, we'd swap this component without touching the page.

type Props = {
  letter: string;
  motion?: string;
  size?: "sm" | "lg";
};

export function SignHand({ letter, motion, size = "lg" }: Props) {
  const dim = size === "lg" ? 260 : 120;
  const fontSize = size === "lg" ? 140 : 64;
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-3xl border border-border bg-gradient-to-br from-secondary to-card shadow-inner"
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
      <span
        className="relative font-display font-bold leading-none tracking-tight text-accent"
        style={{ fontSize }}
      >
        {letter}
      </span>
      {motion && size === "lg" && (
        <span className="absolute bottom-3 right-4 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-accent">
          ↻ {motion}
        </span>
      )}
    </div>
  );
}
