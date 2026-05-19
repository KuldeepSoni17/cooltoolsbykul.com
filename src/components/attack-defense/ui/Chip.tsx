export function Chip({
  children,
  tone,
  size,
}: {
  children: React.ReactNode;
  tone?: "attack" | "defense" | "energy" | "solid";
  size?: "lg";
}) {
  const cls = ["ad-chip"];
  if (size === "lg") cls.push("ad-chip--lg");
  if (tone === "attack") cls.push("ad-chip--attack");
  if (tone === "defense") cls.push("ad-chip--defense");
  if (tone === "energy") cls.push("ad-chip--energy");
  if (tone === "solid") cls.push("ad-chip--solid");
  return <span className={cls.join(" ")}>{children}</span>;
}
