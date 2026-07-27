export function BrandBadge() {
  return (
    <div
      aria-label="NeuroLearnAI"
      style={{
        position: "fixed",
        right: 8,
        bottom: 8,
        zIndex: 2147483647,
        pointerEvents: "auto",
      }}
      className="select-none"
    >
      <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-background px-3 py-2 shadow-lg">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
        <span className="text-xs font-semibold tracking-tight text-foreground">
          NeuroLearnAI
        </span>
      </div>
    </div>
  );
}
