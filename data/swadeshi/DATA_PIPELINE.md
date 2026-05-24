# Swadeshi catalog pipeline

## Overview

The shop catalog (1,300+ tier-matched pairs) is generated from a brand matrix, validated, and published as static JSON for fast browsing.

```
brand-matrix.mjs  →  build-catalog.mjs  →  data/swadeshi/curated/*.json
                                      →  public/swadeshi/catalog/*.json
```

## Commands

```bash
# Regenerate full catalog (requires 1000+ pairs)
npm run swadeshi:catalog:build

# Validate manifest + file counts
npm run swadeshi:catalog:validate

# Optional: enrich draft copy with Anthropic (needs ANTHROPIC_API_KEY)
npm run swadeshi:catalog:enrich
```

## Adding data

1. Edit `scripts/swadeshi/brand-matrix.mjs` — add subcategories or brands at the same **tier** (`mass`, `mid`, `premium`).
2. For hand-verified pairs, add to `data/swadeshi/raw/manual-pairs.json` (merged with `trustLevel: "verified"`).
3. Run `npm run swadeshi:catalog:build`.
4. Commit `data/swadeshi/curated/`, `public/swadeshi/catalog/`, and any matrix changes.

## Rules

- No unfair tier mismatches (e.g. flagship phone vs budget Indian phone).
- Every pair needs `qualityVerdict` and honest `notSameAs` when weaker.
- Phones: use import outflow map, not shop swaps.

## UI

- Category + subcategory carousels
- Horizontal product carousel per aisle
- Search via lightweight `index.json`
- Category JSON loaded on demand (`/swadeshi/catalog/{categoryId}.json`)
