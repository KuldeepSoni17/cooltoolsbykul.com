import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(fileURLToPath(new URL("../../", import.meta.url)));
const manifest = JSON.parse(
  await readFile(path.join(ROOT, "data/swadeshi/curated/manifest.json"), "utf8"),
);
const products = JSON.parse(
  await readFile(path.join(ROOT, "data/swadeshi/curated/products.json"), "utf8"),
);

let ok = true;
if (products.length < 1000) {
  console.error(`FAIL: only ${products.length} products`);
  ok = false;
}
if (manifest.totalProducts !== products.length) {
  console.error("FAIL: manifest count mismatch");
  ok = false;
}
for (const cat of manifest.categories) {
  const file = path.join(ROOT, "public/swadeshi/catalog", `${cat.id}.json`);
  const slice = JSON.parse(await readFile(file, "utf8"));
  if (slice.length !== cat.count) {
    console.error(`FAIL: ${cat.id} public count ${slice.length} vs manifest ${cat.count}`);
    ok = false;
  }
}
const bad = products.filter((p) => !p.qualityVerdict || !p.subcategory);
if (bad.length) {
  console.error(`FAIL: ${bad.length} products missing qualityVerdict or subcategory`);
  ok = false;
}
if (ok) console.log(`OK: ${products.length} products, ${manifest.categories.length} categories`);
process.exit(ok ? 0 : 1);
