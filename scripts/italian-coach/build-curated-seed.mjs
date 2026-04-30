import { mkdir, readFile, writeFile } from "node:fs/promises";

const RAW_DIR = new URL("../../data/italian-coach/raw/", import.meta.url);
const CURATED_DIR = new URL("../../data/italian-coach/curated/", import.meta.url);

async function readJson(fileName) {
  const text = await readFile(new URL(fileName, RAW_DIR), "utf8");
  return JSON.parse(text);
}

function dedupeBy(list, keyFn) {
  const seen = new Set();
  return list.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function scoreSentence(italian, english) {
  const sizePenalty = italian.length > 120 ? 0.1 : 0;
  const hasPunctuationBonus = /[.!?]$/.test(italian) ? 0.05 : 0;
  const base = 0.65;
  return Math.max(0.4, Math.min(0.95, base - sizePenalty + hasPunctuationBonus + (english ? 0.05 : 0)));
}

async function main() {
  await mkdir(CURATED_DIR, { recursive: true });

  const [tatoeba, frequency, ud, wiktionary] = await Promise.all([
    readJson("tatoeba.sample.json"),
    readJson("frequency.sample.json"),
    readJson("ud.sample.json"),
    readJson("wiktionary.sample.json"),
  ]);

  const curatedSentences = dedupeBy(
    tatoeba
      .filter((row) => row.italian && row.english)
      .map((row) => ({
        italian: row.italian.trim(),
        english: row.english.trim(),
        source: row.source ?? "unknown",
        difficulty:
          row.italian.length < 35 ? "beginner" : row.italian.length < 70 ? "intermediate" : "advanced",
        quality_score: scoreSentence(row.italian, row.english),
      }))
      .filter((row) => row.italian.split(" ").length >= 2),
    (row) => `${row.italian.toLowerCase()}|${row.english.toLowerCase()}`,
  );

  const lexicon = dedupeBy(
    frequency.map((row) => {
      const wiki = wiktionary.find((entry) => entry.word === row.word);
      return {
        word: row.word,
        lemma: row.word,
        translation: wiki?.senses?.[0] ?? null,
        frequency_rank: row.rank,
        gender: null,
        plural_form: null,
        source: `freq:${row.source}`,
      };
    }),
    (row) => row.word,
  );

  const grammarSignals = ud.slice(0, 120).map((entry, index) => ({
    id: index + 1,
    sentence: entry.sentence,
    has_article_agreement: entry.tokens.some(
      (token) => token.pos === "DET" && token.feats?.includes("Gender="),
    ),
    has_plural_markers: entry.tokens.some((token) => token.feats?.includes("Number=Plur")),
    has_verb_tense: entry.tokens.some((token) => token.pos === "VERB" && token.feats?.includes("Tense=")),
    source: entry.source,
  }));

  const payload = {
    generated_at: new Date().toISOString(),
    example_sentences: curatedSentences.slice(0, 250),
    vocabulary: lexicon.slice(0, 500),
    grammar_signals: grammarSignals,
  };

  await writeFile(new URL("seed.normalized.json", CURATED_DIR), JSON.stringify(payload, null, 2), "utf8");
  console.log("Curated seed written:", payload.example_sentences.length, "sentences,", payload.vocabulary.length, "words");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
