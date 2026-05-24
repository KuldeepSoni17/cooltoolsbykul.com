/**
 * Optional: enrich a sample of catalog rows with Anthropic.
 * Requires ANTHROPIC_API_KEY in environment.
 * Run: npm run swadeshi:catalog:enrich
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(fileURLToPath(new URL("../../", import.meta.url)));
const SAMPLE = 20;

async function enrichRow(row) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");

  const prompt = `You are curating honest Indian brand comparisons for Indian shoppers.
Given this product pair JSON, return ONLY valid JSON with improved whyMatch (2 sentences), notSameAs if needed, and summary (1 sentence). Be honest if Indian option is weaker.
${JSON.stringify({ occasion: row.occasion, common: row.common.brand, alternative: row.alternative.brand, match: row.match })}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";
  const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  return { ...row, ...json, trustLevel: "research-assisted" };
}

async function main() {
  const productsPath = path.join(ROOT, "data/swadeshi/curated/products.json");
  const products = JSON.parse(await readFile(productsPath, "utf8"));
  const sample = products.slice(0, SAMPLE);
  const enriched = [];
  for (const row of sample) {
    try {
      enriched.push(await enrichRow(row));
      console.log("enriched", row.id);
    } catch (e) {
      console.warn("skip", row.id, e.message);
      enriched.push(row);
    }
  }
  const out = path.join(ROOT, "data/swadeshi/raw/ai-enriched-sample.json");
  await writeFile(out, JSON.stringify(enriched, null, 2));
  console.log(`Wrote sample to ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
