export function RingTimer({
  value,
  total,
  size = 64,
  tone,
  label,
}: {
  value: number;
  total: number;
  size?: number;
  tone?: "attack" | "defense" | "warn" | "";
  label?: string;
}) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / total));
  const off = c * (1 - pct);
  const cls = ["ad-ring"];
  if (tone === "attack") cls.push("ad-ring--attack");
  if (tone === "defense") cls.push("ad-ring--defense");
  if (tone === "warn") cls.push("ad-ring--warn");

  return (
    <div className={cls.join(" ")} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle className="ad-ring__track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="4" />
        <circle
          className="ad-ring__bar"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth="4"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </svg>
      <div className="ad-ring__label">{label != null ? label : `${value}s`}</div>
    </div>
  );
}
