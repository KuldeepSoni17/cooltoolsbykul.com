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
  { text: "Inquilab Zindabad — long live the revolution", source: "Bhagat Singh's rallying cry" },
];

const STATUS_STYLES: Record<string, string> = {
  proposed: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  under_review: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  adopted: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  proposed: "Proposed",
  under_review: "Under review",
  adopted: "Adopted",
  rejected: "Rejected",
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
      4500,
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
      // Optimistic update
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
      setMyVotes((m) => ({
        ...m,
        [policyId]: prev === value ? 0 : value,
      }));

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
    () =>
      policies.filter((p) => (filter === "all" ? true : p.kind === filter)),
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.18]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, #ff7a18 0%, transparent 60%), radial-gradient(40% 40% at 100% 100%, #c2410c 0%, transparent 55%)",
        }}
      />

      <header className="relative border-b border-zinc-800/80">
        <div className="mx-auto max-w-5xl px-5 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-amber-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Cool Tools by Kul
          </Link>
        </div>

        <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
          <p className="mb-4 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-300">
            Policy, by the people
          </p>
          <h1
            className="text-balance text-5xl font-normal leading-[1.05] sm:text-6xl"
            style={{ fontFamily: "var(--font-dm-serif-display), serif" }}
          >
            PolicyMakers
          </h1>

          <div className="mt-6 min-h-[4.5rem]">
            <blockquote
              key={sloganIndex}
              className="pm-fade text-2xl font-medium text-amber-100 sm:text-3xl"
              style={{ fontFamily: "var(--font-dm-serif-display), serif" }}
            >
              &ldquo;{SLOGANS[sloganIndex].text}&rdquo;
              <span className="mt-1 block text-sm font-normal not-italic text-zinc-400">
                — {SLOGANS[sloganIndex].source}
              </span>
            </blockquote>
          </div>

          <p className="mt-6 max-w-2xl text-zinc-400">
            Don&apos;t just complain about the rules — rewrite them. Propose a{" "}
            <span className="text-amber-300">new policy</span> or a{" "}
            <span className="text-amber-300">change</span> to an existing one,
            show why it matters, and let the crowd vote it up or down.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowForm(true)}
              disabled={readonly}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Propose a policy
            </button>
            <span className="text-sm text-zinc-500">
              {loading
                ? "Loading proposals…"
                : `${counts.all} proposal${counts.all === 1 ? "" : "s"} on the floor`}
            </span>
          </div>

          {readonly && (
            <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-zinc-400">
              Preview mode — the live database isn&apos;t connected here, so
              voting and new proposals are disabled. Examples below are
              illustrative.
            </p>
          )}
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-5 py-10">
        <div className="mb-7 flex flex-wrap gap-2">
          {(["all", "new", "modify"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                filter === f
                  ? "border-amber-500 bg-amber-500/15 text-amber-200"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {f === "all" ? "All" : f === "new" ? "New policy" : "Modification"}
              <span className="ml-1.5 text-zinc-500">{counts[f]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
            <p className="text-lg text-zinc-300">No proposals here yet.</p>
            <p className="mt-1 text-sm text-zinc-500">
              Be the first to put one on the floor.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filtered.map((p) => (
              <PolicyCard
                key={p.id}
                policy={p}
                myVote={myVotes[p.id] ?? 0}
                readonly={readonly}
                onVote={handleVote}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ProposalForm
          onClose={() => setShowForm(false)}
          onCreated={(policy) => {
            setPolicies((list) => [policy, ...list]);
            setShowForm(false);
          }}
        />
      )}

      <style jsx>{`
        .pm-fade {
          animation: pmFade 0.6s ease;
        }
        @keyframes pmFade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <div className="text-sm leading-relaxed text-zinc-300">{children}</div>
    </div>
  );
}

function PolicyCard({
  policy,
  myVote,
  readonly,
  onVote,
}: {
  policy: Policy;
  myVote: number;
  readonly: boolean;
  onVote: (id: string, value: 1 | -1) => void;
}) {
  const isModify = policy.kind === "modify";
  const score = policy.upvotes - policy.downvotes;

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition hover:border-zinc-700">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:p-6">
        {/* Vote rail */}
        <div className="flex flex-row items-center gap-3 sm:flex-col sm:gap-1.5">
          <button
            onClick={() => onVote(policy.id, 1)}
            disabled={readonly}
            aria-label="Vote in favour"
            className={`rounded-lg border p-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
              myVote === 1
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                : "border-zinc-700 text-zinc-400 hover:border-emerald-600 hover:text-emerald-300"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span
            className={`min-w-[2ch] text-center text-lg font-bold tabular-nums ${
              score > 0
                ? "text-emerald-400"
                : score < 0
                  ? "text-rose-400"
                  : "text-zinc-400"
            }`}
          >
            {score > 0 ? `+${score}` : score}
          </span>
          <button
            onClick={() => onVote(policy.id, -1)}
            disabled={readonly}
            aria-label="Vote against"
            className={`rounded-lg border p-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
              myVote === -1
                ? "border-rose-500 bg-rose-500/20 text-rose-300"
                : "border-zinc-700 text-zinc-400 hover:border-rose-600 hover:text-rose-300"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                isModify
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-300"
              }`}
            >
              {isModify ? "Modify existing" : "New policy"}
            </span>
            {policy.domain && (
              <span className="rounded-md border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                {policy.domain}
              </span>
            )}
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                STATUS_STYLES[policy.status] ??
                "border-zinc-700 text-zinc-400"
              }`}
            >
              {STATUS_LABEL[policy.status] ?? policy.status}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-zinc-50">
            {policy.title}
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {isModify && policy.existing_policy && (
              <Field label="Existing policy">{policy.existing_policy}</Field>
            )}
            {isModify && policy.proposed_change && (
              <Field label="Proposed modification">
                {policy.proposed_change}
              </Field>
            )}
            <Field label={isModify ? "What this changes" : "What we propose"}>
              {policy.proposal}
            </Field>
            <Field label="Why it's required">{policy.rationale}</Field>
            {policy.incidents && (
              <Field label="Incidents it could have impacted">
                {policy.incidents}
              </Field>
            )}
            {policy.impact_estimate && (
              <Field label="Estimated impact">{policy.impact_estimate}</Field>
            )}
            {policy.details && (
              <Field label="Other details">{policy.details}</Field>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
            <span>
              Proposed by{" "}
              <span className="text-zinc-300">
                {policy.author_name || "Anonymous"}
              </span>
            </span>
            <span>
              <span className="text-emerald-400">{policy.upvotes} for</span>
              {" · "}
              <span className="text-rose-400">{policy.downvotes} against</span>
            </span>
          </div>
        </div>
      </div>
    </article>
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

  const inputCls =
    "w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 p-5">
          <h2
            className="text-2xl font-normal"
            style={{ fontFamily: "var(--font-dm-serif-display), serif" }}
          >
            Put a policy on the floor
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2">
            {(["new", "modify"] as PolicyKind[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                  kind === k
                    ? "border-amber-500 bg-amber-500/15 text-amber-200"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {k === "new" ? "New policy" : "Modify existing"}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={inputCls}
              placeholder="Title *"
              value={form.title}
              onChange={set("title")}
            />
            <input
              className={inputCls}
              placeholder="Domain (e.g. Civil Liberties)"
              value={form.domain}
              onChange={set("domain")}
            />
          </div>

          {kind === "modify" && (
            <>
              <textarea
                className={inputCls}
                rows={2}
                placeholder="Existing policy — what does the current rule say? *"
                value={form.existing_policy}
                onChange={set("existing_policy")}
              />
              <textarea
                className={inputCls}
                rows={2}
                placeholder="Proposed modification — what exactly should change?"
                value={form.proposed_change}
                onChange={set("proposed_change")}
              />
            </>
          )}

          <textarea
            className={inputCls}
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
            className={inputCls}
            rows={2}
            placeholder="Why it's required *"
            value={form.rationale}
            onChange={set("rationale")}
          />
          <textarea
            className={inputCls}
            rows={2}
            placeholder="What incidents could this have impacted / prevented?"
            value={form.incidents}
            onChange={set("incidents")}
          />
          <textarea
            className={inputCls}
            rows={2}
            placeholder="Estimated numbers of impact (who / how many)"
            value={form.impact_estimate}
            onChange={set("impact_estimate")}
          />
          <textarea
            className={inputCls}
            rows={2}
            placeholder="Other relevant details"
            value={form.details}
            onChange={set("details")}
          />
          <input
            className={inputCls}
            placeholder="Your name (optional)"
            value={form.author_name}
            onChange={set("author_name")}
          />

          {error && (
            <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition hover:text-zinc-100"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit proposal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
