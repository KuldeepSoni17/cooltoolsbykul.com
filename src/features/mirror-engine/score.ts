import type {
  AnswerValue,
  AssessmentConfig,
  AssessmentResults,
  AssessmentStep,
  DomainResult,
  LeverageMove,
  ProfileBand,
  ScoreBand,
} from "./types";

function isQuestion(
  step: AssessmentStep,
): step is Extract<AssessmentStep, { kind: "question" }> {
  return step.kind === "question";
}

export function scoreFromSpectrum(value: number): 1 | 2 | 3 | 4 {
  if (value <= 25) return 1;
  if (value <= 50) return 2;
  if (value <= 75) return 3;
  return 4;
}

export function scoreFromMultiSelect(
  selectedWeights: number[],
): 1 | 2 | 3 | 4 {
  const total = selectedWeights.reduce((a, b) => a + b, 0);
  if (total <= 2) return 4;
  if (total <= 5) return 3;
  if (total <= 8) return 2;
  return 1;
}

export function getQuestionScore(
  step: Extract<AssessmentStep, { kind: "question" }>,
  answer: AnswerValue | undefined,
): number | null {
  if (!answer || answer.type === "skipped" || answer.type === "reflection") {
    return null;
  }

  if (step.type === "reflection") return null;

  if (step.type === "spectrum" && answer.type === "spectrum") {
    return scoreFromSpectrum(answer.value);
  }

  if (step.type === "multiselect" && answer.type === "multiselect") {
    const weights = answer.indices.map((i) => step.options[i]?.weight ?? 0);
    return scoreFromMultiSelect(weights);
  }

  if (
    (step.type === "likert" || step.type === "scenario") &&
    answer.type === "choice"
  ) {
    const options = step.type === "likert" ? step.options : step.vignettes;
    const opt = options[answer.index];
    if (!opt) return null;
    if (step.type === "likert" && step.reverseCoded) {
      return 5 - opt.score;
    }
    return opt.score;
  }

  return null;
}

export function labelFromPercent(percent: number): ScoreBand {
  if (percent >= 85) return "Strong";
  if (percent >= 65) return "Growing";
  if (percent >= 45) return "Developing";
  return "Needs attention";
}

export function computeResults(
  config: AssessmentConfig,
  answers: Record<string, AnswerValue>,
): AssessmentResults {
  const domainTotals = new Map<
    string,
    { domainName: string; total: number; max: number }
  >();
  const flags: string[] = [];
  const questionScores: { id: string; prompt: string; domainName: string; score: number; max: number }[] =
    [];

  for (const step of config.steps) {
    if (!isQuestion(step) || step.type === "reflection") continue;
    const answer = answers[step.id];
    const score = getQuestionScore(step, answer);
    if (score === null) continue;

    const existing = domainTotals.get(step.domainId) ?? {
      domainName: step.domainName,
      total: 0,
      max: 0,
    };
    domainTotals.set(step.domainId, {
      domainName: step.domainName,
      total: existing.total + score,
      max: existing.max + 4,
    });

    if (
      (step.type === "likert" || step.type === "scenario") &&
      answer?.type === "choice"
    ) {
      const options = step.type === "likert" ? step.options : step.vignettes;
      const opt = options[answer.index];
      if (opt?.flag) flags.push(opt.flag);
    }

    if (step.type === "spectrum" && answer?.type === "spectrum") {
      if (step.flagBelow && answer.value < step.flagBelow) {
        flags.push("motivation-audit-low");
      }
    }

    questionScores.push({
      id: step.id,
      prompt: step.prompt,
      domainName: step.domainName,
      score,
      max: 4,
    });
  }

  const domains: DomainResult[] = Array.from(domainTotals.entries()).map(
    ([domainId, { domainName, total, max }]) => {
      const percent = Math.round((total / max) * 100);
      return {
        domainId,
        domainName,
        percent,
        label: labelFromPercent(percent),
      };
    },
  );

  const profile = pickProfile(config.profiles, domains, flags);
  const leverage = computeLeverage(questionScores);
  const reflections: Record<string, string> = {};
  for (const step of config.steps) {
    if (step.kind !== "question" || step.type !== "reflection") continue;
    const a = answers[step.id];
    if (a?.type === "reflection" && a.text.trim()) {
      reflections[step.id] = a.text;
    }
  }

  return {
    domains,
    profile,
    flags,
    leverage,
    reflections,
    completedAt: new Date().toISOString(),
  };
}

function pickProfile(
  profiles: ProfileBand[],
  domains: DomainResult[],
  flags: string[],
): ProfileBand {
  const overall =
    domains.length > 0
      ? Math.round(
          domains.reduce((s, d) => s + d.percent, 0) / domains.length,
        )
      : 0;
  const min = domains.length ? Math.min(...domains.map((d) => d.percent)) : 0;
  const childhood = domains.find((d) => d.domainId === "childhood");
  const variance =
    domains.length > 1
      ? Math.max(...domains.map((d) => d.percent)) -
        Math.min(...domains.map((d) => d.percent))
      : 0;

  if (flags.includes("motivation-audit-low") && variance > 35) {
    return profiles.find((p) => p.id === "avoider") ?? profiles[0];
  }
  if (childhood && childhood.percent >= 75 && overall >= 55) {
    return profiles.find((p) => p.id === "examined") ?? profiles[0];
  }
  if (overall >= 80 && min >= 70) {
    return profiles.find((p) => p.id === "builder") ?? profiles[0];
  }
  if (overall >= 60 && overall <= 75 && domains.some((d) => d.percent < 45)) {
    return profiles.find((p) => p.id === "almost") ?? profiles[0];
  }
  if (overall < 60) {
    return profiles.find((p) => p.id === "unfinished") ?? profiles[0];
  }
  return profiles.find((p) => p.id === "almost") ?? profiles[0];
}

function computeLeverage(
  questionScores: {
    id: string;
    prompt: string;
    domainName: string;
    score: number;
    max: number;
  }[],
): LeverageMove[] {
  const moves = questionScores
    .map((q) => {
      const headroom = 4 - q.score;
      if (headroom <= 0) return null;
      return {
        questionId: q.id,
        prompt: q.prompt,
        domainName: q.domainName,
        suggestion: `Shifting this answer one level could meaningfully strengthen your ${q.domainName} readiness.`,
        impact: headroom,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);

  return moves.map(({ questionId, prompt, domainName, suggestion }) => ({
    questionId,
    prompt,
    domainName,
    suggestion,
  }));
}

export function bandColor(label: ScoreBand): string {
  switch (label) {
    case "Strong":
      return "#7EAF8A";
    case "Growing":
      return "#C8A97E";
    case "Developing":
      return "rgba(200,169,126,0.55)";
    default:
      return "#C97E7E";
  }
}
