export function Phase({ phase = "decision" }: { phase?: "waiting" | "decision" | "resolution" | "game_over" }) {
  return <span className={`ad-phase ad-phase--${phase}`}>{phase.replace("_", " ")}</span>;
}
