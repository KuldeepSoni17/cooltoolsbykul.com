"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hatch, WBtn } from "@/components/attack-defense/wf-primitives";

interface LastResult {
  winnerId?: string;
  round?: number;
  meName?: string;
  won?: boolean;
}

export default function AttackDefenseResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<LastResult | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ad_last_result");
      if (raw) setResult(JSON.parse(raw) as LastResult);
    } catch {
      setResult(null);
    }
  }, []);

  const outcome = result?.won ? "win" : result?.won === false ? "loss" : "win";
  const name = result?.meName ?? "kul";
  const roundLabel = result?.round ? `round ${result.round}` : "round 7";

  return (
    <main className="wf-container wf-col wf-gap-3" style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}>
      {/* Mobile — Direction C (podium) */}
      <section className="md:hidden wf-col wf-gap-2 wf-grow">
        <div className="wf-center-text">
          <span className="stamp">{outcome === "win" ? "victory" : outcome === "loss" ? "defeat" : "draw"}</span>
        </div>
        <div className="hand wf-center-text" style={{ fontSize: 36, marginTop: 4 }}>
          {outcome === "win" ? `${name} standing.` : `${name} fell.`}
        </div>
        <div className="wf-row wf-gap-2 wf-ai-c wf-center wf-mt-2" style={{ height: 160 }}>
          <div className="wf-col wf-ai-c">
            <div className="wf-xs">opponent</div>
            <Hatch w={60} h={60} label="2" />
          </div>
          <div className="wf-col wf-ai-c">
            <div className="wf-xs wf-b">{name.toUpperCase()}</div>
            <Hatch w={64} h={100} label="1" style={{ background: "var(--accent-3)" }} />
          </div>
          <div className="wf-col wf-ai-c">
            <div className="wf-xs">bot</div>
            <Hatch w={60} h={40} label="3" />
          </div>
        </div>
        <div className="sketchy-thin wf-pad-2">
          <div className="wf-xs wf-upper wf-muted">mvp move</div>
          <div className="hand">last round swing</div>
        </div>
        <WBtn variant="primary" full onClick={() => router.push("/games/attack-defense/play/lobby")}>
          rematch
        </WBtn>
        <WBtn full onClick={() => router.push("/games/attack-defense/play/lobby")}>
          lobby
        </WBtn>
      </section>

      {/* Desktop — Direction B (timeline) */}
      <section className="hidden md:flex md:flex-col wf-gap-3 wf-grow">
        <div className="wf-row wf-between wf-ai-c">
          <div className="hand" style={{ fontSize: 48 }}>
            {outcome === "win" ? `⚑ ${name} wins.` : `${name} fell.`}
          </div>
          <div className="wf-muted">{roundLabel} · 2m 14s</div>
        </div>
        <div className="sketchy wf-pad-3" style={{ background: "var(--paper-2)" }}>
          <div className="wf-row wf-gap-2 wf-ai-end" style={{ justifyContent: "space-between" }}>
            {[1, 2, 3, 4, 5, 6, 7].map((r) => (
              <div key={r} className="wf-col wf-gap-1 wf-ai-c">
                <div className="wf-row wf-gap-1 wf-ai-end">
                  <div style={{ width: 10, height: Math.max(8, 80 - r * 8), background: "var(--accent-3)", border: "1.5px solid var(--ink)" }} />
                  <div style={{ width: 10, height: Math.max(8, 72 - r * 10), background: "#ffd6cc", border: "1.5px solid var(--ink)" }} />
                  <div style={{ width: 10, height: Math.max(4, 64 - r * 12), background: "#cce0f0", border: "1.5px solid var(--ink)" }} />
                </div>
                <span className="mono wf-xs">R{r}</span>
              </div>
            ))}
          </div>
          <div className="wf-row wf-gap-3 wf-mt-2 wf-small">
            <span>
              <span style={{ background: "var(--accent-3)", border: "1.5px solid var(--ink)", display: "inline-block", width: 10, height: 10, marginRight: 4 }} />
              {name}
            </span>
            <span>
              <span style={{ background: "#ffd6cc", border: "1.5px solid var(--ink)", display: "inline-block", width: 10, height: 10, marginRight: 4 }} />
              opponent
            </span>
            <span>
              <span style={{ background: "#cce0f0", border: "1.5px solid var(--ink)", display: "inline-block", width: 10, height: 10, marginRight: 4 }} />
              bot
            </span>
          </div>
        </div>
        <div className="wf-row wf-gap-3">
          <div className="sketchy-thin wf-pad-2 wf-grow">
            <div className="wf-xs wf-upper wf-muted">key moments</div>
            <ul className="wf-small" style={{ margin: "4px 0 0 16px", padding: 0 }}>
              <li>Early shields traded</li>
              <li>Mid-game sneak pressure</li>
              <li>Final elimination swing</li>
            </ul>
          </div>
          <div className="sketchy-thin wf-pad-2" style={{ width: 200 }}>
            <div className="wf-xs wf-upper wf-muted">result</div>
            <div className="mono wf-b wf-lg">{outcome === "win" ? "WIN" : "LOSS"}</div>
          </div>
        </div>
        <div className="wf-row wf-gap-2">
          <WBtn variant="primary" onClick={() => router.push("/games/attack-defense/play/lobby")}>
            rematch →
          </WBtn>
          <WBtn onClick={() => router.push("/games/attack-defense/play/lobby")}>lobby</WBtn>
        </div>
      </section>
    </main>
  );
}
