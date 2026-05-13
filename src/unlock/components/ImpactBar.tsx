export function ImpactBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score * 10))
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-text-secondary">Impact</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-secondary">
        <div
          className="h-full rounded-full bg-accent-teal transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-text-primary">{score}/10</span>
    </div>
  )
}
