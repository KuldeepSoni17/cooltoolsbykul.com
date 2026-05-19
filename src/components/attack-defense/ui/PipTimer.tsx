export function PipTimer({ value, total = 15, tone }: { value: number; total?: number; tone?: "warn" | "" }) {
  return (
    <div className="ad-pip-timer">
      {Array.from({ length: total }).map((_, i) => {
        let kind = "";
        if (i < value) {
          kind = tone === "warn" || value <= 5 ? "ad-pip-timer__pip--warn" : "ad-pip-timer__pip--on";
        }
        return <span key={i} className={`ad-pip-timer__pip ${kind}`} />;
      })}
    </div>
  );
}
