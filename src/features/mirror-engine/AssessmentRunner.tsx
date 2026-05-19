"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AnswerValue,
  AssessmentConfig,
  AssessmentStep,
} from "./types";
import { computeResults } from "./score";
import { saveResultHistory } from "./history";
import {
  clearProgress,
  loadProgress,
  saveProgress,
  saveResults,
} from "./persistence";

function isQuestion(
  step: AssessmentStep,
): step is Extract<AssessmentStep, { kind: "question" }> {
  return step.kind === "question";
}

function canContinue(
  step: AssessmentStep,
  answers: Record<string, AnswerValue>,
): boolean {
  if (step.kind === "interstitial" || step.kind === "explainer") return true;
  const a = answers[step.id];
  if (step.type === "reflection") {
    return Boolean(a && (a.type === "reflection" || a.type === "skipped"));
  }
  if (step.type === "multiselect") {
    return a?.type === "multiselect" && a.indices.length > 0;
  }
  if (step.type === "spectrum") {
    return a?.type === "spectrum";
  }
  return a?.type === "choice";
}

function scoredQuestionCount(steps: AssessmentStep[]): number {
  return steps.filter(
    (s) => isQuestion(s) && s.type !== "reflection",
  ).length;
}

function answeredScoredCount(
  steps: AssessmentStep[],
  answers: Record<string, AnswerValue>,
): number {
  return steps.filter((s) => {
    if (!isQuestion(s) || s.type === "reflection") return false;
    return canContinue(s, answers);
  }).length;
}

type Props = {
  config: AssessmentConfig;
  resultsPath: string;
};

