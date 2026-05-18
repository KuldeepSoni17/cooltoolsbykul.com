"use client";

import { WBtn } from "@/components/attack-defense/wf-primitives";

export default function AttackDefensePlayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="wf-container wf-pad-3">
      <section className="sketchy wf-pad-3 wf-col wf-gap-3">
        <span className="stamp">error</span>
        <h1 className="hand" style={{ fontSize: 36 }}>
          Game screen hit a snag
        </h1>
        <p className="scribble wf-small wf-muted">A runtime issue interrupted rendering. Retry once, or refresh the page.</p>
        <p className="mono wf-xs" style={{ color: "var(--accent)" }}>
          {error.message}
        </p>
        <WBtn variant="primary" onClick={reset}>
          Retry screen
        </WBtn>
      </section>
    </main>
  );
}
