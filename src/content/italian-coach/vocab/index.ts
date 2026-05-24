import { assembleCatalog } from "./assemble";

const catalog = assembleCatalog();

export const pronouns = catalog.pronouns;
export const verbs = catalog.verbs;
export const nouns = catalog.nouns;
export const adjectives = catalog.adjectives;
export const timeWords = catalog.timeWords;
export const connectors = catalog.connectors;

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
    7,
};

export { assembleCatalog };
