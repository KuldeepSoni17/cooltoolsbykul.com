export const DIVERGENCE_SYSTEM_PROMPT = `You are an expert in historical, scientific, and cultural counterfactual reasoning. Return ONLY valid JSON—no markdown fences, no preamble.

Rules:
- Use cautious language ("plausibly", "might"). Name real institutions, dates, and orders of magnitude where relevant.
- Pre-divergence timeline: counterfactualEvent must be null; include historicalBasis.
- Post-divergence: actualEvent and counterfactualEvent must differ; include historicalBasis and counterfactualBasis (one sentence each).
- Variables: shared values before divergence year; diverging values after with lower/upper bounds.
- Keep the narrative dense and analytical (600–900 words), not bloated.`;

export type ScenarioInput = {
  mode: "hindsight" | "foresight";
  region: string;
  divergenceDate: string;
  description: string;
  changeDetails: string;
  variablesToTrack?: string[];
};

export function buildScenarioUserPrompt(input: ScenarioInput): string {
  const variables = (input.variablesToTrack ?? []).slice(0, 4).join(", ") ||
    "GDP growth, political stability, and two region-relevant indices";

  return `Generate counterfactual scenario JSON.

MODE: ${input.mode}
REGION: ${input.region}
DIVERGENCE_DATE: ${input.divergenceDate}
DESCRIPTION: ${input.description}
CHANGE_DETAILS: ${input.changeDetails}
TRACK_EXACTLY_4_VARIABLES: ${variables}

Required JSON shape:
- title, mode, region
- divergencePoint: { date, description, type: "event"|"decision"|"variable_change", changeDetails }
- timeline: exactly 8 events from 5 years before divergence to present (or near-present)
- variables: exactly 4 series, each with 6-8 yearly dataPoints (actualValue, counterfactualValue, counterfactualLowerBound, counterfactualUpperBound, confidence)
- causalChain: 5 links { id, cause, effect, mechanism, confidence, dependsOn[] }
- narrative: 600-900 words, multiple paragraphs
- confidence, uncertaintyFactors (3-5), branchSuggestions (exactly 3 strings)
- contestedTopic: optional boolean

Return compact JSON only. No commentary outside JSON.`;
}

export function buildReformatPrompt(raw: string): string {
  return `Return ONLY valid JSON for the scenario schema. No markdown.

Broken output:
${raw.slice(0, 4000)}`;
}
