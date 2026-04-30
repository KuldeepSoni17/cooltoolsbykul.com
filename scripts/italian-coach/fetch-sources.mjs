import { mkdir, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

const OUT_DIR = new URL("../../data/italian-coach/raw/", import.meta.url);
const MAX_SENTENCES = Number.parseInt(process.env.IC_MAX_SENTENCES ?? "120", 10);
const MAX_VOCAB = Number.parseInt(process.env.IC_MAX_VOCAB ?? "400", 10);
const MAX_UD_EXAMPLES = Number.parseInt(process.env.IC_MAX_UD_EXAMPLES ?? "180", 10);
const WIKTIONARY_LINE_LIMIT = Number.parseInt(
  process.env.IC_MAX_WIKTIONARY_LINES ?? "250",
  10,
);

async function ensureDirs() {
  await mkdir(OUT_DIR, { recursive: true });
}

async function fetchText(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`);
  }
  return response.text();
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`);
  }
  return response.json();
}

async function fetchTatoebaSample() {
  const queries = ["ciao", "casa", "mangiare", "scuola", "parlare"];
  const pairs = [];

  for (const query of queries) {
    const url = `https://tatoeba.org/en/api_v0/search?from=ita&to=eng&query=${encodeURIComponent(query)}&page=1`;
    try {
      const payload = await fetchJson(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "cooltoolsbykul-italian-coach-seeder",
        },
      });
      const results = payload?.results ?? [];
      for (const row of results) {
        const italian = row?.text?.trim();
        const translation =
          row?.translations?.[0]?.[0]?.text?.trim() ??
          row?.translations?.[0]?.text?.trim();
        if (!italian || !translation) continue;
        pairs.push({
          italian,
          english: translation,
          source: "tatoeba_api",
          qualityScore: 0.7,
        });
      }
    } catch (error) {
      console.warn(`Skipping Tatoeba query "${query}": ${error.message}`);
    }
    await delay(120);
    if (pairs.length >= MAX_SENTENCES) break;
  }

  return pairs.slice(0, MAX_SENTENCES);
}

async function fetchFrequencyList() {
  const url =
    "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/it/it_50k.txt";
  const text = await fetchText(url);
  const rows = text.split("\n");
  const items = [];
  for (const row of rows) {
    const [wordRaw, countRaw] = row.trim().split(/\s+/);
    if (!wordRaw) continue;
    items.push({
      rank: items.length + 1,
      word: wordRaw.toLowerCase(),
      count: Number(countRaw ?? 0),
      source: "frequencywords_2018",
    });
    if (items.length >= MAX_VOCAB) break;
  }
  return items;
}

async function fetchUDSample() {
  const url =
    "https://raw.githubusercontent.com/UniversalDependencies/UD_Italian-ISDT/master/it_isdt-ud-train.conllu";
  const text = await fetchText(url);
  const blocks = text.split("\n\n");
  const examples = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    const sentenceLine = lines.find((line) => line.startsWith("# text = "));
    if (!sentenceLine) continue;
    const sentence = sentenceLine.replace("# text = ", "").trim();

    const tokens = lines
      .filter((line) => /^\d+\t/.test(line))
      .map((line) => {
        const columns = line.split("\t");
        return {
          form: columns[1],
          lemma: columns[2],
          pos: columns[3],
          feats: columns[5] === "_" ? null : columns[5],
        };
      });

    examples.push({
      sentence,
      tokens,
      source: "ud_italian_isdt",
    });

    if (examples.length >= MAX_UD_EXAMPLES) break;
  }

  return examples;
}

async function fetchWiktionarySlice() {
  const urls = [
    "https://kaikki.org/dictionary/Italian/kaikki.org-dictionary-Italian.jsonl",
    "https://kaikki.org/itwiktionary/raw-wiktextract-data.jsonl",
  ];
  let text = "";

  for (const url of urls) {
    try {
      text = await fetchText(url, {
        headers: {
          // Only pull a tiny beginning byte range; do not download full dump.
          Range: "bytes=0-2400000",
          "User-Agent": "cooltoolsbykul-italian-coach-seeder",
        },
      });
      break;
    } catch (error) {
      console.warn(`Skipping Wiktionary URL ${url}: ${error.message}`);
    }
  }

  if (!text) return [];

  const lines = text.split("\n");
  const items = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      const word = parsed?.word?.toLowerCase?.();
      if (!word || /[^a-zàèéìòóù']/.test(word)) continue;
      items.push({
        word,
        pos: parsed?.pos ?? null,
        senses: (parsed?.senses ?? [])
          .map((sense) => sense?.glosses?.[0])
          .filter(Boolean)
          .slice(0, 2),
        forms: (parsed?.forms ?? [])
          .slice(0, 4)
          .map((form) => ({ form: form?.form ?? "", tags: form?.tags ?? [] })),
        source: "kaikki_wiktionary",
      });
    } catch {
      // Ignore partial/truncated last line from range responses.
    }

    if (items.length >= WIKTIONARY_LINE_LIMIT) break;
  }
  return items;
}

async function main() {
  await ensureDirs();
  const sources = await Promise.allSettled([
    fetchTatoebaSample(),
    fetchFrequencyList(),
    fetchUDSample(),
    fetchWiktionarySlice(),
  ]);
  const [sentences, frequency, ud, wiktionary] = sources.map((result, index) => {
    if (result.status === "fulfilled") return result.value;
    const names = ["tatoeba", "frequency", "ud", "wiktionary"];
    console.warn(`Source failed (${names[index]}): ${result.reason?.message ?? result.reason}`);
    return [];
  });

  await writeFile(
    new URL("tatoeba.sample.json", OUT_DIR),
    JSON.stringify(sentences, null, 2),
    "utf8",
  );
  await writeFile(
    new URL("frequency.sample.json", OUT_DIR),
    JSON.stringify(frequency, null, 2),
    "utf8",
  );
  await writeFile(
    new URL("ud.sample.json", OUT_DIR),
    JSON.stringify(ud, null, 2),
    "utf8",
  );
  await writeFile(
    new URL("wiktionary.sample.json", OUT_DIR),
    JSON.stringify(wiktionary, null, 2),
    "utf8",
  );

  console.log("Italian coach raw samples fetched:");
  console.log(`- sentences: ${sentences.length}`);
  console.log(`- frequency words: ${frequency.length}`);
  console.log(`- ud examples: ${ud.length}`);
  console.log(`- wiktionary entries: ${wiktionary.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
