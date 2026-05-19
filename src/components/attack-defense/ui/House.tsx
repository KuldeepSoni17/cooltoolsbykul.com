export type HouseState = "ok" | "damaged" | "shielded" | "trapped" | "destroyed" | "target";

export interface HouseData {
  id: string;
  hp: number;
  max: number;
  state: HouseState;
}

export function House({
  hp = 6,
  max = 6,
  state = "ok",
  size,
  label,
  onClick,
}: {
  hp?: number;
  max?: number;
  state?: HouseState;
  size?: "sm" | "lg" | "xl";
  label?: string;
  onClick?: () => void;
}) {
  const cls = ["ad-house"];
  if (size === "sm") cls.push("ad-house--sm");
  if (size === "lg") cls.push("ad-house--lg");
  if (size === "xl") cls.push("ad-house--xl");
  if (state === "damaged") cls.push("ad-house--damaged");
  if (state === "shielded") cls.push("ad-house--shielded");
  if (state === "trapped") cls.push("ad-house--trapped");
  if (state === "destroyed") cls.push("ad-house--destroyed");
  if (state === "target") cls.push("ad-house--target");

  return (
    <button type="button" className={cls.join(" ")} onClick={onClick} aria-label={label || `house ${hp}/${max} ${state}`}>
      {state !== "destroyed" && (
        <span className="ad-house__hp">
          {hp}/{max}
        </span>
      )}
    </button>
  );
}

export function HouseRow({
  houses,
  size,
  targetableIds,
  onTargetHouse,
}: {
  houses: HouseData[];
  size?: "sm" | "lg" | "xl";
  targetableIds?: string[];
  onTargetHouse?: (id: string) => void;
}) {
  return (
    <div className="ad-row" style={{ gap: 10, justifyContent: "center" }}>
      {houses.map((h) => (
        <House
          key={h.id}
          hp={h.hp}
          max={h.max}
          state={targetableIds?.includes(h.id) ? "target" : h.state}
          size={size}
          onClick={() => onTargetHouse?.(h.id)}
        />
      ))}
    </div>
  );
}
