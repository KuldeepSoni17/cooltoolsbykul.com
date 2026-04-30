# Italian Coach Data Pipeline (Lean Mode)

This pipeline intentionally fetches **small slices** of trusted datasets to avoid large downloads while we build MVP features.

## Commands

```bash
npm run italian:data:fetch
npm run italian:data:curate
```

Or run both:

```bash
npm run italian:data:prepare
```

## Sources

- Tatoeba API (sample sentence pairs)
- FrequencyWords Italian list (top words)
- Universal Dependencies Italian ISDT (grammar signals)
- Kaikki Wiktionary Italian JSONL (byte-range slice only)

## Output

- Raw sample files: `data/italian-coach/raw/`
- Curated normalized seed: `data/italian-coach/curated/seed.normalized.json`

These output folders are ignored by git so we can refresh them freely.

## Limits (Configurable)

Environment variables:

- `IC_MAX_SENTENCES` (default: `120`)
- `IC_MAX_VOCAB` (default: `400`)
- `IC_MAX_UD_EXAMPLES` (default: `180`)
- `IC_MAX_WIKTIONARY_LINES` (default: `250`)

Example:

```bash
IC_MAX_SENTENCES=60 IC_MAX_VOCAB=250 npm run italian:data:prepare
```

## Next Step

After generating `seed.normalized.json`, map it into DB tables (`vocabulary`, `example_sentences`, `grammar_rules`) via a seed script.
