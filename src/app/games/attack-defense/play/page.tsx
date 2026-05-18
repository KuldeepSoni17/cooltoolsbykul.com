"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hatch, WBtn } from "@/components/attack-defense/wf-primitives";
import { useAttackDefenseAuth } from "@/hooks/attack-defense/useAuth";

export default function AttackDefenseLanding() {
  const router = useRouter();
  const { signInGuest } = useAttackDefenseAuth();
  const [name, setName] = useState("");

  const enter = async () => {
    if (!name.trim()) return;
    await signInGuest(name.trim());
    router.push("/games/attack-defense/play/lobby");
  };

  return (
    <main className="wf-container">
      {/* Mobile — Direction A */}
      <section className="md:hidden wf-col wf-gap-3" style={{ padding: "2rem 0", minHeight: "80vh", justifyContent: "center" }}>
        <div className="hand wf-center-text" style={{ fontSize: 38, lineHeight: 1 }}>
          ATTACK
          <br />
          ·DEFENSE·
        </div>
        <div className="wf-muted scribble wf-center-text wf-small">
          3 players. 9 houses.
          <br />
          One survivor.
        </div>
        <div className="sketchy-thin" style={{ padding: 10, marginTop: 8 }}>
          <div className="wf-xs wf-muted wf-upper">your name</div>
          <input
            className="wf-input"
            placeholder="kul___"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void enter()}
          />
        </div>
        <WBtn variant="primary" full onClick={() => void enter()} disabled={!name.trim()}>
          ▶ play as guest
        </WBtn>
        <WBtn full disabled>
          continue with google
        </WBtn>
        <div className="wf-xs wf-muted wf-center-text wf-mt-2">no email needed · 30s to first match</div>
      </section>

      {/* Desktop — Direction C */}
      <section className="hidden md:flex md:gap-6" style={{ padding: "3rem 0", minHeight: "80vh", alignItems: "center" }}>
        <div className="wf-col wf-grow wf-gap-3" style={{ justifyContent: "center", maxWidth: 360 }}>
          <span className="stamp">chapter 0</span>
          <div className="hand" style={{ fontSize: 64, lineHeight: 0.95 }}>
            three small
            <br />
            kingdoms.
          </div>
          <div className="scribble">only one will stand at the end of the round.</div>
          <div className="sketchy-thin wf-row wf-ai-c wf-gap-2" style={{ padding: 6, maxWidth: 280 }}>
            <span className="wf-muted wf-xs">your name</span>
            <input
              className="wf-input wf-grow"
              style={{ fontSize: 20 }}
              placeholder="kul"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void enter()}
            />
          </div>
          <WBtn variant="primary" onClick={() => void enter()} disabled={!name.trim()}>
            enter the table →
          </WBtn>
          <div className="wf-row wf-gap-3 wf-muted wf-xs">
            <span>how to play</span>
            <span>·</span>
            <span>credits</span>
          </div>
        </div>
        <div className="wf-col wf-grow wf-center">
          <Hatch w="100%" h={380} label="storybook illustration of 3 kingdoms · woodcut style" />
          <div className="wf-row wf-gap-2 wf-mt-2">
            <span className="tag">30s decision</span>
            <span className="tag">45s recap</span>
            <span className="tag">1 attack max</span>
          </div>
        </div>
      </section>
    </main>
  );
}
