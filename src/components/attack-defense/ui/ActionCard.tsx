import { Icon } from "./Icon";

export interface ActionDef {
  type: string;
  name: string;
  cost: number;
  desc: string;
  target: "house" | "player";
  energyCost?: number;
}

export function ActionCard({
  action,
  kind,
  selected,
  disabled,
  onClick,
  costAffordable = true,
}: {
  action: ActionDef;
  kind: "attack" | "defense";
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  costAffordable?: boolean;
}) {
  const cls = ["ad-action"];
  if (kind === "attack") cls.push("ad-action--attack");
  if (kind === "defense") cls.push("ad-action--defense");
  if (selected) cls.push("ad-action--selected");

  return (
    <button
      type="button"
      className={cls.join(" ")}
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled || !costAffordable}
    >
      <div className="ad-action__head">
        <span className="ad-action__name">{action.name}</span>
        <span className="ad-action__cost">
          <Icon name="bolt" size={12} color="currentColor" />
          {action.cost}
        </span>
      </div>
      <div className="ad-action__desc">{action.desc}</div>
    </button>
  );
}
