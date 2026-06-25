"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Policy, PolicyKind } from "@/lib/policymakers/types";

const SLOGANS = [
  { text: "Bol, ke lab azaad hain tere", source: "Faiz Ahmed Faiz" },
  { text: "Arise, awake, and stop not till the goal is reached", source: "Swami Vivekananda" },
  { text: "Sarfaroshi ki tamanna ab hamare dil mein hai", source: "Bismil Azimabadi" },
  { text: "The people, united, will never be defeated", source: "Movement chant" },
  { text: "Where the mind is without fear and the head is held high", source: "Rabindranath Tagore" },
  { text: "Inquilab Zindabad — long live the revolution", source: "Bhagat Singh" },
];

const MARQUEE = [
  "INQUILAB ZINDABAD",
  "BOL KE LAB AZAAD HAIN TERE",
  "POWER TO THE PEOPLE",
  "ARISE · AWAKE",
  "SARFAROSHI KI TAMANNA",
  "REWRITE THE RULES",
  "THE PEOPLE UNITED",
  "VANDE MATARAM",
];

const STATUS_META: Record<string, { label: string; color: string }> = {
  proposed: { label: "Proposed", color: "#f59e0b" },
  under_review: { label: "Under review", color: "#38bdf8" },
  adopted: { label: "Adopted", color: "#34d399" },
  rejected: { label: "Rejected", color: "#fb7185" },
};

type Filter = "all" | "new" | "modify";

