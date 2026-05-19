"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  areIsomorphic,
  quickInvariantsMatch,
} from "@/lib/graph-isomorphism/check";
import { parseAdjacencyMatrix, parseBenchmarkResult } from "@/lib/graph-isomorphism/parser";
import {
  BENCHMARK_STATS,
  EXAMPLE_10_NODES,
  GITHUB_LINKS,
} from "@/lib/graph-isomorphism/samples";

type Tab = "overview" | "checker" | "results" | "proof";

const DEFAULT_MATRIX_A = `0 1 1 1 0
1 0 1 0 1
1 1 0 1 0
1 0 1 0 1
0 1 0 1 0`;

const DEFAULT_MATRIX_B = `0 1 0 1 1
1 0 1 1 0
0 1 0 1 1
1 1 1 0 0
1 0 1 0 0`;

export default function GraphIsoClient() {
  const [tab, setTab] = useState<Tab>("overview");
  const [matrixA, setMatrixA] = useState(DEFAULT_MATRIX_A);
  const [matrixB, setMatrixB] = useState(DEFAULT_MATRIX_B);
  const [checkerError, setCheckerError] = useState<string | null>(null);
  const [checkerResult, setCheckerResult] = useState<string | null>(null);
  const [resultText, setResultText] = useState(EXAMPLE_10_NODES);

  const { parsed, parseError } = useMemo(() => {
    try {
      return { parsed: parseBenchmarkResult(resultText), parseError: null as string | null };
    } catch (e) {
      return {
        parsed: null,
        parseError: e instanceof Error ? e.message : "Invalid format",
      };
    }
  }, [resultText]);

  function runChecker() {
    setCheckerError(null);
    setCheckerResult(null);
    try {
      const a = parseAdjacencyMatrix(matrixA);
      const b = parseAdjacencyMatrix(matrixB);
      if (a.length > 10) {
        setCheckerError(
          "Demo checker supports at most 10 nodes (brute-force). Use the Java solver for larger graphs.",
        );
        return;
      }
      if (!quickInvariantsMatch(a, b)) {
        setCheckerResult("DISSIMILAR — degree or edge counts differ.");
        return;
      }
      const similar = areIsomorphic(a, b);
      setCheckerResult(
        similar
          ? "SIMILAR — graphs are isomorphic."
          : "DISSIMILAR — no bijection preserves adjacency.",
      );
    } catch (e) {
      setCheckerError(e instanceof Error ? e.message : "Could not parse matrices.");
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "checker", label: "Quick checker" },
    { id: "results", label: "Result explorer" },
    { id: "proof", label: "Mathematical proof" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <PageGlow />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.2),transparent_35%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-16">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
          >
            ← cooltoolsbykul.com
          </Link>
          <p className="rounded-full border border-indigo-500/40 bg-indigo-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-200">
            Research · Graph theory
          </p>
        </header>

        <section className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Graph Isomorphism
          </h1>
          <p className="mt-4 text-lg leading-8 text-zinc-300">
            A layered labeling approach to decide whether two graphs are the same up to
            node relabeling — with extensive empirical testing on 470,000+ instances.
          </p>
        </section>

        <nav className="mt-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? "bg-indigo-500 text-white"
                  : "border border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "overview" && (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
              <h2 className="text-xl font-semibold text-white">Layers approach</h2>
              <p className="mt-3 leading-7 text-zinc-300">
                Each node gets a structural label built from neighborhood layers (degree,
                incident edges, internal structure). Labels are compared across two graphs;
                a consistent bijection yields{" "}
                <span className="text-emerald-300">SIMILAR</span>. The Java implementation
                lives in{" "}
                <code className="rounded bg-zinc-800 px-1 text-sm">src/graphiso</code>.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                <li>• Fast reject: node count, edge count, degree histogram</li>
                <li>• Per-node labels via generate_label</li>
                <li>• Tree reconstruction from labels for verification</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
              <h2 className="text-xl font-semibold text-white">Benchmark coverage</h2>
              <ul className="mt-4 space-y-3">
                {BENCHMARK_STATS.map((row) => (
                  <li
                    key={row.range}
                    className="flex items-center justify-between border-b border-zinc-800 pb-2 text-sm"
                  >
                    <span className="text-zinc-300">{row.range}</span>
                    <span className="font-mono text-indigo-200">{row.instances}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-zinc-500">
                Full result files ship in the merged repo under benchmark-results/.
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold text-white">Source repositories</h2>
              <div className="mt-4 flex flex-wrap gap-4">
                <a
                  href={GITHUB_LINKS.layersApproach}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-indigo-200 transition hover:border-indigo-500 hover:bg-indigo-950/40"
                >
                  GraphSimilarity_LayersApproach →
                </a>
                <a
                  href={GITHUB_LINKS.solverResults}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-indigo-200 transition hover:border-indigo-500 hover:bg-indigo-950/40"
                >
                  Graph_Isomorphism_Solver_Result →
                </a>
              </div>
              <p className="mt-4 text-sm text-zinc-500">
                Algorithm publication is planned after formal proof. This page documents the
                method and lets you explore output format and small-graph checks.
              </p>
            </article>
          </section>
        )}

        {tab === "checker" && (
          <section className="mt-8">
            <p className="mb-4 max-w-2xl text-sm text-zinc-400">
              Paste two symmetric 0/1 adjacency matrices (same size, ≤10 nodes). This uses
              brute-force permutation search for the demo — not the production layers solver.
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              <MatrixInput label="Graph A" value={matrixA} onChange={setMatrixA} />
              <MatrixInput label="Graph B" value={matrixB} onChange={setMatrixB} />
            </div>
            <button
              type="button"
              onClick={runChecker}
              className="mt-6 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Check isomorphism
            </button>
            {checkerError && (
              <p className="mt-4 text-sm text-rose-300">{checkerError}</p>
            )}
            {checkerResult && (
              <p
                className={`mt-4 text-lg font-semibold ${
                  checkerResult.startsWith("SIMILAR") ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {checkerResult}
              </p>
            )}
          </section>
        )}

        {tab === "results" && (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-zinc-300">
                Benchmark result file
              </label>
              <textarea
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                rows={18}
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900/90 p-4 font-mono text-xs leading-5 text-zinc-200 focus:border-indigo-500 focus:outline-none"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setResultText(EXAMPLE_10_NODES)}
                className="mt-2 text-sm font-medium text-indigo-300 hover:text-indigo-200"
              >
                Load 10-node example
              </button>
              {parseError && (
                <p className="mt-2 text-sm text-rose-300">{parseError}</p>
              )}
            </div>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
              {parsed ? (
                <>
                  <p className="text-sm text-zinc-400">
                    Nodes: <span className="text-white">{parsed.nodeCount}</span>
                  </p>
                  <p
                    className={`mt-2 text-2xl font-bold ${
                      parsed.verdict === "SIMILAR" ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {parsed.verdict}
                  </p>
                  <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                    Node mapping
                  </h3>
                  <ul className="mt-2 max-h-48 overflow-auto font-mono text-sm">
                    {parsed.mapping.map((m) => (
                      <li key={m.from} className="text-zinc-300">
                        {m.from} → {m.to}
                      </li>
                    ))}
                  </ul>
                  <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                    Permutation
                  </h3>
                  <p className="mt-1 font-mono text-sm text-zinc-300">
                    {parsed.permutation.join(" ")}
                  </p>
                  <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                    Adjacency (preview)
                  </h3>
                  <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-zinc-950 p-3 font-mono text-xs text-zinc-400">
                    {parsed.adjacency.map((row) => row.join(" ")).join("\n")}
                  </pre>
                </>
              ) : (
                <p className="text-zinc-500">Fix the format to see parsed output.</p>
              )}
            </article>
          </section>
        )}

        {tab === "proof" && <ProofSection />}

        <footer className="mt-14 border-t border-zinc-800 pt-6 text-sm text-zinc-500">
          Graph Isomorphism · Layers approach · Kuldeep Soni
        </footer>
      </div>
    </main>
  );
}

function PageGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_40%)]" />
  );
}

function MatrixInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-zinc-300">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900/90 p-4 font-mono text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
        spellCheck={false}
      />
    </div>
  );
}

function Chip({
  children,
  color = "indigo",
}: {
  children: React.ReactNode;
  color?: "indigo" | "emerald" | "amber" | "blue" | "violet" | "rose";
}) {
  const palette: Record<string, string> = {
    indigo: "bg-indigo-950/60 border-indigo-800/50 text-indigo-300",
    emerald: "bg-emerald-950/60 border-emerald-800/50 text-emerald-300",
    amber: "bg-amber-950/60 border-amber-800/50 text-amber-300",
    blue: "bg-blue-950/60 border-blue-800/50 text-blue-300",
    violet: "bg-violet-950/60 border-violet-800/50 text-violet-300",
    rose: "bg-rose-950/60 border-rose-800/50 text-rose-300",
  };
  return (
    <span
      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${palette[color]}`}
    >
      {children}
    </span>
  );
}

function ProofSection() {
  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-2">

      {/* ── 1. Formal Definition ── */}
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 lg:col-span-2">
        <Chip>Definition</Chip>
        <h2 className="mt-3 text-xl font-semibold text-white">Formal Problem Statement</h2>
        <div className="mt-4 rounded-xl border border-zinc-700/50 bg-zinc-950/80 p-5 font-mono text-sm leading-8 text-zinc-200">
          <p>
            <span className="font-bold text-indigo-300">GI</span>: Given undirected graphs
            G&nbsp;=&nbsp;(V,&nbsp;E) and H&nbsp;=&nbsp;(V&prime;,&nbsp;E&prime;) with
            |V|&nbsp;=&nbsp;|V&prime;|&nbsp;=&nbsp;n,
          </p>
          <p className="mt-1">
            decide whether{" "}
            <span className="text-emerald-300">
              &exist;&thinsp;&phi;: V &rarr; V&prime;
            </span>{" "}
            (bijection) such that
          </p>
          <p className="mt-1 border-l-2 border-indigo-700 pl-4">
            &forall;&thinsp;u,&thinsp;v &isin; V:{" "}
            &#123;u,&thinsp;v&#125; &isin; E{" "}
            &hArr;{" "}
            &#123;&phi;(u),&thinsp;&phi;(v)&#125; &isin; E&prime;
          </p>
        </div>
        <p className="mt-4 text-sm leading-7 text-zinc-400">
          &phi; is an <span className="font-medium text-zinc-200">isomorphism</span>;
          G&nbsp;&cong;&nbsp;H if one exists, G&nbsp;&#8775;&nbsp;H otherwise. With n nodes there
          are n! candidate bijections — intractable to enumerate for large n, yet the decision
          problem sits in a surprisingly mild complexity class.
        </p>
      </article>

      {/* ── 2. GI ∈ NP ── */}
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
        <Chip color="emerald">Theorem</Chip>
        <h2 className="mt-3 text-xl font-semibold text-white">GI &isin; NP</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-300">
          A bijection &phi;: V &rarr; V&prime; is a polynomial-time verifiable certificate.
        </p>
        <div className="mt-4 space-y-1 text-sm text-zinc-400">
          <p className="font-semibold text-zinc-300">Verification in O(n&sup2;):</p>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Check |V|&nbsp;=&nbsp;|V&prime;| and &phi; is a valid bijection</li>
            <li>
              For all pairs (u,&thinsp;v): verify
              &#123;u,v&#125;&nbsp;&isin;&nbsp;E &hArr;
              &#123;&phi;(u),&phi;(v)&#125;&nbsp;&isin;&nbsp;E&prime;
            </li>
          </ol>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          This is immediate — GI is unambiguously in NP.
        </p>
      </article>

      {/* ── 3. GI ∈ co-AM ── */}
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
        <Chip color="blue">Theorem</Chip>
        <h2 className="mt-3 text-xl font-semibold text-white">GI &isin; co-AM</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-300">
          The complement GNI (Graph Non-Isomorphism) is in AM via an interactive proof
          (Goldwasser-Sipser 1986):
        </p>
        <div className="mt-3 space-y-1.5 text-sm text-zinc-400">
          <p className="font-semibold text-zinc-300">Protocol (one round):</p>
          <ol className="mt-1 space-y-1 list-decimal list-inside">
            <li>
              Verifier picks b&nbsp;&isin;&nbsp;&#123;0,1&#125; uniformly at random,
              samples random permutation &pi;, sends &pi;(G&#8346;) to Prover
            </li>
            <li>Prover returns a guess b&prime;</li>
            <li>Verifier accepts iff b&prime;&nbsp;=&nbsp;b</li>
          </ol>
          <div className="mt-3 rounded-lg bg-zinc-950/60 p-3 font-mono text-xs space-y-1">
            <p>
              G&nbsp;&cong;&nbsp;H &rArr; Pr[b&prime;&nbsp;=&nbsp;b]&nbsp;=&nbsp;&frac12;{" "}
              <span className="text-zinc-500">// both graphs look identical after &pi;</span>
            </p>
            <p>
              G&nbsp;&#8775;&nbsp;H &rArr; Pr[b&prime;&nbsp;=&nbsp;b]&nbsp;=&nbsp;1{" "}
              <span className="text-zinc-500">// Prover identifies origin graph perfectly</span>
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          &there4; GNI &isin; AM, so GI &isin; co-AM.
        </p>
      </article>

      {/* ── 4. NPC Barrier ── */}
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 lg:col-span-2">
        <Chip color="amber">Key Barrier</Chip>
        <h2 className="mt-3 text-xl font-semibold text-white">
          GI is almost certainly not NP-complete
        </h2>
        <p className="mt-3 text-sm leading-7 text-zinc-300">
          <span className="font-semibold text-white">
            Theorem (Boppana-H&aring;stad-Zachos 1987):
          </span>{" "}
          If GI is NP-complete, then the Polynomial Hierarchy collapses to &Sigma;&#8322;&#7510;.
        </p>
        <div className="mt-4 rounded-xl border border-zinc-700/40 bg-zinc-950/60 p-4 font-mono text-sm text-zinc-300 space-y-1.5">
          <p>
            GI &isin; co-AM{" "}
            <span className="text-zinc-500">// proved above (Goldwasser-Sipser)</span>
          </p>
          <p>
            GI is NP-complete &rArr; NP &sube; co-AM{" "}
            <span className="text-zinc-500">// every NP problem reduces to GI</span>
          </p>
          <p>
            NP &sube; co-AM &rArr; NP = AM = co-AM{" "}
            <span className="text-zinc-500">// NP &sube; AM always holds</span>
          </p>
          <p>
            NP = co-AM &rArr; PH = &Sigma;&#8322;&#7510;{" "}
            <span className="text-zinc-500">// Sch&ouml;ning / BHZ 1987</span>
          </p>
        </div>
        <p className="mt-4 text-sm leading-7 text-zinc-400">
          Collapse of the Polynomial Hierarchy is widely conjectured impossible, placing GI in
          a &ldquo;complexity island&rdquo; between P and NP-complete — analogous to integer
          factoring. This is consistent with Ladner&rsquo;s theorem: if P&nbsp;&ne;&nbsp;NP, then
          NP-intermediate problems must exist, and GI is a natural candidate.
        </p>
      </article>

      {/* ── 5. Babai's Theorem ── */}
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 lg:col-span-2">
        <Chip color="violet">Best Known Algorithm</Chip>
        <h2 className="mt-3 text-xl font-semibold text-white">
          Bab&aacute;i&rsquo;s Quasipolynomial Result (2016)
        </h2>
        <div className="mt-4 rounded-xl border border-indigo-800/40 bg-indigo-950/30 p-5 text-center">
          <p className="font-mono text-xl text-indigo-200">
            GI &isin; DTIME(2<sup>O((log&thinsp;n)&sup3;)</sup>)
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            quasipolynomial time — superpolynomial yet deeply subexponential
          </p>
        </div>
        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-950/40 p-4">
            <p className="font-semibold text-zinc-200">Key idea</p>
            <p className="mt-1 text-zinc-400">
              Reduce GI to <em>string isomorphism</em> over groups with bounded-order generators,
              then recurse using group structure.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-950/40 p-4">
            <p className="font-semibold text-zinc-200">Split-or-Johnson lemma</p>
            <p className="mt-1 text-zinc-400">
              At each recursion, either partition into tractable sub-problems or detect a
              Johnson-scheme structure that admits a canonical form.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-950/40 p-4">
            <p className="font-semibold text-zinc-200">Depth bound</p>
            <p className="mt-1 text-zinc-400">
              t-CR-boundedness of the automorphism group constrains recursion to depth
              O((log&thinsp;n)&sup3;), yielding the quasipolynomial bound.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          Prior best (Bab&aacute;i-Luks 1983): 2<sup>O(&radic;(n&thinsp;log&thinsp;n))</sup>.
          Bab&aacute;i 2016 is exponentially faster. A gap in the original argument was identified
          and corrected by Bab&aacute;i in early 2017; the theorem stands unchanged.
        </p>
      </article>

      {/* ── 6. Special Cases in P ── */}
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
        <Chip color="emerald">Polynomial Cases</Chip>
        <h2 className="mt-3 text-xl font-semibold text-white">Graph Families in P</h2>
        <p className="mt-3 text-sm text-zinc-400">
          GI is polynomial-time decidable on many restricted families:
        </p>
        <ul className="mt-3 space-y-2.5 text-sm">
          {[
            ["O(n log n)", "Trees — Jordan center canonical form"],
            ["O(n log n)", "Planar graphs — Hopcroft-Wong 1974"],
            ["O(n^k)", "Graphs of max degree k — Luks 1982"],
            ["poly", "Bounded tree-width — Bodlaender 1990"],
            ["poly", "Bounded genus — Miller 1980"],
            ["poly", "Interval, chordal, permutation graphs"],
            ["poly", "Partial k-trees (fixed k)"],
          ].map(([complexity, label]) => (
            <li key={label} className="flex gap-3">
              <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-emerald-400">
                {complexity}
              </span>
              <span className="text-zinc-300">{label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-zinc-500">
          Each family uses structural properties that allow pruning n!&thinsp; candidates to
          a polynomial number.
        </p>
      </article>

      {/* ── 7. WL / Layers Limitations ── */}
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
        <Chip color="amber">Completeness Barrier</Chip>
        <h2 className="mt-3 text-xl font-semibold text-white">
          The Layers Approach &amp; Weisfeiler-Leman
        </h2>
        <p className="mt-3 text-sm leading-7 text-zinc-300">
          The layers algorithm builds structural labels from k-hop neighborhoods — equivalent
          to the k-dimensional Weisfeiler-Leman (k-WL) color refinement test.
        </p>
        <div className="mt-4 rounded-xl border border-amber-800/30 bg-amber-950/20 p-4 text-sm">
          <p className="font-semibold text-amber-300">
            Theorem (Cai-F&uuml;rer-Immerman 1992):
          </p>
          <p className="mt-2 text-zinc-300 leading-6">
            For every fixed k&nbsp;&ge;&nbsp;1, there exist non-isomorphic n-node graphs
            of bounded degree that k-WL cannot distinguish. Moreover, no first-order logic
            formula with k variables can separate them.
          </p>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          <span className="text-white font-medium">Consequence:</span> No finite-dimensional WL
          refinement — and no layers-based labeling scheme — is a{" "}
          <span className="text-white">complete</span> decision procedure for GI.
        </p>
        <div className="mt-4 space-y-1 text-sm text-zinc-500">
          <p className="font-medium text-zinc-300">Known hard instances for WL:</p>
          <p>• Strongly regular graphs with identical parameters</p>
          <p>• CFI gadget graphs (lattice-based constructions)</p>
          <p>• Paley graphs of matching orders</p>
          <p>• Miyazaki graphs (adversarial for backtrack solvers)</p>
        </div>
      </article>

      {/* ── 8. Open Problem Status ── */}
      <article className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 p-6 lg:col-span-2">
        <Chip color="rose">Open Problem</Chip>
        <h2 className="mt-3 text-xl font-semibold text-white">Is GI &isin; P?</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-300">
          Whether Graph Isomorphism can be decided in polynomial time is one of the most
          celebrated open problems in theoretical computer science. The full picture as of 2026:
        </p>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
            <p className="font-semibold text-emerald-300">Definitely true</p>
            <ul className="mt-2 space-y-1 text-zinc-400">
              <li>GI &isin; NP</li>
              <li>GI &isin; co-AM</li>
              <li>GI &notin; NPC (unless PH collapses)</li>
              <li>GI &isin; DTIME(2<sup>O((log n)&sup3;)</sup>)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4">
            <p className="font-semibold text-amber-300">Unknown</p>
            <ul className="mt-2 space-y-1 text-zinc-400">
              <li>GI &isin; P ?</li>
              <li>GI &isin; NPC ?</li>
              <li>GI &isin; ZPP ?</li>
              <li>P = NP ? (implies GI &isin; P)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-zinc-700/40 bg-zinc-950/30 p-4">
            <p className="font-semibold text-zinc-300">Believed false</p>
            <ul className="mt-2 space-y-1 text-zinc-400">
              <li>GI is NP-complete</li>
              <li>PH collapses</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-700/50 bg-zinc-950/40 p-5 space-y-4 text-sm leading-7 text-zinc-400">
          <div>
            <p className="font-semibold text-zinc-200">
              What would a proof of GI &isin; P require?
            </p>
            <p className="mt-1">
              A complete polynomial algorithm must handle{" "}
              <em>all</em> graph families, including those that defeat WL refinement (CFI graphs,
              strongly regular graphs). Viable routes are:
            </p>
            <ol className="mt-2 list-decimal list-inside space-y-1">
              <li>
                <span className="text-zinc-300">Group-theoretic pruning</span> — extend
                Bab&aacute;i&rsquo;s approach to eliminate the quasipolynomial overhead
              </li>
              <li>
                <span className="text-zinc-300">New polynomial invariant</span> — find a
                canonical form computable in poly time that separates all non-isomorphic pairs
              </li>
              <li>
                <span className="text-zinc-300">Bounded backtracking</span> — prove that
                backtrack search on the layers-labeled candidate space terminates in poly steps
                on all inputs
              </li>
            </ol>
          </div>
          <div>
            <p className="font-semibold text-zinc-200">
              The layers algorithm&rsquo;s status
            </p>
            <p className="mt-1">
              The layers approach documented here handles 470,000+ benchmark instances correctly.
              However, the CFI theorem establishes that no WL-style local refinement is complete
              for all graphs. A correctness proof for the general case would require either
              (a)&nbsp;demonstrating that the specific label construction goes beyond standard k-WL,
              or (b)&nbsp;combining it with a backtracking phase provably bounded by a polynomial.
              Until such a proof exists, the algorithm is an empirically powerful heuristic, not a
              polynomial-time decision procedure.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-indigo-800/30 bg-indigo-950/20 p-4 text-sm text-zinc-300">
          <span className="font-semibold text-indigo-300">Summary: </span>
          GI sits strictly between P and NP-complete in the complexity landscape — confirmed by
          the co-AM membership and the BHZ collapse theorem. The best proven upper bound is
          Bab&aacute;i&rsquo;s 2<sup>O((log n)&sup3;)</sup> quasipolynomial. Whether this gap to
          P can be closed remains open. A proof in either direction would be a landmark result
          in complexity theory.
        </div>
      </article>

    </section>
  );
}
