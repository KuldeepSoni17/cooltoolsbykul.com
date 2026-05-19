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

type Tab = "overview" | "checker" | "results";

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