function getVoterToken(): string {
  if (typeof window === "undefined") return "";
  const key = "pm_voter_token";
  let token = window.localStorage.getItem(key);
  if (!token) {
    token =
      (window.crypto?.randomUUID?.() as string) ||
      `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(key, token);
  }
  return token;
}

export default function PolicyMakersClient() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [readonly, setReadonly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [sloganIndex, setSloganIndex] = useState(0);
  const [voter, setVoter] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setVoter(getVoterToken());
  }, []);

  useEffect(() => {
    const t = setInterval(
      () => setSloganIndex((i) => (i + 1) % SLOGANS.length),
      4200,
    );
    return () => clearInterval(t);
  }, []);

  const loadPolicies = useCallback(async (voterToken: string) => {
    try {
      const res = await fetch(
        `/api/policymakers/policies?voter=${encodeURIComponent(voterToken)}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      setPolicies(data.policies ?? []);
      setMyVotes(data.myVotes ?? {});
      setReadonly(Boolean(data.readonly));
    } catch {
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (voter) loadPolicies(voter);
  }, [voter, loadPolicies]);

  const handleVote = useCallback(
    async (policyId: string, value: 1 | -1) => {
      if (readonly) return;
      const prev = myVotes[policyId] ?? 0;
      setPolicies((list) =>
        list.map((p) => {
          if (p.id !== policyId) return p;
          let { upvotes, downvotes } = p;
          if (prev === 1) upvotes -= 1;
          if (prev === -1) downvotes -= 1;
          const next = prev === value ? 0 : value;
          if (next === 1) upvotes += 1;
          if (next === -1) downvotes += 1;
          return { ...p, upvotes, downvotes };
        }),
      );
      setMyVotes((m) => ({ ...m, [policyId]: prev === value ? 0 : value }));

      try {
        const res = await fetch("/api/policymakers/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ policyId, value, voter }),
        });
        const data = await res.json();
        if (res.ok) {
          setPolicies((list) =>
            list.map((p) =>
              p.id === policyId
                ? { ...p, upvotes: data.upvotes, downvotes: data.downvotes }
                : p,
            ),
          );
          setMyVotes((m) => ({ ...m, [policyId]: data.myVote }));
        }
      } catch {
        /* keep optimistic state */
      }
    },
    [readonly, myVotes, voter],
  );

  const filtered = useMemo(
    () => policies.filter((p) => (filter === "all" ? true : p.kind === filter)),
    [policies, filter],
  );

  const counts = useMemo(
    () => ({
      all: policies.length,
      new: policies.filter((p) => p.kind === "new").length,
      modify: policies.filter((p) => p.kind === "modify").length,
    }),
    [policies],
  );

  const totalVotes = useMemo(
    () => policies.reduce((s, p) => s + p.upvotes + p.downvotes, 0),
    [policies],
  );

  return (
    <div className="pm-root">
      <div className="pm-grain" aria-hidden />
      <div className="pm-glow" aria-hidden />
      <Fist className="pm-fist" />

      {/* Marquee banners */}
      <div className="pm-banner pm-banner--top">
        <Ticker items={MARQUEE} />
      </div>

      <header className="pm-header">
        <div className="pm-wrap">
          <Link href="/" className="pm-back">
            <span aria-hidden>←</span> Cool Tools by Kul
          </Link>

          <p className="pm-eyebrow">
            <span className="pm-eyebrow-dot" /> Policy, written by the people
          </p>

          <h1 className="pm-title">
            POLICY<span className="pm-title-accent">MAKERS</span>
          </h1>

          <div className="pm-quote-stage">
            <blockquote key={sloganIndex} className="pm-quote">
              <span className="pm-quote-mark" aria-hidden>
                &ldquo;
              </span>
              {SLOGANS[sloganIndex].text}
              <cite className="pm-quote-cite">
                — {SLOGANS[sloganIndex].source}
              </cite>
            </blockquote>
          </div>

          <p className="pm-lede">
            Don&apos;t just curse the rules — <strong>rewrite them</strong>.
            Float a brand-new policy or a fix to a broken one, show the receipts,
            and let the crowd push it up or strike it down.
          </p>

          <div className="pm-cta-row">
            <button
              onClick={() => setShowForm(true)}
              disabled={readonly}
              className="pm-btn-primary"
            >
              <span aria-hidden className="pm-btn-plus">
                +
              </span>
              Raise a proposal
            </button>

            <div className="pm-stats">
              <Stat
                value={loading ? "—" : String(counts.all)}
                label="on the floor"
              />
              <Stat
                value={loading ? "—" : totalVotes.toLocaleString()}
                label="votes cast"
              />
              <Stat
                value={loading ? "—" : String(counts.modify)}
                label="reforms"
              />
            </div>
          </div>

          {readonly && (
            <p className="pm-preview">
              <strong>Preview mode.</strong> The live ballot box isn&apos;t wired
              up here yet, so voting and new proposals are paused. The cards below
              are the manifesto in waiting.
            </p>
          )}
        </div>
      </header>

      <main className="pm-wrap pm-main">
        <div className="pm-filters">
          {(["all", "new", "modify"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pm-chip ${filter === f ? "pm-chip--on" : ""}`}
            >
              {f === "all"
                ? "Everything"
                : f === "new"
                  ? "New policy"
                  : "Reform"}
              <span className="pm-chip-count">{counts[f]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="pm-list">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pm-skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="pm-empty">
            <p className="pm-empty-title">Nothing on the floor yet.</p>
            <p className="pm-empty-sub">Be the first to put one up.</p>
          </div>
        ) : (
          <div className="pm-list">
            {filtered.map((p, i) => (
              <PolicyCard
                key={p.id}
                index={i + 1}
                policy={p}
                myVote={myVotes[p.id] ?? 0}
                readonly={readonly}
                onVote={handleVote}
              />
            ))}
          </div>
        )}

        <footer className="pm-foot">
          <Fist className="pm-foot-fist" />
          <p>One proposal at a time, the rulebook changes hands.</p>
        </footer>
      </main>

      <div className="pm-banner pm-banner--bottom">
        <Ticker items={MARQUEE} reverse />
      </div>

      {showForm && (
        <ProposalForm
          onClose={() => setShowForm(false)}
          onCreated={(policy) => {
            setPolicies((list) => [policy, ...list]);
            setShowForm(false);
          }}
        />
      )}

      <PMStyles />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="pm-stat">
      <span className="pm-stat-value">{value}</span>
      <span className="pm-stat-label">{label}</span>
    </div>
  );
}

function Ticker({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const row = [...items, ...items];
  return (
    <div className={`pm-ticker ${reverse ? "pm-ticker--rev" : ""}`}>
      {row.map((t, i) => (
        <span className="pm-ticker-item" key={i}>
          {t}
          <span className="pm-ticker-star" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

function Fist({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 96"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <path d="M20 50V18a4 4 0 0 1 8 0v22" />
        <path d="M28 40V14a4 4 0 0 1 8 0v26" />
        <path d="M36 40V18a4 4 0 0 1 8 0v24" />
        <path d="M44 42V24a4 4 0 0 1 8 0v26c0 14-8 24-22 24S20 70 20 56v-6l-7-9a4 4 0 0 1 6-6l5 6" />
      </g>
    </svg>
  );
}

function PolicyCard({
  index,
  policy,
  myVote,
  readonly,
  onVote,
}: {
  index: number;
  policy: Policy;
  myVote: number;
  readonly: boolean;
  onVote: (id: string, value: 1 | -1) => void;
}) {
  const isModify = policy.kind === "modify";
  const score = policy.upvotes - policy.downvotes;
  const total = policy.upvotes + policy.downvotes;
  const forPct = total ? Math.round((policy.upvotes / total) * 100) : 50;
  const status = STATUS_META[policy.status] ?? {
    label: policy.status,
    color: "#94a3b8",
  };
  const accent = isModify ? "#38bdf8" : "#ff7a18";

  return (
    <article
      className="pm-card"
      style={
        {
          "--accent": accent,
          "--status": status.color,
        } as React.CSSProperties
      }
    >
      <span className="pm-card-index" aria-hidden>
        {String(index).padStart(2, "0")}
      </span>

      <div
        className={`pm-stamp ${policy.status === "adopted" ? "pm-stamp--in" : ""}`}
      >
        {status.label}
      </div>

      <div className="pm-card-body">
        <div className="pm-card-tags">
          <span className={`pm-kind ${isModify ? "pm-kind--mod" : "pm-kind--new"}`}>
            {isModify ? "✎ Reform" : "★ New policy"}
          </span>
          {policy.domain && <span className="pm-domain">{policy.domain}</span>}
        </div>

        <h2 className="pm-card-title">{policy.title}</h2>

        <div className="pm-fields">
          {isModify && policy.existing_policy && (
            <FieldBlock label="Existing policy" strike>
              {policy.existing_policy}
            </FieldBlock>
          )}
          {isModify && policy.proposed_change && (
            <FieldBlock label="Proposed change" highlight>
              {policy.proposed_change}
            </FieldBlock>
          )}
          <FieldBlock label={isModify ? "What it changes" : "What we propose"}>
            {policy.proposal}
          </FieldBlock>
          <FieldBlock label="Why it's required">{policy.rationale}</FieldBlock>
          {policy.incidents && (
            <FieldBlock label="Incidents it could've stopped">
              {policy.incidents}
            </FieldBlock>
          )}
          {policy.impact_estimate && (
            <FieldBlock label="Estimated impact">
              {policy.impact_estimate}
            </FieldBlock>
          )}
          {policy.details && (
            <FieldBlock label="Other details">{policy.details}</FieldBlock>
          )}
        </div>

        {/* For vs Against meter */}
        <div className="pm-meter">
          <div className="pm-meter-bar">
            <div className="pm-meter-for" style={{ width: `${forPct}%` }} />
            <div className="pm-meter-mid" style={{ left: `${forPct}%` }} />
          </div>
          <div className="pm-meter-legend">
            <span className="pm-for">▲ {policy.upvotes} for</span>
            <span className="pm-pct">{forPct}% in favour</span>
            <span className="pm-against">{policy.downvotes} against ▼</span>
          </div>
        </div>

        <div className="pm-card-foot">
          <span className="pm-author">
            Raised by <strong>{policy.author_name || "Anonymous"}</strong>
          </span>

          <div className="pm-vote">
            <button
              onClick={() => onVote(policy.id, 1)}
              disabled={readonly}
              aria-label="Vote in favour"
              className={`pm-vote-btn pm-vote-up ${myVote === 1 ? "on" : ""}`}
            >
              ▲ Support
            </button>
            <span
              className={`pm-score ${
                score > 0 ? "pos" : score < 0 ? "neg" : ""
              }`}
            >
              {score > 0 ? `+${score}` : score}
            </span>
            <button
              onClick={() => onVote(policy.id, -1)}
              disabled={readonly}
              aria-label="Vote against"
              className={`pm-vote-btn pm-vote-down ${myVote === -1 ? "on" : ""}`}
            >
              ▼ Oppose
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function FieldBlock({
  label,
  children,
  strike,
  highlight,
}: {
  label: string;
  children: React.ReactNode;
  strike?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`pm-field ${strike ? "pm-field--strike" : ""} ${
        highlight ? "pm-field--hi" : ""
      }`}
    >
      <p className="pm-field-label">{label}</p>
      <p className="pm-field-text">{children}</p>
    </div>
  );
}

function ProposalForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (policy: Policy) => void;
}) {
  const [kind, setKind] = useState<PolicyKind>("new");
  const [form, setForm] = useState({
    title: "",
    domain: "",
    existing_policy: "",
    proposed_change: "",
    proposal: "",
    rationale: "",
    incidents: "",
    impact_estimate: "",
    details: "",
    author_name: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/policymakers/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      onCreated(data.policy as Policy);
    } catch {
      setError("Network error — try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pm-modal" onClick={onClose}>
      <div className="pm-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="pm-sheet-head">
          <div>
            <p className="pm-sheet-kicker">Petition the floor</p>
            <h2 className="pm-sheet-title">Draft your proposal</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="pm-sheet-x">
            ✕
          </button>
        </div>

        <div className="pm-sheet-body">
          <div className="pm-kindpick">
            {(["new", "modify"] as PolicyKind[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`pm-kindbtn ${kind === k ? "on" : ""}`}
              >
                {k === "new" ? "★ New policy" : "✎ Reform existing"}
              </button>
            ))}
          </div>

          <div className="pm-grid2">
            <input
              className="pm-input"
              placeholder="Title *"
              value={form.title}
              onChange={set("title")}
            />
            <input
              className="pm-input"
              placeholder="Domain (e.g. Civil Liberties)"
              value={form.domain}
              onChange={set("domain")}
            />
          </div>

          {kind === "modify" && (
            <>
              <textarea
                className="pm-input"
                rows={2}
                placeholder="Existing policy — what does the current rule say? *"
                value={form.existing_policy}
                onChange={set("existing_policy")}
              />
              <textarea
                className="pm-input"
                rows={2}
                placeholder="Proposed modification — what exactly should change?"
                value={form.proposed_change}
                onChange={set("proposed_change")}
              />
            </>
          )}

          <textarea
            className="pm-input"
            rows={2}
            placeholder={
              kind === "modify"
                ? "What this change accomplishes *"
                : "What we're proposing *"
            }
            value={form.proposal}
            onChange={set("proposal")}
          />
          <textarea
            className="pm-input"
            rows={2}
            placeholder="Why it's required *"
            value={form.rationale}
            onChange={set("rationale")}
          />
          <textarea
            className="pm-input"
            rows={2}
            placeholder="What incidents could this have impacted / prevented?"
            value={form.incidents}
            onChange={set("incidents")}
          />
          <textarea
            className="pm-input"
            rows={2}
            placeholder="Estimated numbers of impact (who / how many)"
            value={form.impact_estimate}
            onChange={set("impact_estimate")}
          />
          <textarea
            className="pm-input"
            rows={2}
            placeholder="Other relevant details"
            value={form.details}
            onChange={set("details")}
          />
          <input
            className="pm-input"
            placeholder="Your name (optional)"
            value={form.author_name}
            onChange={set("author_name")}
          />

          {error && <p className="pm-error">{error}</p>}

          <div className="pm-sheet-foot">
            <button onClick={onClose} className="pm-btn-ghost">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="pm-btn-primary"
            >
              {submitting ? "Filing…" : "File proposal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PMStyles() {
  return (
    <style jsx global>{`
      .pm-root {
        --ink: #0c0a09;
        --paper: #f4ece0;
        --saffron: #ff7a18;
        --red: #e11d2a;
        position: relative;
        min-height: 100vh;
        background:
          radial-gradient(120% 80% at 50% -10%, #2a1206 0%, transparent 55%),
          radial-gradient(90% 70% at 110% 110%, #3a0a0d 0%, transparent 55%),
          var(--ink);
        color: var(--paper);
        font-family: var(--font-outfit), system-ui, sans-serif;
        overflow-x: hidden;
      }
      .pm-grain {
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: 0.05;
        z-index: 1;
        background-image: radial-gradient(#fff 0.5px, transparent 0.5px);
        background-size: 4px 4px;
      }
      .pm-glow {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background: radial-gradient(
          50% 40% at 50% 0%,
          rgba(255, 122, 24, 0.18),
          transparent 70%
        );
      }
      .pm-fist {
        position: fixed;
        right: -2vw;
        top: 16vh;
        width: 46vw;
        max-width: 620px;
        color: var(--red);
        opacity: 0.06;
        z-index: 0;
        pointer-events: none;
        transform: rotate(-8deg);
      }
      .pm-wrap {
        position: relative;
        z-index: 2;
        max-width: 1040px;
        margin: 0 auto;
        padding: 0 20px;
      }

      /* Marquee */
      .pm-banner {
        position: relative;
        z-index: 3;
        background: var(--red);
        color: #fff;
        border-block: 2px solid #000;
        overflow: hidden;
      }
      .pm-banner--top {
        transform: rotate(-1.4deg) scale(1.04);
      }
      .pm-banner--bottom {
        background: var(--ink);
        color: var(--saffron);
        border-color: var(--saffron);
        margin-top: 40px;
        transform: rotate(1deg) scale(1.04);
      }
      .pm-ticker {
        display: inline-flex;
        white-space: nowrap;
        will-change: transform;
        animation: pm-scroll 38s linear infinite;
        padding: 9px 0;
        font-weight: 800;
        letter-spacing: 0.18em;
        font-size: 13px;
      }
      .pm-ticker--rev {
        animation-direction: reverse;
      }
      .pm-ticker-item {
        display: inline-flex;
        align-items: center;
      }
      .pm-ticker-star {
        margin: 0 26px;
        opacity: 0.7;
      }
      @keyframes pm-scroll {
        to {
          transform: translateX(-50%);
        }
      }

      /* Header */
      .pm-header {
        position: relative;
        z-index: 2;
        padding: 22px 0 30px;
      }
      .pm-back {
        display: inline-flex;
        gap: 8px;
        align-items: center;
        font-size: 13px;
        color: rgba(244, 236, 224, 0.55);
        text-decoration: none;
        transition: color 0.2s;
      }
      .pm-back:hover {
        color: var(--saffron);
      }
      .pm-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        margin-top: 26px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: var(--saffron);
      }
      .pm-eyebrow-dot {
        width: 8px;
        height: 8px;
        border-radius: 99px;
        background: var(--saffron);
        box-shadow: 0 0 0 4px rgba(255, 122, 24, 0.2);
        animation: pm-pulse 2s ease-in-out infinite;
      }
      @keyframes pm-pulse {
        50% {
          box-shadow: 0 0 0 8px rgba(255, 122, 24, 0);
        }
      }
      .pm-title {
        margin: 14px 0 0;
        font-family: var(--font-dm-serif-display), serif;
        font-weight: 400;
        font-size: clamp(56px, 13vw, 150px);
        line-height: 0.86;
        letter-spacing: -0.02em;
        text-transform: uppercase;
        color: var(--paper);
        text-shadow: 4px 4px 0 var(--red);
      }
      .pm-title-accent {
        color: var(--saffron);
        -webkit-text-stroke: 2px var(--saffron);
        color: transparent;
        text-shadow: none;
        display: inline-block;
      }
      .pm-quote-stage {
        min-height: 86px;
        margin-top: 26px;
        border-left: 4px solid var(--saffron);
        padding-left: 18px;
      }
      .pm-quote {
        margin: 0;
        font-family: var(--font-dm-serif-display), serif;
        font-size: clamp(20px, 3.6vw, 33px);
        line-height: 1.2;
        color: #ffe8cf;
        animation: pm-rise 0.6s ease;
      }
      .pm-quote-mark {
        color: var(--saffron);
        margin-right: 4px;
      }
      .pm-quote-cite {
        display: block;
        margin-top: 8px;
        font-style: normal;
        font-family: var(--font-outfit), sans-serif;
        font-size: 14px;
        letter-spacing: 0.04em;
        color: rgba(244, 236, 224, 0.55);
      }
      @keyframes pm-rise {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
      }
      .pm-lede {
        max-width: 640px;
        margin-top: 26px;
        font-size: 17px;
        line-height: 1.65;
        color: rgba(244, 236, 224, 0.72);
      }
      .pm-lede strong {
        color: var(--saffron);
      }

      .pm-cta-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 24px;
        margin-top: 30px;
      }
      .pm-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: var(--saffron);
        color: #1a0c02;
        border: 2px solid #1a0c02;
        font-weight: 800;
        font-size: 15px;
        letter-spacing: 0.02em;
        padding: 13px 22px;
        border-radius: 4px;
        cursor: pointer;
        box-shadow: 5px 5px 0 var(--red);
        transition: transform 0.12s, box-shadow 0.12s, background 0.2s;
      }
      .pm-btn-primary:hover {
        transform: translate(-2px, -2px);
        box-shadow: 7px 7px 0 var(--red);
        background: #ff8c33;
      }
      .pm-btn-primary:active {
        transform: translate(2px, 2px);
        box-shadow: 2px 2px 0 var(--red);
      }
      .pm-btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: 3px 3px 0 rgba(225, 29, 42, 0.5);
      }
      .pm-btn-plus {
        font-size: 20px;
        line-height: 1;
      }

      .pm-stats {
        display: flex;
        gap: 26px;
      }
      .pm-stat {
        display: flex;
        flex-direction: column;
      }
      .pm-stat-value {
        font-family: var(--font-dm-serif-display), serif;
        font-size: 30px;
        line-height: 1;
        color: var(--saffron);
      }
      .pm-stat-label {
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: rgba(244, 236, 224, 0.5);
        margin-top: 5px;
      }

      .pm-preview {
        margin-top: 26px;
        max-width: 640px;
        background: rgba(255, 122, 24, 0.08);
        border: 1px dashed rgba(255, 122, 24, 0.4);
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 14px;
        color: rgba(244, 236, 224, 0.75);
      }
      .pm-preview strong {
        color: var(--saffron);
      }

      /* Main */
      .pm-main {
        padding-top: 8px;
        padding-bottom: 8px;
      }
      .pm-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 26px 0 28px;
      }
      .pm-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: transparent;
        color: rgba(244, 236, 224, 0.7);
        border: 1.5px solid rgba(244, 236, 224, 0.2);
        padding: 9px 16px;
        border-radius: 99px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s;
      }
      .pm-chip:hover {
        border-color: rgba(255, 122, 24, 0.6);
      }
      .pm-chip--on {
        background: var(--saffron);
        color: #1a0c02;
        border-color: var(--saffron);
      }
      .pm-chip-count {
        font-size: 12px;
        opacity: 0.7;
      }

      .pm-list {
        display: grid;
        gap: 26px;
      }
      .pm-skeleton {
        height: 280px;
        border-radius: 16px;
        background: linear-gradient(
          100deg,
          rgba(255, 255, 255, 0.04) 30%,
          rgba(255, 255, 255, 0.09) 50%,
          rgba(255, 255, 255, 0.04) 70%
        );
        background-size: 200% 100%;
        animation: pm-shine 1.4s infinite;
      }
      @keyframes pm-shine {
        to {
          background-position: -200% 0;
        }
      }

      /* Card */
      .pm-card {
        position: relative;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.05),
          rgba(255, 255, 255, 0.02)
        );
        border: 1px solid rgba(244, 236, 224, 0.1);
        border-left: 6px solid var(--accent);
        border-radius: 16px;
        overflow: hidden;
        transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
      }
      .pm-card:hover {
        transform: translateY(-3px);
        border-color: rgba(244, 236, 224, 0.22);
        box-shadow: 0 24px 50px -28px rgba(0, 0, 0, 0.9);
      }
      .pm-card-index {
        position: absolute;
        top: 6px;
        right: 18px;
        font-family: var(--font-dm-serif-display), serif;
        font-size: 92px;
        line-height: 1;
        color: rgba(244, 236, 224, 0.05);
        pointer-events: none;
        z-index: 0;
      }
      .pm-stamp {
        position: absolute;
        top: 20px;
        right: 18px;
        z-index: 2;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--status);
        border: 2px solid var(--status);
        border-radius: 6px;
        padding: 4px 10px;
        opacity: 0.85;
      }
      .pm-stamp--in {
        transform: rotate(-9deg);
        border-style: double;
        border-width: 3px;
      }
      .pm-card-body {
        position: relative;
        z-index: 1;
        padding: 24px 26px;
      }
      .pm-card-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
      }
      .pm-kind {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 5px 11px;
        border-radius: 99px;
      }
      .pm-kind--new {
        background: rgba(255, 122, 24, 0.16);
        color: #ffb066;
        border: 1px solid rgba(255, 122, 24, 0.4);
      }
      .pm-kind--mod {
        background: rgba(56, 189, 248, 0.14);
        color: #7dd3fc;
        border: 1px solid rgba(56, 189, 248, 0.4);
      }
      .pm-domain {
        font-size: 12px;
        color: rgba(244, 236, 224, 0.55);
        border: 1px solid rgba(244, 236, 224, 0.18);
        padding: 4px 10px;
        border-radius: 99px;
      }
      .pm-card-title {
        margin: 14px 0 0;
        max-width: 80%;
        font-family: var(--font-dm-serif-display), serif;
        font-weight: 400;
        font-size: clamp(22px, 3vw, 30px);
        line-height: 1.12;
        color: #fff;
      }
      .pm-fields {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 20px;
      }
      .pm-field {
        background: rgba(0, 0, 0, 0.28);
        border: 1px solid rgba(244, 236, 224, 0.08);
        border-radius: 10px;
        padding: 12px 14px;
      }
      .pm-field--strike .pm-field-text {
        text-decoration: line-through;
        text-decoration-color: rgba(251, 113, 133, 0.6);
        opacity: 0.7;
      }
      .pm-field--hi {
        background: rgba(56, 189, 248, 0.08);
        border-color: rgba(56, 189, 248, 0.3);
      }
      .pm-field-label {
        margin: 0 0 5px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent);
      }
      .pm-field-text {
        margin: 0;
        font-size: 14px;
        line-height: 1.55;
        color: rgba(244, 236, 224, 0.85);
      }

      /* Meter */
      .pm-meter {
        margin-top: 20px;
      }
      .pm-meter-bar {
        position: relative;
        height: 10px;
        border-radius: 99px;
        background: rgba(251, 113, 133, 0.35);
        overflow: hidden;
      }
      .pm-meter-for {
        position: absolute;
        inset: 0 auto 0 0;
        background: linear-gradient(90deg, #34d399, #10b981);
        border-radius: 99px;
        transition: width 0.4s ease;
      }
      .pm-meter-mid {
        position: absolute;
        top: -3px;
        bottom: -3px;
        width: 2px;
        background: #fff;
        transform: translateX(-1px);
        transition: left 0.4s ease;
      }
      .pm-meter-legend {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 12px;
        font-weight: 600;
      }
      .pm-for {
        color: #34d399;
      }
      .pm-against {
        color: #fb7185;
      }
      .pm-pct {
        color: rgba(244, 236, 224, 0.5);
      }

      .pm-card-foot {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;
        padding-top: 18px;
        border-top: 1px solid rgba(244, 236, 224, 0.08);
      }
      .pm-author {
        font-size: 13px;
        color: rgba(244, 236, 224, 0.5);
      }
      .pm-author strong {
        color: rgba(244, 236, 224, 0.8);
      }
      .pm-vote {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .pm-vote-btn {
        font-size: 13px;
        font-weight: 700;
        padding: 9px 15px;
        border-radius: 8px;
        cursor: pointer;
        border: 1.5px solid;
        background: transparent;
        transition: all 0.15s;
      }
      .pm-vote-up {
        color: #34d399;
        border-color: rgba(52, 211, 153, 0.4);
      }
      .pm-vote-up:hover:not(:disabled) {
        background: rgba(52, 211, 153, 0.15);
      }
      .pm-vote-up.on {
        background: #10b981;
        color: #052e1b;
        border-color: #10b981;
      }
      .pm-vote-down {
        color: #fb7185;
        border-color: rgba(251, 113, 133, 0.4);
      }
      .pm-vote-down:hover:not(:disabled) {
        background: rgba(251, 113, 133, 0.15);
      }
      .pm-vote-down.on {
        background: #e11d48;
        color: #fff;
        border-color: #e11d48;
      }
      .pm-vote-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .pm-score {
        min-width: 3ch;
        text-align: center;
        font-family: var(--font-dm-serif-display), serif;
        font-size: 22px;
        color: rgba(244, 236, 224, 0.6);
      }
      .pm-score.pos {
        color: #34d399;
      }
      .pm-score.neg {
        color: #fb7185;
      }

      .pm-empty {
        text-align: center;
        padding: 70px 20px;
        border: 1px dashed rgba(244, 236, 224, 0.18);
        border-radius: 16px;
      }
      .pm-empty-title {
        font-family: var(--font-dm-serif-display), serif;
        font-size: 24px;
        margin: 0;
      }
      .pm-empty-sub {
        margin: 6px 0 0;
        color: rgba(244, 236, 224, 0.5);
      }

      .pm-foot {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-top: 56px;
        text-align: center;
        color: rgba(244, 236, 224, 0.45);
        font-size: 14px;
      }
      .pm-foot-fist {
        width: 40px;
        color: var(--saffron);
        opacity: 0.8;
      }

      /* Modal */
      .pm-modal {
        position: fixed;
        inset: 0;
        z-index: 60;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        overflow-y: auto;
        padding: 24px 16px;
        background: rgba(5, 3, 2, 0.78);
        backdrop-filter: blur(6px);
      }
      .pm-sheet {
        position: relative;
        width: 100%;
        max-width: 660px;
        margin: 24px 0;
        background: #15110d;
        border: 1px solid rgba(255, 122, 24, 0.25);
        border-radius: 18px;
        box-shadow: 0 40px 90px -30px #000, 8px 8px 0 var(--red);
      }
      .pm-sheet-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 22px 24px;
        border-bottom: 1px solid rgba(244, 236, 224, 0.1);
      }
      .pm-sheet-kicker {
        margin: 0;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--saffron);
      }
      .pm-sheet-title {
        margin: 6px 0 0;
        font-family: var(--font-dm-serif-display), serif;
        font-weight: 400;
        font-size: 28px;
        color: #fff;
      }
      .pm-sheet-x {
        background: transparent;
        border: 1px solid rgba(244, 236, 224, 0.2);
        color: rgba(244, 236, 224, 0.7);
        width: 34px;
        height: 34px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .pm-sheet-x:hover {
        background: var(--red);
        color: #fff;
        border-color: var(--red);
      }
      .pm-sheet-body {
        padding: 20px 24px 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .pm-kindpick {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .pm-kindbtn {
        padding: 12px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        background: transparent;
        color: rgba(244, 236, 224, 0.7);
        border: 1.5px solid rgba(244, 236, 224, 0.18);
        transition: all 0.15s;
      }
      .pm-kindbtn.on {
        background: var(--saffron);
        color: #1a0c02;
        border-color: var(--saffron);
      }
      .pm-grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .pm-input {
        width: 100%;
        background: rgba(0, 0, 0, 0.35);
        border: 1.5px solid rgba(244, 236, 224, 0.15);
        border-radius: 10px;
        padding: 11px 14px;
        font-size: 14px;
        color: var(--paper);
        font-family: inherit;
        outline: none;
        transition: border-color 0.15s;
        resize: vertical;
      }
      .pm-input::placeholder {
        color: rgba(244, 236, 224, 0.35);
      }
      .pm-input:focus {
        border-color: var(--saffron);
      }
      .pm-error {
        margin: 0;
        background: rgba(225, 29, 42, 0.12);
        border: 1px solid rgba(225, 29, 42, 0.4);
        color: #fda4af;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 14px;
      }
      .pm-sheet-foot {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding-top: 6px;
      }
      .pm-btn-ghost {
        background: transparent;
        border: none;
        color: rgba(244, 236, 224, 0.6);
        font-size: 14px;
        padding: 12px 16px;
        cursor: pointer;
      }
      .pm-btn-ghost:hover {
        color: var(--paper);
      }

      @media (max-width: 640px) {
        .pm-fields {
          grid-template-columns: 1fr;
        }
        .pm-grid2 {
          grid-template-columns: 1fr;
        }
        .pm-card-title {
          max-width: 100%;
        }
        .pm-stamp {
          position: static;
          display: inline-block;
          margin-top: 10px;
        }
        .pm-cta-row {
          gap: 18px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .pm-ticker {
          animation: none;
        }
      }
    `}</style>
  );
}
