import type { AssessmentConfig, AssessmentStep, ProfileBand, ResearchPanel } from "./types";

type SimpleQ = {
  prompt: string;
  options: [string, string, string, string];
  subtext?: string;
};

type DomainDef = {
  id: string;
  name: string;
  framing: string;
  questions: SimpleQ[];
};

function interstitial(
  domain: DomainDef,
  n: number,
  total: number,
): AssessmentStep {
  return {
    kind: "interstitial",
    domainId: domain.id,
    domainName: domain.name,
    domainNumber: n,
    totalDomains: total,
    framing: domain.framing,
  };
}

function likert(
  id: string,
  domain: DomainDef,
  n: number,
  q: SimpleQ,
): AssessmentStep {
  const scores: (1 | 2 | 3 | 4)[] = [4, 3, 2, 1];
  return {
    kind: "question",
    id,
    type: "likert",
    domainId: domain.id,
    domainName: domain.name,
    domainNumber: n,
    prompt: q.prompt,
    subtext: q.subtext,
    options: q.options.map((label, i) => ({ label, score: scores[i] })),
  };
}

export function buildAssessment(params: {
  id: string;
  title: string;
  storageKey: string;
  accent: string;
  domains: DomainDef[];
  profiles: ProfileBand[];
  research: ResearchPanel[];
}): AssessmentConfig {
  const steps: AssessmentStep[] = [];
  const total = params.domains.length;
  params.domains.forEach((domain, di) => {
    const num = di + 1;
    steps.push(interstitial(domain, num, total));
    domain.questions.forEach((q, qi) => {
      steps.push(likert(`${domain.id}-q${qi + 1}`, domain, num, q));
    });
  });
  return {
    id: params.id,
    title: params.title,
    storageKey: params.storageKey,
    totalDomains: total,
    steps,
    profiles: params.profiles,
    research: params.research,
    theme: {
      accent: params.accent,
      accentLight: params.accent,
      accentDim: "#3d3026",
    },
  };
}

export const DEFAULT_PROFILES: ProfileBand[] = [
  {
    id: "builder",
    name: "The Builder",
    oneLiner: "Strong foundation — focus on sequencing.",
    guidance: "You have done substantial preparation. Choose timing and support structures deliberately.",
  },
  {
    id: "almost",
    name: "The Almost",
    oneLiner: "Real readiness with specific gaps.",
    guidance: "Target the lowest domains in the next 90 days — one step at a time.",
  },
  {
    id: "unfinished",
    name: "The Unfinished",
    oneLiner: "A starting point, not a verdict.",
    guidance: "Use growth areas as a practical roadmap rather than a reason to rush or retreat.",
  },
];