export function AssessmentRunner({ config, resultsPath }: Props) {
  const router = useRouter();
  const progressKey = `${config.storageKey}-progress`;
  const resultsKey = `${config.storageKey}-results`;

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [spectrumValue, setSpectrumValue] = useState(50);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("fresh") === "1") {
      clearProgress(progressKey);
    } else {
      const saved = loadProgress(progressKey);
      if (saved) {
        setStepIndex(saved.stepIndex);
        setAnswers(saved.answers);
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage once on mount
    setHydrated(true);
  }, [progressKey]);

  useEffect(() => {
    if (!hydrated) return;
    saveProgress(progressKey, {
      stepIndex,
      answers,
      updatedAt: new Date().toISOString(),
    });
  }, [hydrated, stepIndex, answers, progressKey]);

  const step = config.steps[stepIndex];
  const totalScored = scoredQuestionCount(config.steps);
  const answered = answeredScoredCount(config.steps, answers);
  const progressPct = Math.round((answered / totalScored) * 100);

  const questionNumber = useMemo(() => {
    let n = 0;
    for (let i = 0; i <= stepIndex; i++) {
      const s = config.steps[i];
      if (isQuestion(s) && s.type !== "reflection") n++;
    }
    return n;
  }, [config.steps, stepIndex]);

  const setAnswer = useCallback((id: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const goNext = () => {
    if (stepIndex >= config.steps.length - 1) {
      const results = computeResults(config, answers);
      saveResults(resultsKey, results);
      saveResultHistory(config.storageKey, results);
      clearProgress(progressKey);
      router.push(resultsPath);
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  if (!hydrated || !step) {
    return (
      <div className="mirror-root flex min-h-[50vh] items-center justify-center">
        <p className="text-[var(--mirror-text-secondary)]">Loading…</p>
      </div>
    );
  }

  const continueEnabled = canContinue(step, answers);
  const isLast = stepIndex === config.steps.length - 1;

  return (
    <div className="mirror-root mirror-grain relative flex min-h-screen flex-col">
      <div className="mirror-progress">
        <div
          className="mirror-progress-fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pb-32 pt-16 sm:px-10">
        {step.kind === "interstitial" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="mirror-eyebrow text-[var(--mirror-text-muted)]">
              Domain {step.domainNumber} of {step.totalDomains}
            </p>
            <h2
              className="mt-6 text-4xl font-bold sm:text-5xl"
              style={{ fontFamily: "var(--mirror-font-display)" }}
            >
              {step.domainName}
            </h2>
            <div className="mx-auto mt-8 h-px w-16 bg-[var(--mirror-accent)]" />
            <p className="mt-8 max-w-lg text-lg font-light text-[var(--mirror-text-secondary)]">
              {step.framing}
            </p>
          </div>
        )}

        {step.kind === "explainer" && (
          <div className="flex flex-1 flex-col justify-center">
            <article className="rounded-2xl border border-[var(--mirror-border)] bg-[var(--mirror-surface)] p-8">
              <h2 className="text-xl font-semibold">{step.title}</h2>
              <pre className="mt-4 whitespace-pre-wrap font-sans text-sm font-light leading-7 text-[var(--mirror-text-secondary)]">
                {step.body}
              </pre>
            </article>
          </div>
        )}

        {isQuestion(step) && (
          <div className="relative flex flex-1 flex-col">
            <p className="mirror-eyebrow">
              {step.domainName} —{" "}
              {step.type === "reflection"
                ? "Reflection"
                : `Question ${questionNumber} of ${totalScored}`}
            </p>
            <div className="relative mt-8 flex-1">
              <span className="mirror-num-bg">{questionNumber || ""}</span>
              <h1 className="mirror-question relative">{step.prompt}</h1>
              {step.subtext && (
                <p className="mt-4 max-w-xl text-sm font-light italic text-[var(--mirror-text-secondary)]">
                  {step.subtext}
                </p>
              )}

              {step.type === "likert" && (
                <div className="relative mt-8 grid gap-2.5">
                  {step.options.map((opt, i) => {
                    const a = answers[step.id];
                    const active = a?.type === "choice" && a.index === i;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() =>
                          setAnswer(step.id, { type: "choice", index: i })
                        }
                        className={`flex items-start gap-4 rounded-lg border px-5 py-4 text-left transition-colors ${
                          active
                            ? "border-[var(--mirror-accent)] bg-[var(--mirror-accent-dim)] text-[var(--mirror-text)]"
                            : "border-[var(--mirror-border)] bg-transparent text-[var(--mirror-text-secondary)] hover:border-[var(--mirror-accent)]/40 hover:bg-[var(--mirror-surface-2)]"
                        }`}
                      >
                        <span
                          className={`mt-1 h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] ${
                            active
                              ? "border-[var(--mirror-accent)] bg-[var(--mirror-accent)]"
                              : "border-[var(--mirror-text-muted)]"
                          }`}
                        />
                        <span className="text-base leading-relaxed">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {step.type === "scenario" && (
                <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
                  {step.vignettes.map((v, i) => {
                    const a = answers[step.id];
                    const active = a?.type === "choice" && a.index === i;
                    const letter = String.fromCharCode(65 + i);
                    return (
                      <button
                        key={v.label}
                        type="button"
                        onClick={() =>
                          setAnswer(step.id, { type: "choice", index: i })
                        }
                        className={`min-h-[140px] rounded-lg border p-6 text-left transition-all ${
                          active
                            ? "border-t-[3px] border-t-[var(--mirror-accent)] border-[var(--mirror-border)] bg-[var(--mirror-accent-dim)]"
                            : "border-[var(--mirror-border)] hover:shadow-lg"
                        }`}
                      >
                        <span className="font-mono text-xs text-[var(--mirror-text-muted)]">
                          {letter}
                        </span>
                        <p className="mt-3 text-[15px] leading-relaxed text-[var(--mirror-text-secondary)]">
                          {v.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {step.type === "spectrum" && (
                <div className="relative mt-10">
                  <div className="mb-3 flex justify-between text-sm font-medium text-[var(--mirror-text-secondary)]">
                    <span>{step.leftLabel}</span>
                    <span>{step.rightLabel}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={
                      (() => {
                        const a = answers[step.id];
                        return a?.type === "spectrum" ? a.value : spectrumValue;
                      })()
                    }
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSpectrumValue(v);
                      setAnswer(step.id, { type: "spectrum", value: v });
                    }}
                    className="h-1 w-full cursor-pointer appearance-none rounded bg-[var(--mirror-border)] accent-[var(--mirror-accent)]"
                  />
                  <p className="mt-4 text-center font-mono text-xs text-[var(--mirror-accent)]">
                    {(() => {
                      const a = answers[step.id];
                      return a?.type === "spectrum" ? a.value : spectrumValue;
                    })()}
                    /100
                  </p>
                </div>
              )}

              {step.type === "multiselect" && (
                <div className="relative mt-8 grid gap-2.5">
                  <p className="text-sm font-light italic text-[var(--mirror-text-muted)]">
                    Select everything that applies.
                  </p>
                  {step.options.map((opt, i) => {
                    const multiAnswer = answers[step.id];
                    const selected =
                      multiAnswer?.type === "multiselect"
                        ? multiAnswer.indices.includes(i)
                        : false;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          const existing = answers[step.id];
                          const current =
                            existing?.type === "multiselect"
                              ? [...existing.indices]
                              : [];
                          const next = current.includes(i)
                            ? current.filter((x) => x !== i)
                            : [...current, i];
                          setAnswer(step.id, {
                            type: "multiselect",
                            indices: next,
                          });
                        }}
                        className={`flex items-start gap-4 rounded-lg border px-5 py-4 text-left ${
                          selected
                            ? "border-[var(--mirror-accent)] bg-[var(--mirror-accent-dim)]"
                            : "border-[var(--mirror-border)]"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs ${
                            selected
                              ? "border-[var(--mirror-accent)] bg-[var(--mirror-accent)] text-[#0e0e0e]"
                              : "border-[var(--mirror-text-muted)]"
                          }`}
                        >
                          {selected ? "✓" : ""}
                        </span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {step.type === "reflection" && (
                <div className="relative mt-8">
                  <textarea
                    value={
                      (() => {
                        const a = answers[step.id];
                        return a?.type === "reflection" ? a.text : "";
                      })()
                    }
                    onChange={(e) =>
                      setAnswer(step.id, {
                        type: "reflection",
                        text: e.target.value,
                      })
                    }
                    placeholder={step.placeholder}
                    className="min-h-[120px] w-full resize-y rounded-lg border border-[var(--mirror-border)] bg-[var(--mirror-surface)] p-4 text-base text-[var(--mirror-text)] outline-none focus:border-[var(--mirror-accent)]/50 focus:ring-2 focus:ring-[var(--mirror-accent)]/10"
                  />
                  <p className="mt-3 text-xs font-light italic text-[var(--mirror-text-muted)]">
                    This question is not scored. Your response stays on this device only — we never see it.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAnswer(step.id, { type: "skipped" })}
                    className="mt-2 text-sm text-[var(--mirror-text-muted)] hover:text-[var(--mirror-text-secondary)]"
                  >
                    Skip this question →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[var(--mirror-bg)] via-[var(--mirror-bg)]/90 to-transparent px-6 pb-8 pt-12 sm:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            className="text-sm font-medium text-[var(--mirror-text-muted)] disabled:opacity-40"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!continueEnabled}
            className="rounded-full px-8 py-3.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:border disabled:border-[var(--mirror-border)] disabled:bg-[var(--mirror-surface-2)] disabled:text-[var(--mirror-text-muted)] enabled:bg-[var(--mirror-accent)] enabled:text-[#0e0e0e] enabled:hover:bg-[var(--mirror-accent-light)]"
          >
            {isLast ? "See my results →" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
