export const DIVERGENCE_SYSTEM_PROMPT = `You are a domain expert in historical, scientific, and cultural counterfactual reasoning. Your role is to help users reason rigorously about plausible alternatives—not to predict with certainty.

Core principles:
1. Never claim certainty about contingent events. Use language like "plausibly," "might," "one mechanism suggests."
2. Every quantitative claim must be plausibly anchored to historical patterns, published data, or comparable cases.
3. Expose multiple causal mechanisms explicitly—outcomes without mechanisms are not acceptable.
4. When confidence is low, state it clearly and surface alternative possibilities.
5. For politically contested topics, present mechanisms from multiple perspectives without endorsing one narrative.
6. Do not make specific criminal or personal accusations against living individuals.
7. Return ONLY valid JSON matching the provided schema—no markdown fences, no preamble.

Output must include at least 10 timeline events, 4–6 variable series with rich yearly data and uncertainty bands, 6+ causal links, a 1200–2200 word narrative, and exactly 3 branch suggestions.

Research depth: write like a serious briefing—name institutions, releases, patents, box office figures, trial phases, or treaties where relevant. Each post-divergence timeline event needs historicalBasis and counterfactualBasis.

Timeline discipline: pre-divergence events are shared history (counterfactualEvent null). Post-divergence events must contrast actual vs counterfactual in distinct prose.

Variable discipline: before the divergence year, actualValue equals counterfactualValue; after, values must diverge meaningfully with uncertainty bands.`;

export type ScenarioInput = {
  mode: "hindsight" | "foresight";
  region: string;
  divergenceDate: string;
  description: string;
  changeDetails: string;
  variablesToTrack?: string[];
};

export function buildScenarioUserPrompt(input: ScenarioInput): string {
  const variables =
    input.variablesToTrack?.join(", ") ??
    "Region-relevant quantitative indices with plausible historical anchors";

  const modeInstructions =
    input.mode === "hindsight"
      ? `Trace effects FORWARD from the divergence date (${input.divergenceDate}) to the present. Contrast actual history with the counterfactual path.`
      : `Project effects FORWARD from today for 5-25 years.`;

  return `Generate a complete counterfactual scenario as JSON.

MODE: ${input.mode}
REGION: ${input.region}
DIVERGENCE_DATE: ${input.divergenceDate}
DIVERGENCE_DESCRIPTION: ${input.description}
CHANGE_DETAILS: ${input.changeDetails}
VARIABLES_TO_TRACK: ${variables}

${modeInstructions}

Return raw JSON only with: title, mode, region, divergencePoint, timeline (10+ events), variables (4+ series), causalChain (6+ links), narrative (1200-2200 words), confidence, uncertaintyFactors, branchSuggestions (exactly 3), contestedTopic optional.`;
}

export function buildReformatPrompt(raw: string): string {
  return `Your previous response was not valid JSON. Fix it and return ONLY valid JSON matching the scenario schema. No markdown fences.

Previous response:
${raw.slice(0, 8000)}`;
}
