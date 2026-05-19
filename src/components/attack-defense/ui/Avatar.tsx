export function Avatar({
  name,
  variant,
  size,
  dead,
}: {
  name: string;
  variant?: "you" | "opp1" | "opp2";
  size?: "sm" | "lg";
  dead?: boolean;
}) {
  const cls = ["ad-avatar"];
  if (size === "sm") cls.push("ad-avatar--sm");
  if (size === "lg") cls.push("ad-avatar--lg");
  if (variant === "you") cls.push("ad-avatar--you");
  if (variant === "opp1") cls.push("ad-avatar--opp1");
  if (variant === "opp2") cls.push("ad-avatar--opp2");
  if (dead) cls.push("ad-avatar--dead");
  return <div className={cls.join(" ")}>{(name || "?").slice(0, 2).toUpperCase()}</div>;
}
