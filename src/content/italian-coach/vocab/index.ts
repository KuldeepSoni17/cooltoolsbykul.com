export { pronouns } from "./pronouns";
export { verbs } from "./verbs";
export { nouns } from "./nouns";
export { adjectives, timeWords, connectors } from "./other";

import { pronouns } from "./pronouns";
import { verbs } from "./verbs";
import { nouns } from "./nouns";
import { adjectives, timeWords, connectors } from "./other";

/** Catalogue size summary for UI */
export const vocabStats = {
  pronouns: pronouns.length,
  verbs: verbs.length,
  nouns: nouns.length,
  adjectives: adjectives.length,
  timeWords: timeWords.length,
  connectors: connectors.length,
  verbForms: verbs.length * 6,
  totalAtoms:
    pronouns.length +
    verbs.length * 6 +
    nouns.length +
    adjectives.length +
    timeWords.length +
    connectors.length +
    7, // articles
};
