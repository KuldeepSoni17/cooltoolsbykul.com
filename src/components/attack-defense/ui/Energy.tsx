import { Icon } from "./Icon";

export function Energy({ value, max = 20, pending = 0 }: { value: number; max?: number; pending?: number }) {
  const segs = 10;
  const pct = value / max;
  const filledSegs = Math.round(pct * segs);
  const pendSegs = Math.max(0, Math.round(((value + pending) / max) * segs));

  return (
    <div className="ad-energy">
      <Icon name="bolt" size={16} color="var(--energy)" />
      <div className="ad-energy__track">
        {Array.from({ length: segs }).map((_, i) => {
          let kind = "";
          if (i < filledSegs) kind = "ad-energy__seg--on";
          else if (i < pendSegs) kind = "ad-energy__seg--pending";
          return <span key={i} className={`ad-energy__seg ${kind}`} />;
        })}
      </div>
      <span className="ad-energy__val">
        {value}
        <span className="max">/{max}</span>
      </span>
    </div>
  );
}
