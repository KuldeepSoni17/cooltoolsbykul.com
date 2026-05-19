"use client";

import { Btn } from "@/components/attack-defense/ui/Btn";

export default function AttackDefensePlayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="ad-ad-page">
      <section className="ad-card ad-card--raised ad-stack">
        <span className="ad-eyebrow" style={{ color: "var(--attack-fg)" }}>
          error
        </span>
        <h1 className="t-h2" style={{ margin: 0 }}>
          Game screen hit a snag
        </h1>
        <p className="t-body-sm" style={{ color: "var(--fg-mute)" }}>
          A runtime issue interrupted rendering. Retry once, or refresh the page.
        </p>
        <p className="tk-mono t-caption" style={{ color: "var(--bad)" }}>
          {error.message}
        </p>
        <Btn variant="primary" onClick={reset}>
          Retry screen
        </Btn>
      </section>
    </div>
  );
}
