# VacancyBible — Cursor Fix Prompt
### Addresses all 4 issues reported after first build

---

Fix VacancyBible across UI, search coverage, and results logic. Address every issue below completely.

---

## ISSUE 1 — UI OVERHAUL (highest priority)

The current UI is generic and unpolished. Rebuild it to match this exact design spec:

### Typography
- Import from Google Fonts: "DM Serif Display" (headings), "IBM Plex Mono" (data/labels/badges), "DM Sans" (body/nav)
- Apply font-display to the VacancyBible wordmark and hero heading
- Apply font-mono to all field labels, badges, scores, table headers
- Apply font-sans to inputs, buttons, descriptions

### Color System (replace ALL current colors)

```css
:root {
  --bg:               #0C0C0F;
  --surface:          #141418;
  --surface-2:        #1A1A22;
  --border:           #1E1E26;
  --border-hover:     #2E2E3E;
  --text:             #F5F0E8;
  --text-muted:       #7A7A8C;
  --text-dim:         #4B5563;
  --accent:           #5B6EF5;
  --accent-dim:       #1E2456;
  --written:          #4CAF7D;
  --written-bg:       #1A3D2B;
  --written-border:   #2A5E42;
  --estimated:        #D4924A;
  --estimated-bg:     #3D2A14;
  --estimated-border: #5E4220;
}
```

### Homepage Layout
- Full bleed dark background (#0C0C0F)
- Top nav: "VacancyBible" in DM Serif Display left, "How it works" and "Companies" links right, all text-muted
- Hero section centered, generous vertical padding (py-24):
  - H1 in DM Serif Display, 52px, text (#F5F0E8): "Find the role." then line break + italic "Cut the noise." in text-muted
  - Subtitle below in DM Sans text-muted: "We scan company career pages directly — not job boards. Every result links to the original source."
- Search form below hero, max-width 680px, centered

### Search Form — complete redesign

Replace the current 2-field form with a 5-field form. Each field row looks like this:

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Label]  [Input]          │  [Strict] [Flexible] [Open]             │
└──────────────────────────────────────────────────────────────────────┘
```

Fields to include (in this order):
1. Role Title — text input, placeholder "e.g. Senior Product Manager"
2. Location — text input, placeholder "e.g. Bengaluru, Remote India"
3. Experience — text input, placeholder "e.g. 5–9 years"
4. Package — text input, placeholder "e.g. ₹40L+ total comp"
5. Domain — select dropdown: Any / AI / Fintech / SaaS / Consumer / Platform / Infra / Growth / Healthcare / Edtech

Each field row:
- Background: var(--surface)
- Border: 1px solid var(--border)
- Border-radius: 12px
- Padding: 16px
- On hover: border-color transitions to var(--border-hover)
- Left side: label in 10px IBM Plex Mono uppercase text-muted, then input text in 14px DM Sans
- Right side: a 3-state toggle (not a dropdown) — three adjacent buttons labeled "Strict" | "Flexible" | "Open"
  - Selected state: Strict = green (#4CAF7D text, dark green bg), Flexible = accent (#5B6EF5 text, dark accent bg), Open = amber (#D4924A text, dark amber bg)
  - Unselected: transparent bg, text-dim color
  - Default values: Role = Flexible, Location = Flexible, Experience = Flexible, Package = Open, Domain = Open

Search button:
- Full width, 52px height, background var(--accent), text white, DM Sans font-medium
- Text: "Search VacancyBible →"
- Hover: slightly darker accent
- Loading state: "Scanning career pages..." in IBM Plex Mono with animated ellipsis
- Remove the cyan/teal color entirely — use only var(--accent) #5B6EF5

### Progress Section — redesign

When search is running:
- Remove the raw "Status: completed" and "Session: uuid" text display — users must never see session IDs in the UI
- Replace with a clean status line: "Scanning [company name]..." in IBM Plex Mono text-muted, with a subtle pulse animation
- Progress bar: height 2px, background var(--border), fill var(--accent), smooth CSS transition
- Below bar: "12 / 45 companies · 8 jobs found" in IBM Plex Mono text-dim
- When complete: status line changes to "Search complete." No pulse. No loading state.
- Do NOT show "Run a search to fetch live listings" when a search has already completed — show "Found X jobs across Y companies" instead

### Results Table — redesign

Table container:
- Background var(--surface), border 1px solid var(--border), border-radius 12px
- No outer shadow

Table headers:
- Background var(--surface-2)
- 10px IBM Plex Mono uppercase, letter-spacing 0.08em, color text-dim
- Padding: 12px 16px
- Sortable columns show ↑↓ indicator on hover

Table rows:
- Border-bottom: 1px solid var(--border) at 40% opacity
- Hover: background var(--surface-2)
- Cursor pointer
- Animate in: opacity 0→1, translateY 4px→0, 250ms ease, staggered (row index × 25ms delay)

Table columns in this order: Company, Role, Location, Mode, Package, Domain, Score, Source

Source column: small pill chip — e.g. "Greenhouse @ Razorpay" — with a subtle border. On hover: accent color. Has ↗ arrow icon. Clicking opens original URL in new tab. Must NOT trigger the detail panel.

Empty state when search is complete but 0 results:
- Centered inside the table area
- Simple magnifying glass SVG icon
- "No roles found matching your search." in DM Sans
- "Try making your flexibility settings more Open, or broadening your location." in text-muted
- Do NOT say "Run a search to fetch live listings" when a search has already run

---

## ISSUE 2 — EXPAND COMPANY REGISTRY TO 50+ COMPANIES

The current registry has only 7 companies. This is the primary reason searches return 0 results. Find the company registry file (likely `company_registry.py` or a seed script) and add all companies below. If companies are inserted into the DB via a seed, write and run a new seed migration.

### India — Fintech
| Company | ATS | Slug / URL |
|---|---|---|
| Razorpay | Lever | razorpay |
| PhonePe | Direct | phonepe.com/careers |
| CRED | Greenhouse | cred |
| Groww | Greenhouse | groww |
| Zepto | Lever | zepto |
| Slice | Lever | slice |
| Jupiter Money | Greenhouse | jupiter |
| Fi Money | Greenhouse | epifi |
| Smallcase | Greenhouse | smallcase |
| Niyo | Greenhouse | niyo |
| Juspay | Direct | juspay.in/careers |
| Setu | Greenhouse | setu |
| Open Financial | Lever | open |
| Navi | Direct | navi.com/careers |
| Acko | Greenhouse | acko |
| BharatPe | Direct | bharatpe.com/careers |
| Paytm | Direct | paytm.com/careers |

### India — Consumer & E-commerce
| Company | ATS | Slug / URL |
|---|---|---|
| Swiggy | Lever | swiggy |
| Meesho | Greenhouse | meesho |
| Zerodha | Direct | zerodha.com/careers |
| Lenskart | Direct | lenskart.com/careers |
| Urban Company | Greenhouse | urbancompany |
| Cars24 | Greenhouse | cars24 |
| Spinny | Lever | spinny |
| Nykaa | Direct | nykaa.com/careers |
| Purplle | Lever | purplle |
| Ixigo | Greenhouse | ixigo |
| OYO | Workday | — |
| MPL | Lever | mpl |

### India — SaaS & Infra
| Company | ATS | Slug / URL |
|---|---|---|
| Freshworks | Greenhouse | freshworks |
| BrowserStack | Greenhouse | browserstack |
| Chargebee | Greenhouse | chargebee |
| Hasura | Greenhouse | hasura |
| Postman | Greenhouse | postman |
| Zoho | Direct | careers.zohocorp.com |
| CleverTap | Greenhouse | clevertap |
| MoEngage | Greenhouse | moengage |
| Sprinklr | Greenhouse | sprinklr |

### Global Big Tech (India offices)
| Company | ATS | Slug / URL |
|---|---|---|
| Google | Direct | careers.google.com (filter location=India) |
| Microsoft | Direct | careers.microsoft.com (filter India) |
| Amazon | Direct | amazon.jobs (filter country=IN) |
| Meta | Greenhouse | meta |
| LinkedIn | Greenhouse | linkedin |
| Uber | Greenhouse | uber |
| Atlassian | Greenhouse | atlassian |
| Salesforce | Greenhouse | salesforce |

### Global Fintech / SaaS
| Company | ATS | Slug / URL |
|---|---|---|
| Stripe | Greenhouse | stripe |
| Wise | Greenhouse | wise |
| Revolut | Greenhouse | revolut |
| Figma | Greenhouse | figma |
| Notion | Greenhouse | notion |
| Linear | Ashby | linear |
| Vercel | Greenhouse | vercel |
| Supabase | Ashby | supabase |

### AI
| Company | ATS | Slug / URL |
|---|---|---|
| Anthropic | Greenhouse | anthropic |
| Cohere | Greenhouse | cohere |
| Scale AI | Greenhouse | scaleai |
| Perplexity | Ashby | perplexity |

For every company set these fields in the registry object:
- `name`, `slug`, `careers_page_url`, `ats_platform`, `ats_slug` (if ATS-based)
- `sector` (Fintech / Consumer / SaaS / AI / BigTech / etc.)
- `hq_city`, `hq_country`
- `india_offices` as array of city strings
- `pm_maturity_score` (1–10)
- `brand_value_score` (1–10)
- `stability_score` (1–10)

After updating the registry, run the seed script so all companies are in the DB immediately before any user runs a search.

---

## ISSUE 3 — FIX THE ATS SCRAPER LOGIC

The scrapers ran 7 companies and returned 0 jobs. This means either the ATS slugs are wrong, or the title-matching filter is rejecting valid results. Fix both.

### 3a — Validate ATS slugs before using them

Add a `validate_ats_slug()` function that pings each ATS API and confirms it returns data. Run this during seeding. Log failures clearly.

```python
# Greenhouse validation
async def validate_greenhouse_slug(slug: str) -> bool:
    url = f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs"
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.get(url)
            data = resp.json()
            return resp.status_code == 200 and "jobs" in data
        except Exception:
            return False

# Lever validation
async def validate_lever_slug(slug: str) -> bool:
    url = f"https://api.lever.co/v0/postings/{slug}?mode=json"
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.get(url)
            return resp.status_code == 200 and isinstance(resp.json(), list)
        except Exception:
            return False
```

Log result for every company during seed:
```
[VALID]   Greenhouse @ freshworks — 142 jobs found
[VALID]   Lever @ razorpay — 38 jobs found
[INVALID] Greenhouse @ cred — slug may be wrong, returned 404
```

If a slug returns 404 or empty, try common variations: all-lowercase, hyphens instead of spaces, abbreviated name.

### 3b — Fix and loosen title matching

The current title filter is too strict. Replace whatever logic exists with this:

```python
SENIOR_PM_PATTERNS = [
    "senior product manager",
    "senior pm",
    "lead product manager",
    "lead pm",
    "principal product manager",
    "principal pm",
    "group product manager",
    "group pm",
    "director of product",
    "director, product",
    "product director",
    "sr. product manager",
    "sr product manager",
    "staff product manager",
    "head of product",
    "vp of product",
    "associate director",       # common in India
    "product lead",             # common in India startups
    "senior associate pm",      # common in India startups
]

BROADER_PM_PATTERNS = [
    "product manager",
    " pm ",
    "product owner",
]

def matches_query(title: str, flex: int) -> bool:
    title_lower = title.lower().strip()
    if flex == 0:  # Strict
        return any(p in title_lower for p in SENIOR_PM_PATTERNS)
    if flex == 1:  # Flexible
        return any(p in title_lower for p in SENIOR_PM_PATTERNS)
    if flex == 2:  # Open
        return (
            any(p in title_lower for p in SENIOR_PM_PATTERNS) or
            any(p in title_lower for p in BROADER_PM_PATTERNS)
        )
    return False
```

All comparisons must be case-insensitive. Strip whitespace before comparing.

### 3c — Add per-scraper console logging

After each scraper finishes, log this to console:

```
[Greenhouse @ Freshworks] Fetched 142 total jobs, 4 matched title filter → returning 4
[Lever @ Razorpay] Fetched 38 total jobs, 2 matched title filter → returning 2
[Greenhouse @ CRED] Request failed: 404 — slug may be incorrect
```

This makes debugging fast. Without this, silent failures are invisible.

---

## ISSUE 4 — FIX POST-SEARCH EMPTY STATE MESSAGING

The UI currently says "No results yet. Run a search to fetch live listings." after a search has already been completed. This is wrong and confusing.

Apply this logic:

```
State: search has never been run
→ Show: "Results will appear here after you run a search."

State: search is currently running (status = "running")
→ Show: skeleton loading rows (animated grey placeholders, not text)

State: search complete, 0 results (status = "complete", jobs.length === 0)
→ Show: "No roles found matching your search."
         "Try making your flexibility settings more Open, or broadening your location."

State: search complete, results exist (status = "complete", jobs.length > 0)
→ Show: results table with filter bar
```

Also:
- Remove the Session UUID from all UI surfaces. Log it to browser console only.
- Remove "Status: completed" raw label. Replace with the clean progress section described in Issue 1.

---

## ISSUE 5 — ADD FILTER BAR ABOVE RESULTS TABLE

Once results appear, render a horizontal filter bar directly above the table:

```
[All Tiers ▾]  [All Locations ▾]  [All Domains ▾]  [☐ Remote Only]  [Sort: Score ▾]     [Export CSV]
```

Requirements:
- Dropdowns are populated dynamically from the actual results returned (not hardcoded)
- "Remote Only" is a checkbox toggle that filters to work_mode === "Remote"
- "Export CSV" downloads the currently filtered result set
- All filtering is client-side on the results array — no new API call
- Filter bar only renders after search is complete and at least 1 result exists
- Styling: same dark surface, mono labels, accent color for active filters

---

## Summary Checklist for Cursor

- [ ] Full UI redesign: fonts, CSS variables, homepage layout, search form (5 fields + 3-state flex toggle), progress section, results table, empty states
- [ ] Expand company registry from 7 → 50+ companies using the full list above
- [ ] Add `validate_ats_slug()` and run it during seeding — log valid/invalid per company
- [ ] Fix title matching: use expanded `SENIOR_PM_PATTERNS` list, case-insensitive, whitespace-stripped
- [ ] Add per-scraper console logging showing fetched count vs. matched count
- [ ] Fix empty state logic — never say "run a search" when one already ran
- [ ] Remove Session UUID from all UI surfaces
- [ ] Add client-side filter bar above results table

**Do not change any backend API route signatures. Do not change the database schema. Changes are limited to: company registry data, scraper title-matching logic, scraper logging, and all frontend components.**
