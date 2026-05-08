# VacancyBible — Full Technical Specification
## Cursor Build Document (Complete, End-to-End)

> **Product**: VacancyBible — a clean, search-first PM job intelligence platform.
> Users describe what they want, set how flexible the search should be, and get
> verified results pulled live from company career pages. No clutter. No noise.
> Just what's available, with honest data confidence labels on every field.
>
> **Core Philosophy**: We don't compete with job boards. We surface their data more
> clearly. Every listing links back to the original source. We add signal, not noise.
>
> **Cursor**: Build everything in this document end-to-end. No phasing. All modules
> ship together.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [On Scraping Company Career Pages Directly](#2-on-scraping-company-career-pages-directly)
3. [Data Confidence System](#3-data-confidence-system)
4. [Tech Stack](#4-tech-stack)
5. [Repository Structure](#5-repository-structure)
6. [Database Schema](#6-database-schema)
7. [Company Registry](#7-company-registry)
8. [ATS Detection & Scraper Routing](#8-ats-detection--scraper-routing)
9. [Scraper Modules](#9-scraper-modules)
10. [Enrichment Pipeline](#10-enrichment-pipeline)
11. [Search API](#11-search-api)
12. [Backend API — All Endpoints](#12-backend-api--all-endpoints)
13. [Frontend — Design System](#13-frontend--design-system)
14. [Frontend — Pages & Components](#14-frontend--pages--components)
15. [Environment Variables](#15-environment-variables)
16. [Deployment](#16-deployment)
17. [Error Handling](#17-error-handling)

---

## 1. Product Overview

### User Flow

```
1. User lands on VacancyBible homepage
        ↓
2. Search form — fills in:
   • Job title / role type   (e.g. "Senior Product Manager")
   • Location                (e.g. "Bengaluru" or "Remote India")
   • Experience range        (e.g. 5–9 years)
   • Package expectation     (e.g. ₹40L+)
   • Domain preference       (e.g. Fintech, AI, Consumer)
        ↓
3. Flexibility Bar (per field, not global)
   • Each field has a slider: Strict → Flexible → Open
   • "Strict" on title = exact match only
   • "Flexible" = related titles (Lead PM, Principal PM, Group PM)
   • "Open" = any PM role at that level
        ↓
4. User clicks "Search"
        ↓
5. Live scrape runs against company registry
   • ATS companies → instant JSON API calls (< 2s)
   • Custom career pages → Playwright (5–15s)
   • Progress shown in real time with a live status bar
        ↓
6. Results appear in a clean table
   • Each row: Company, Role, Location, Package, Source, Confidence badges
   • Clicking a row expands full detail panel
   • Every row has a direct "View Original" link
   • Data fields show Written / Estimated / NotAvailable badges
```

### What VacancyBible Is NOT

- Not a job board. We don't host listings.
- Not an aggregator. We don't store and republish jobs.
- Not a recruiter tool. We're a search lens.
- Every result links to the original source. Always.

---

## 2. On Scraping Company Career Pages Directly

### Why This Is The Right Approach

Most job boards (Naukri, LinkedIn, Indeed) are themselves scraping or receiving feeds
from company career pages. We skip the middleman entirely.

### The ATS Reality

~80% of companies with formal hiring pipelines use one of these six platforms:

```
ATS Platform     Market Share    API Type          Auth Required
─────────────────────────────────────────────────────────────────
Greenhouse       ~30%            REST JSON API     None (public)
Lever            ~20%            REST JSON API     None (public)
Ashby            ~15%            GraphQL API       None (public)
Workday          ~15%            REST (complex)    None (public)
SmartRecruiters  ~10%            REST JSON API     None (public)
iCIMS            ~5%             XML/REST          None (public)
Custom Portal    ~5%             Playwright only   None (public)
```

For Greenhouse, Lever, Ashby, and SmartRecruiters — these are pure JSON API calls.
No browser needed. Sub-second response. Full job data in structured format.

### ATS Detection Flow

```python
# When a new company is added to the registry:
# 1. Fetch their careers page URL
# 2. Check for known ATS signatures in the HTML/URL
# 3. Store detected ATS in company registry
# 4. Route to correct scraper at runtime

ATS_SIGNATURES = {
    "greenhouse": ["boards.greenhouse.io", "boards-api.greenhouse.io"],
    "lever":      ["jobs.lever.co", "api.lever.co"],
    "ashby":      ["jobs.ashbyhq.com", "api.ashbyhq.com"],
    "workday":    ["myworkdayjobs.com", "workday.com/en-us/jobs"],
    "smartrecruiters": ["careers.smartrecruiters.com"],
    "icims":      ["careers-", "icims.com"],
}
```

### Direct Career Page Scraping (Custom Portals)

For companies with custom portals (Google, Amazon, Razorpay, Swiggy, PhonePe etc.),
we maintain company-specific Playwright scrapers. These are slower (5–15s) but
more accurate than any job board because we're reading the source.

These custom scrapers are built once per company and maintained in
`backend/app/scrapers/direct/`.

---

## 3. Data Confidence System

### The Three States

Every data field in a job result carries one of three confidence labels.
This is a core UX feature — users see exactly what's real vs. estimated vs. unknown.

```
WRITTEN        ✓ green   — Field appears verbatim in the job description or
                           official company careers page. Exact text, no inference.

ESTIMATED      ~ amber   — Field is not in the JD. Derived from:
                           • Levels.fyi data for that company + level
                           • Glassdoor salary ranges
                           • LLM inference from JD context
                           • Industry benchmarks for that domain/city
                           Always shown with the estimation source.

NOT_AVAILABLE  — grey    — Cannot be determined. Not in JD. No reliable
                           external data source. No inference possible.
                           Shown as "—" with a grey badge.
```

### Fields and Their Typical Confidence

```
Field                   Typical Source          Usual Confidence
────────────────────────────────────────────────────────────────
Role Title              JD text                 WRITTEN
Location                JD text                 WRITTEN
Work Mode               JD text / inference     WRITTEN or ESTIMATED
Experience Range        JD text                 WRITTEN (if stated)
Fixed Salary            JD text (rare in India) WRITTEN or NOT_AVAILABLE
Total Comp              Levels.fyi / Glassdoor  ESTIMATED
Equity / ESOPs          JD text / company type  WRITTEN or ESTIMATED
Reporting Line          JD text (rare)          WRITTEN or NOT_AVAILABLE
Team Size               JD text (rare)          WRITTEN or NOT_AVAILABLE
Domain                  LLM inference           ESTIMATED
PM Ownership Type       LLM inference           ESTIMATED
Company Stability       Public data / news      ESTIMATED
Layoff Risk             News / funding data     ESTIMATED
WLB Score               Glassdoor / LLM         ESTIMATED
Interview Difficulty    Glassdoor / LLM         ESTIMATED
```

### Confidence Badge Implementation

```tsx
// Three distinct visual treatments — never just color alone (accessibility)
// Written:       solid green pill, checkmark icon
// Estimated:     amber outline pill, tilde icon, tooltip with source
// NotAvailable:  grey text, dash, no pill

type Confidence = "WRITTEN" | "ESTIMATED" | "NOT_AVAILABLE"

interface FieldValue {
  value: string | number | null
  confidence: Confidence
  source?: string   // Only for ESTIMATED — shown in tooltip
}
```

---

## 4. Tech Stack

```
Layer                  Choice               Why
───────────────────────────────────────────────────────────────────
Scraping (ATS APIs)    httpx + asyncio      Pure API calls, no browser needed
Scraping (SPA/custom)  Playwright (Python)  Headless Chromium for JS-heavy pages
Search trigger         FastAPI endpoint     On-demand, not scheduled
Job queue              asyncio.gather       Lightweight, no Redis needed at MVP
LLM enrichment         Claude Haiku         Cheapest capable model for classification
Salary intelligence    Static bands +       Curated + Levels.fyi scrape
                       Levels.fyi scrape
Database               PostgreSQL           Supabase free tier
ORM                    SQLModel             Pydantic + SQLAlchemy combined
Backend API            FastAPI              Async-native, clean
Frontend               Next.js 14           App Router, server components
Styling                Tailwind CSS         Utility-first, consistent
Data table             TanStack Table v8    Best filtering/sorting/virtualization
Real-time progress     Server-Sent Events   Stream scrape progress to frontend
Deployment (backend)   Railway              Simple Python deploy
Deployment (frontend)  Vercel               Standard Next.js
```

---

## 5. Repository Structure

```
vacancybible/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI entry point
│   │   ├── config.py                   # Settings from env vars
│   │   ├── database.py                 # Async DB connection
│   │   │
│   │   ├── models/
│   │   │   ├── job.py                  # Job table (SQLModel)
│   │   │   ├── company.py              # Company registry table
│   │   │   └── search_session.py       # Search run tracking
│   │   │
│   │   ├── schemas/
│   │   │   ├── job.py                  # Pydantic API response shapes
│   │   │   ├── company.py
│   │   │   └── search.py               # Search request + response
│   │   │
│   │   ├── api/
│   │   │   ├── search.py               # POST /api/search — main endpoint
│   │   │   ├── jobs.py                 # GET /api/jobs — cached results
│   │   │   ├── companies.py            # GET /api/companies
│   │   │   ├── stream.py               # GET /api/search/stream — SSE progress
│   │   │   └── export.py               # GET /api/export/csv
│   │   │
│   │   ├── scrapers/
│   │   │   ├── base.py                 # BaseScraper + RawJobRecord
│   │   │   ├── ats_detector.py         # Detects which ATS a company uses
│   │   │   ├── greenhouse.py           # Greenhouse JSON API
│   │   │   ├── lever.py                # Lever JSON API
│   │   │   ├── ashby.py                # Ashby GraphQL API
│   │   │   ├── workday.py              # Workday REST + Playwright fallback
│   │   │   ├── smartrecruiters.py      # SmartRecruiters JSON API
│   │   │   ├── direct/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── google.py           # careers.google.com
│   │   │   │   ├── amazon.py           # amazon.jobs
│   │   │   │   ├── microsoft.py        # careers.microsoft.com
│   │   │   │   ├── razorpay.py         # razorpay.com/jobs
│   │   │   │   ├── swiggy.py           # careers.swiggy.com
│   │   │   │   ├── phonepe.py          # phonepe.com/careers
│   │   │   │   ├── cred.py             # dreamplug.io/careers
│   │   │   │   ├── zepto.py            # zepto.com/careers
│   │   │   │   ├── meesho.py           # meesho.io/careers
│   │   │   │   └── zerodha.py          # zerodha.com/careers
│   │   │   └── runner.py               # Orchestrator: routes companies to scrapers
│   │   │
│   │   ├── enrichment/
│   │   │   ├── deduplicator.py
│   │   │   ├── llm_classifier.py       # Claude Haiku — classifies + scores
│   │   │   ├── compensation.py         # Salary bands + confidence assignment
│   │   │   ├── company_signals.py      # Stability, layoff risk, funding
│   │   │   └── confidence_tagger.py    # Assigns WRITTEN/ESTIMATED/NOT_AVAILABLE
│   │   │
│   │   ├── search/
│   │   │   ├── engine.py               # Search logic: parse query + run scrapers
│   │   │   ├── flexibility.py          # Flex score → query expansion
│   │   │   └── ranker.py               # Score + rank results against query
│   │   │
│   │   └── utils/
│   │       ├── http_client.py          # httpx with retry + optional proxy
│   │       ├── playwright_pool.py      # Browser instance manager
│   │       ├── logger.py
│   │       └── salary_bands.py         # Static salary reference data
│   │
│   ├── alembic/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── railway.toml
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout — fonts, globals
│   │   ├── page.tsx                    # Homepage — search form
│   │   ├── results/
│   │   │   └── page.tsx                # Results page — table + filters
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── search/
│   │   │   ├── SearchForm.tsx          # Main search form
│   │   │   ├── FlexibilityBar.tsx      # Per-field flex slider
│   │   │   └── SearchButton.tsx        # Submit + loading state
│   │   ├── results/
│   │   │   ├── ResultsTable.tsx        # TanStack Table
│   │   │   ├── ResultRow.tsx           # Single row with confidence badges
│   │   │   ├── ResultDetailPanel.tsx   # Expanded view on row click
│   │   │   ├── ProgressStream.tsx      # Live scrape progress (SSE)
│   │   │   └── NoResults.tsx
│   │   ├── ui/
│   │   │   ├── ConfidenceBadge.tsx     # Written / Estimated / NotAvailable
│   │   │   ├── FieldValue.tsx          # Value + badge pair
│   │   │   ├── FlexSlider.tsx          # 3-state slider component
│   │   │   ├── SourceLink.tsx          # "View Original" link chip
│   │   │   └── Tooltip.tsx             # For estimation source details
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── SearchMeta.tsx          # "Found X jobs from Y sources in Zs"
│   │
│   ├── lib/
│   │   ├── api.ts                      # Typed API client
│   │   ├── types.ts                    # All TypeScript interfaces
│   │   ├── confidence.ts               # Confidence badge utilities
│   │   └── search-store.ts             # Zustand store for search state
│   │
│   ├── hooks/
│   │   ├── useSearch.ts                # Trigger search + manage results
│   │   └── useProgressStream.ts        # SSE hook for live progress
│   │
│   └── package.json
│
└── README.md
```

---

## 6. Database Schema

```sql
-- ─────────────────────────────────────────────────
-- COMPANIES (registry of all companies we scrape)
-- ─────────────────────────────────────────────────
CREATE TABLE companies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) UNIQUE NOT NULL,
    slug                VARCHAR(255) UNIQUE NOT NULL,
    website             TEXT,
    careers_page_url    TEXT NOT NULL,

    -- ATS routing
    ats_platform        VARCHAR(50),          -- greenhouse|lever|ashby|workday|smartrecruiters|direct
    ats_slug            VARCHAR(255),          -- slug used in ATS API (e.g. "razorpay" in Lever API)
    ats_detected_at     TIMESTAMPTZ,

    -- Classification
    sector              VARCHAR(100),          -- Fintech|SaaS|Consumer|AI|Infra|etc.
    hq_city             VARCHAR(100),
    hq_country          VARCHAR(100),
    india_offices       JSONB,                 -- ["Bengaluru","Hyderabad"]
    is_active           BOOLEAN DEFAULT TRUE,  -- false = temporarily skip

    -- Funding / stability
    funding_status      VARCHAR(100),          -- Series A|B|C|Public|Bootstrapped
    total_funding_usd_m DECIMAL(10,2),
    is_public           BOOLEAN DEFAULT FALSE,
    stock_ticker        VARCHAR(20),
    employee_range      VARCHAR(50),           -- 1-50|51-200|201-1000|1000+

    -- Scores (curated, not LLM)
    pm_maturity_score   SMALLINT,              -- 1-10
    brand_value_score   SMALLINT,              -- 1-10
    stability_score     SMALLINT,              -- 1-10
    recent_layoff       BOOLEAN DEFAULT FALSE,
    layoff_detail       TEXT,

    -- Meta
    last_scraped_at     TIMESTAMPTZ,
    scrape_error_count  SMALLINT DEFAULT 0,    -- circuit breaker
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- JOBS (enriched job records)
-- ─────────────────────────────────────────────────
CREATE TABLE jobs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id              UUID REFERENCES companies(id),

    -- Source tracking (critical — we always link back)
    source_url              TEXT NOT NULL,         -- Original job URL on company site
    source_url_hash         VARCHAR(64) UNIQUE,    -- SHA256 for dedup
    ats_platform            VARCHAR(50),
    source_label            TEXT,                  -- Human readable: "Greenhouse @ Razorpay"

    -- Lifecycle
    first_seen_at           TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at            TIMESTAMPTZ DEFAULT NOW(),
    is_active               BOOLEAN DEFAULT TRUE,

    -- ─── BASIC FIELDS ─────────────────────────────
    -- Each field has a value + a confidence column

    company_name            VARCHAR(255) NOT NULL,
    exact_role_title        TEXT NOT NULL,
    exact_role_title_conf   VARCHAR(12) DEFAULT 'WRITTEN',  -- always WRITTEN

    normalized_level        VARCHAR(50),           -- Senior|Lead|Principal|Group|Director
    normalized_level_conf   VARCHAR(12),

    location                TEXT,
    location_conf           VARCHAR(12),

    city                    VARCHAR(100),
    country                 VARCHAR(100),

    work_mode               VARCHAR(20),           -- Remote|Hybrid|Onsite
    work_mode_conf          VARCHAR(12),

    -- ─── ROLE DETAIL ──────────────────────────────
    domain                  VARCHAR(100),          -- Fintech|AI|SaaS|Consumer|etc.
    domain_conf             VARCHAR(12),

    pm_ownership_type       VARCHAR(100),          -- 0→1|Growth|Platform|Core|Infra|etc.
    pm_ownership_type_conf  VARCHAR(12),

    years_exp_min           INTEGER,
    years_exp_max           INTEGER,
    years_exp_conf          VARCHAR(12),

    team_scope              TEXT,
    team_scope_conf         VARCHAR(12),

    reporting_to            TEXT,
    reporting_to_conf       VARCHAR(12),

    team_size               TEXT,
    team_size_conf          VARCHAR(12),

    posted_date             DATE,
    posted_date_conf        VARCHAR(12),

    -- ─── COMPENSATION ─────────────────────────────
    comp_disclosed          BOOLEAN DEFAULT FALSE,

    comp_fixed_min_inr      INTEGER,               -- In ₹ Lakhs
    comp_fixed_max_inr      INTEGER,
    comp_fixed_conf         VARCHAR(12),
    comp_fixed_source       TEXT,

    comp_total_min_inr      INTEGER,
    comp_total_max_inr      INTEGER,
    comp_total_conf         VARCHAR(12),
    comp_total_source       TEXT,

    -- For global roles in USD
    comp_fixed_min_usd      INTEGER,               -- In $K
    comp_fixed_max_usd      INTEGER,
    comp_total_min_usd      INTEGER,
    comp_total_max_usd      INTEGER,
    comp_currency           VARCHAR(10) DEFAULT 'INR',

    equity_potential        TEXT,
    equity_conf             VARCHAR(12),
    equity_source           TEXT,

    bonus_structure         TEXT,
    bonus_conf              VARCHAR(12),

    -- ─── CAREER SIGNALS ───────────────────────────
    brand_value_score       SMALLINT,
    brand_value_conf        VARCHAR(12),

    pm_maturity_score       SMALLINT,
    pm_maturity_conf        VARCHAR(12),

    growth_potential_score  SMALLINT,
    growth_potential_conf   VARCHAR(12),

    promotion_velocity      TEXT,
    promotion_velocity_conf VARCHAR(12),

    internal_mobility       VARCHAR(20),
    international_mobility  VARCHAR(20),
    visa_sponsorship        VARCHAR(20),

    -- ─── STABILITY ────────────────────────────────
    company_stability_score SMALLINT,
    company_stability_conf  VARCHAR(12),

    layoff_risk_score       SMALLINT,              -- 1-10, 10=highest risk
    layoff_risk_conf        VARCHAR(12),
    layoff_risk_source      TEXT,

    recent_layoff_signal    BOOLEAN DEFAULT FALSE,
    layoff_signal_detail    TEXT,

    funding_status          TEXT,
    funding_status_conf     VARCHAR(12),

    profitability_signal    VARCHAR(50),

    -- ─── LIFESTYLE ────────────────────────────────
    wlb_score               SMALLINT,
    wlb_conf                VARCHAR(12),
    wlb_source              TEXT,

    pressure_level          VARCHAR(20),
    interview_difficulty    SMALLINT,
    hiring_bar_strength     VARCHAR(30),
    pm_culture_quality      TEXT,

    -- ─── DECISION ─────────────────────────────────
    overall_score           SMALLINT,              -- 1-100
    priority_tier           SMALLINT,              -- 1|2|3|4
    analysis_notes          TEXT,

    -- ─── RAW DATA ─────────────────────────────────
    raw_description         TEXT,
    raw_metadata            JSONB,                 -- Full scraped JSON from ATS
    source_links_used       JSONB,                 -- Array of URLs used in enrichment

    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_company_id      ON jobs(company_id);
CREATE INDEX idx_jobs_country         ON jobs(country);
CREATE INDEX idx_jobs_city            ON jobs(city);
CREATE INDEX idx_jobs_level           ON jobs(normalized_level);
CREATE INDEX idx_jobs_is_active       ON jobs(is_active);
CREATE INDEX idx_jobs_overall_score   ON jobs(overall_score DESC);
CREATE INDEX idx_jobs_first_seen      ON jobs(first_seen_at DESC);
CREATE INDEX idx_jobs_domain          ON jobs(domain);

-- ─────────────────────────────────────────────────
-- SEARCH SESSIONS (track each user search run)
-- ─────────────────────────────────────────────────
CREATE TABLE search_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query           JSONB NOT NULL,            -- Full search params + flex settings
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    status          VARCHAR(20),               -- running|complete|failed
    companies_hit   INTEGER DEFAULT 0,
    jobs_found      INTEGER DEFAULT 0,
    jobs_new        INTEGER DEFAULT 0,
    duration_ms     INTEGER
);
```

---

## 7. Company Registry

The company registry is the heart of the system. It determines what gets scraped.
Seed this data on first deploy. Add companies over time.

```python
# backend/app/data/company_registry.py
# This is seeded into the companies table via a migration script.

COMPANY_REGISTRY = [
    # ── INDIA TIER 1 ─────────────────────────────────────────────
    {
        "name": "Razorpay",
        "slug": "razorpay",
        "careers_page_url": "https://jobs.lever.co/razorpay",
        "ats_platform": "lever",
        "ats_slug": "razorpay",
        "sector": "Fintech",
        "hq_city": "Bengaluru",
        "hq_country": "India",
        "india_offices": ["Bengaluru"],
        "funding_status": "Series F",
        "is_public": False,
        "pm_maturity_score": 8,
        "brand_value_score": 9,
        "stability_score": 8,
    },
    {
        "name": "PhonePe",
        "slug": "phonepe",
        "careers_page_url": "https://phonepe.com/careers",
        "ats_platform": "direct",
        "sector": "Fintech",
        "hq_city": "Bengaluru",
        "hq_country": "India",
        "india_offices": ["Bengaluru"],
        "funding_status": "Series X (Walmart-backed)",
        "is_public": False,
        "pm_maturity_score": 8,
        "brand_value_score": 9,
        "stability_score": 9,
    },
    {
        "name": "CRED",
        "slug": "cred",
        "careers_page_url": "https://careers.cred.club",
        "ats_platform": "greenhouse",
        "ats_slug": "cred",
        "sector": "Fintech",
        "hq_city": "Bengaluru",
        "hq_country": "India",
        "india_offices": ["Bengaluru"],
        "funding_status": "Series F",
        "pm_maturity_score": 8,
        "brand_value_score": 8,
        "stability_score": 7,
    },
    {
        "name": "Zepto",
        "slug": "zepto",
        "careers_page_url": "https://jobs.lever.co/zepto",
        "ats_platform": "lever",
        "ats_slug": "zepto",
        "sector": "Consumer / Quick Commerce",
        "hq_city": "Mumbai",
        "hq_country": "India",
        "india_offices": ["Mumbai", "Bengaluru"],
        "funding_status": "Series F",
        "pm_maturity_score": 7,
        "brand_value_score": 8,
        "stability_score": 7,
    },
    {
        "name": "Swiggy",
        "slug": "swiggy",
        "careers_page_url": "https://careers.swiggy.com",
        "ats_platform": "lever",
        "ats_slug": "swiggy",
        "sector": "Consumer / Food Tech",
        "hq_city": "Bengaluru",
        "hq_country": "India",
        "india_offices": ["Bengaluru"],
        "funding_status": "Public (BSE/NSE)",
        "is_public": True,
        "pm_maturity_score": 8,
        "brand_value_score": 8,
        "stability_score": 8,
    },
    {
        "name": "Meesho",
        "slug": "meesho",
        "careers_page_url": "https://meesho.io/careers",
        "ats_platform": "greenhouse",
        "ats_slug": "meesho",
        "sector": "Consumer / E-commerce",
        "hq_city": "Bengaluru",
        "hq_country": "India",
        "india_offices": ["Bengaluru"],
        "funding_status": "Series F",
        "pm_maturity_score": 8,
        "brand_value_score": 8,
        "stability_score": 8,
    },
    {
        "name": "Groww",
        "slug": "groww",
        "careers_page_url": "https://groww.in/careers",
        "ats_platform": "greenhouse",
        "ats_slug": "groww",
        "sector": "Fintech",
        "hq_city": "Bengaluru",
        "hq_country": "India",
        "india_offices": ["Bengaluru"],
        "funding_status": "Series E",
        "pm_maturity_score": 7,
        "brand_value_score": 8,
        "stability_score": 8,
    },
    {
        "name": "Zerodha",
        "slug": "zerodha",
        "careers_page_url": "https://zerodha.com/careers",
        "ats_platform": "direct",
        "sector": "Fintech",
        "hq_city": "Bengaluru",
        "hq_country": "India",
        "india_offices": ["Bengaluru"],
        "funding_status": "Bootstrapped",
        "pm_maturity_score": 7,
        "brand_value_score": 9,
        "stability_score": 10,
    },
    {
        "name": "BrowserStack",
        "slug": "browserstack",
        "careers_page_url": "https://www.browserstack.com/careers",
        "ats_platform": "greenhouse",
        "ats_slug": "browserstack",
        "sector": "SaaS / DevTools",
        "hq_city": "Mumbai",
        "hq_country": "India",
        "india_offices": ["Mumbai"],
        "funding_status": "Series B (profitable)",
        "pm_maturity_score": 8,
        "brand_value_score": 8,
        "stability_score": 9,
    },
    {
        "name": "Freshworks",
        "slug": "freshworks",
        "careers_page_url": "https://www.freshworks.com/company/careers",
        "ats_platform": "greenhouse",
        "ats_slug": "freshworks",
        "sector": "SaaS",
        "hq_city": "Chennai",
        "hq_country": "India",
        "india_offices": ["Chennai", "Bengaluru", "Hyderabad"],
        "funding_status": "Public (NASDAQ: FRSH)",
        "is_public": True,
        "pm_maturity_score": 8,
        "brand_value_score": 8,
        "stability_score": 8,
    },
    {
        "name": "Chargebee",
        "slug": "chargebee",
        "careers_page_url": "https://www.chargebee.com/careers",
        "ats_platform": "greenhouse",
        "ats_slug": "chargebee",
        "sector": "SaaS / Fintech",
        "hq_city": "Chennai",
        "hq_country": "India",
        "india_offices": ["Chennai"],
        "funding_status": "Series H",
        "pm_maturity_score": 8,
        "brand_value_score": 8,
        "stability_score": 8,
    },
    {
        "name": "Setu",
        "slug": "setu",
        "careers_page_url": "https://setu.co/careers",
        "ats_platform": "greenhouse",
        "ats_slug": "setu",
        "sector": "Fintech / Infrastructure",
        "hq_city": "Bengaluru",
        "hq_country": "India",
        "india_offices": ["Bengaluru"],
        "funding_status": "Series B",
        "pm_maturity_score": 7,
        "brand_value_score": 7,
        "stability_score": 7,
    },

    # ── GLOBAL BIG TECH (India offices) ──────────────────────────
    {
        "name": "Google",
        "slug": "google",
        "careers_page_url": "https://careers.google.com/jobs/results/?location=India",
        "ats_platform": "direct",
        "sector": "Big Tech",
        "hq_city": "Mountain View",
        "hq_country": "US",
        "india_offices": ["Bengaluru", "Hyderabad", "Mumbai", "Gurgaon"],
        "is_public": True,
        "pm_maturity_score": 10,
        "brand_value_score": 10,
        "stability_score": 10,
    },
    {
        "name": "Microsoft",
        "slug": "microsoft",
        "careers_page_url": "https://careers.microsoft.com/us/en/search-results?location=India",
        "ats_platform": "direct",
        "sector": "Big Tech",
        "hq_city": "Redmond",
        "hq_country": "US",
        "india_offices": ["Hyderabad", "Bengaluru", "Noida"],
        "is_public": True,
        "pm_maturity_score": 10,
        "brand_value_score": 10,
        "stability_score": 10,
    },
    {
        "name": "Amazon",
        "slug": "amazon",
        "careers_page_url": "https://www.amazon.jobs/en/search?country=IN",
        "ats_platform": "direct",
        "sector": "Big Tech / E-commerce",
        "hq_city": "Seattle",
        "hq_country": "US",
        "india_offices": ["Hyderabad", "Bengaluru"],
        "is_public": True,
        "pm_maturity_score": 9,
        "brand_value_score": 10,
        "stability_score": 10,
    },
    {
        "name": "Atlassian",
        "slug": "atlassian",
        "careers_page_url": "https://www.atlassian.com/company/careers/all-jobs",
        "ats_platform": "greenhouse",
        "ats_slug": "atlassian",
        "sector": "SaaS",
        "hq_city": "Sydney",
        "hq_country": "Australia",
        "india_offices": ["Bengaluru"],
        "is_public": True,
        "pm_maturity_score": 9,
        "brand_value_score": 9,
        "stability_score": 9,
    },

    # ── GLOBAL FINTECH / SAAS ─────────────────────────────────────
    {
        "name": "Stripe",
        "slug": "stripe",
        "careers_page_url": "https://stripe.com/jobs/search",
        "ats_platform": "greenhouse",
        "ats_slug": "stripe",
        "sector": "Fintech",
        "hq_city": "San Francisco",
        "hq_country": "US",
        "india_offices": [],
        "funding_status": "Series I (pre-IPO)",
        "pm_maturity_score": 10,
        "brand_value_score": 10,
        "stability_score": 9,
    },
    {
        "name": "Wise",
        "slug": "wise",
        "careers_page_url": "https://wise.com/gb/careers",
        "ats_platform": "greenhouse",
        "ats_slug": "wise",
        "sector": "Fintech",
        "hq_city": "London",
        "hq_country": "UK",
        "is_public": True,
        "pm_maturity_score": 9,
        "brand_value_score": 9,
        "stability_score": 9,
    },

    # ── AI COMPANIES ──────────────────────────────────────────────
    {
        "name": "Anthropic",
        "slug": "anthropic",
        "careers_page_url": "https://www.anthropic.com/careers",
        "ats_platform": "greenhouse",
        "ats_slug": "anthropic",
        "sector": "AI",
        "hq_city": "San Francisco",
        "hq_country": "US",
        "funding_status": "Series E",
        "pm_maturity_score": 9,
        "brand_value_score": 10,
        "stability_score": 9,
    },
    {
        "name": "Cohere",
        "slug": "cohere",
        "careers_page_url": "https://cohere.com/careers",
        "ats_platform": "greenhouse",
        "ats_slug": "cohere",
        "sector": "AI",
        "hq_city": "Toronto",
        "hq_country": "Canada",
        "funding_status": "Series D",
        "pm_maturity_score": 8,
        "brand_value_score": 8,
        "stability_score": 8,
    },
]
```

---

## 8. ATS Detection & Scraper Routing

```python
# backend/app/scrapers/ats_detector.py

import httpx
import re
from typing import Optional

ATS_PATTERNS = {
    "greenhouse": [
        r"boards\.greenhouse\.io",
        r"boards-api\.greenhouse\.io",
        r"greenhouse\.io/embed",
    ],
    "lever": [
        r"jobs\.lever\.co",
        r"api\.lever\.co",
    ],
    "ashby": [
        r"jobs\.ashbyhq\.com",
        r"api\.ashbyhq\.com",
        r"ashbyhq\.com",
    ],
    "workday": [
        r"myworkdayjobs\.com",
        r"workday\.com/en-us/jobs",
        r"wd\d\.myworkdayjobs",
    ],
    "smartrecruiters": [
        r"careers\.smartrecruiters\.com",
        r"smartrecruiters\.com/jobs",
    ],
    "icims": [
        r"careers-[a-z]+\.icims\.com",
        r"\.icims\.com",
    ],
}

async def detect_ats(careers_url: str) -> Optional[str]:
    """
    Fetch a company's careers page and detect which ATS it uses.
    Returns ATS name or None if custom/unknown.
    """
    # First: check URL patterns directly
    for ats, patterns in ATS_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, careers_url, re.IGNORECASE):
                return ats
    
    # Second: fetch the page and check HTML/redirects
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
            resp = await client.get(careers_url)
            html = resp.text
            final_url = str(resp.url)
            
            # Check final URL after redirects
            for ats, patterns in ATS_PATTERNS.items():
                for pattern in patterns:
                    if re.search(pattern, final_url, re.IGNORECASE):
                        return ats
            
            # Check page HTML for embedded ATS scripts
            for ats, patterns in ATS_PATTERNS.items():
                for pattern in patterns:
                    if re.search(pattern, html, re.IGNORECASE):
                        return ats
    except Exception:
        pass
    
    return "direct"  # Fallback: use Playwright-based direct scraper
```

```python
# backend/app/scrapers/runner.py
# Routes each company to the correct scraper based on ats_platform

from .greenhouse import GreenhouseScraper
from .lever import LeverScraper
from .ashby import AshbyScraper
from .workday import WorkdayScraper
from .smartrecruiters import SmartRecruitersScraper
from . import direct

SCRAPER_MAP = {
    "greenhouse":      GreenhouseScraper,
    "lever":           LeverScraper,
    "ashby":           AshbyScraper,
    "workday":         WorkdayScraper,
    "smartrecruiters": SmartRecruitersScraper,
}

DIRECT_SCRAPER_MAP = {
    "google":    direct.GoogleScraper,
    "amazon":    direct.AmazonScraper,
    "microsoft": direct.MicrosoftScraper,
    "razorpay":  direct.RazorpayScraper,
    "swiggy":    direct.SwiggyScraper,
    "phonepe":   direct.PhonePeScraper,
    "cred":      direct.CredScraper,
    "zepto":     direct.ZeptoScraper,
    "meesho":    direct.MeeshoScraper,
    "zerodha":   direct.ZerodhaScraper,
}

async def get_scraper_for_company(company: Company, search_query: SearchQuery):
    platform = company.ats_platform
    
    if platform in SCRAPER_MAP:
        return SCRAPER_MAP[platform](company=company, query=search_query)
    
    if platform == "direct":
        if company.slug in DIRECT_SCRAPER_MAP:
            return DIRECT_SCRAPER_MAP[company.slug](company=company, query=search_query)
        # Generic Playwright fallback for unknown direct companies
        return direct.GenericDirectScraper(company=company, query=search_query)
    
    return None
```

---

## 9. Scraper Modules

### 9.1 Base Scraper

```python
# backend/app/scrapers/base.py

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional
import hashlib

@dataclass
class SearchQuery:
    title: str                          # e.g. "Senior Product Manager"
    location: str                       # e.g. "Bengaluru"
    experience_min: Optional[int]       # e.g. 5
    experience_max: Optional[int]       # e.g. 9
    package_min_inr: Optional[int]      # e.g. 40 (lakhs)
    domain: Optional[str]              # e.g. "Fintech"
    
    # Flexibility (0=Strict, 1=Flexible, 2=Open)
    title_flex: int = 1
    location_flex: int = 1
    experience_flex: int = 1
    package_flex: int = 2
    domain_flex: int = 2

@dataclass
class RawJobRecord:
    # Always present (scraped directly)
    company_name: str
    company_id: str
    exact_role_title: str
    source_url: str                     # Original URL — always preserved
    ats_platform: str
    source_label: str                   # e.g. "Lever @ Razorpay"
    
    # From JD (may or may not be present)
    location: Optional[str] = None
    work_mode: Optional[str] = None
    posted_date: Optional[str] = None
    raw_description: str = ""
    raw_metadata: dict = field(default_factory=dict)
    
    # Confidence hints from scraper
    # Scraper knows what it found vs. what it inferred
    location_written: bool = False
    work_mode_written: bool = False
    exp_written: bool = False
    salary_written: bool = False
    
    @property
    def source_url_hash(self) -> str:
        return hashlib.sha256(self.source_url.encode()).hexdigest()

class BaseScraper(ABC):
    SENIOR_PM_TITLES = [
        "senior product manager",
        "senior pm",
        "lead product manager",
        "lead pm",
        "principal product manager",
        "principal pm",
        "group product manager",
        "group pm",
        "director of product",
        "staff product manager",
        "head of product",
        "sr. product manager",
        "sr product manager",
    ]
    
    def __init__(self, company, query: SearchQuery):
        self.company = company
        self.query = query
    
    @abstractmethod
    async def scrape(self) -> List[RawJobRecord]:
        raise NotImplementedError
    
    def matches_query(self, title: str) -> bool:
        """
        Checks title against query with flex awareness.
        title_flex=0 (Strict): exact senior PM patterns only
        title_flex=1 (Flexible): senior PM + closely related
        title_flex=2 (Open): any PM role
        """
        title_lower = title.lower()
        query_lower = self.query.title.lower()
        
        if self.query.title_flex == 0:
            # Strict: must be a recognised senior PM title
            return any(p in title_lower for p in self.SENIOR_PM_TITLES)
        
        if self.query.title_flex == 1:
            # Flexible: senior patterns OR query term in title
            return (
                any(p in title_lower for p in self.SENIOR_PM_TITLES) or
                query_lower in title_lower
            )
        
        # Open: any PM in title
        return "product manager" in title_lower or " pm" in title_lower
```

### 9.2 Greenhouse Scraper

```python
# backend/app/scrapers/greenhouse.py
#
# Greenhouse public API — no auth, fully structured JSON.
# Endpoint: https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true
# The ?content=true param returns the full job description HTML.

import httpx
from typing import List
from .base import BaseScraper, RawJobRecord

class GreenhouseScraper(BaseScraper):
    BASE_URL = "https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true"
    
    async def scrape(self) -> List[RawJobRecord]:
        url = self.BASE_URL.format(slug=self.company.ats_slug)
        results = []
        
        async with httpx.AsyncClient(timeout=20) as client:
            try:
                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()
            except Exception as e:
                return []
            
            for job in data.get("jobs", []):
                title = job.get("title", "")
                if not self.matches_query(title):
                    continue
                
                # Location — always written in Greenhouse data
                offices = job.get("offices", [])
                location = offices[0].get("name", "") if offices else ""
                
                # Work mode — infer from location text
                work_mode, work_mode_written = self._extract_work_mode(
                    job.get("title", ""),
                    location,
                    job.get("content", "")
                )
                
                results.append(RawJobRecord(
                    company_name=self.company.name,
                    company_id=str(self.company.id),
                    exact_role_title=title,
                    source_url=job.get("absolute_url", ""),
                    ats_platform="greenhouse",
                    source_label=f"Greenhouse @ {self.company.name}",
                    location=location,
                    location_written=bool(location),
                    work_mode=work_mode,
                    work_mode_written=work_mode_written,
                    posted_date=job.get("updated_at", "")[:10],
                    raw_description=str(job.get("content", "")),
                    raw_metadata=job,
                ))
        
        return results
    
    def _extract_work_mode(self, title: str, location: str, content: str) -> tuple:
        combined = (title + location + content).lower()
        if "remote" in combined:
            # Check if it's in the structured location field (written) or inferred
            if "remote" in location.lower():
                return "Remote", True
            return "Remote", False
        if "hybrid" in combined:
            return "Hybrid", False
        return "Onsite", False
```

### 9.3 Lever Scraper

```python
# backend/app/scrapers/lever.py
#
# Lever public API — no auth, fully structured JSON.
# Endpoint: https://api.lever.co/v0/postings/{slug}?mode=json

import httpx
from typing import List
from .base import BaseScraper, RawJobRecord
from bs4 import BeautifulSoup

class LeverScraper(BaseScraper):
    BASE_URL = "https://api.lever.co/v0/postings/{slug}?mode=json"
    
    async def scrape(self) -> List[RawJobRecord]:
        url = self.BASE_URL.format(slug=self.company.ats_slug)
        results = []
        
        async with httpx.AsyncClient(timeout=20) as client:
            try:
                resp = await client.get(url)
                resp.raise_for_status()
                jobs = resp.json()
            except Exception:
                return []
            
            for job in jobs:
                title = job.get("text", "")
                if not self.matches_query(title):
                    continue
                
                categories = job.get("categories", {})
                location = categories.get("location", "")
                
                # Extract plain text from HTML description
                raw_html = ""
                for list_item in job.get("lists", []):
                    raw_html += list_item.get("content", "")
                description_plain = BeautifulSoup(raw_html, "html.parser").get_text(" ")
                
                work_mode, work_mode_written = self._extract_work_mode(
                    title, location, description_plain
                )
                
                results.append(RawJobRecord(
                    company_name=self.company.name,
                    company_id=str(self.company.id),
                    exact_role_title=title,
                    source_url=job.get("hostedUrl", ""),
                    ats_platform="lever",
                    source_label=f"Lever @ {self.company.name}",
                    location=location,
                    location_written=bool(location),
                    work_mode=work_mode,
                    work_mode_written=work_mode_written,
                    raw_description=description_plain,
                    raw_metadata=job,
                    team_scope=categories.get("team", ""),
                ))
        
        return results
    
    def _extract_work_mode(self, title, location, content) -> tuple:
        combined = (title + location + content).lower()
        if "remote" in location.lower():
            return "Remote", True
        if "remote" in combined:
            return "Remote", False
        if "hybrid" in combined:
            return "Hybrid", False
        return "Onsite", False
```

### 9.4 Ashby Scraper

```python
# backend/app/scrapers/ashby.py
#
# Ashby public GraphQL API — no auth required.
# POST https://api.ashbyhq.com/posting-api/graphql

import httpx
from typing import List
from .base import BaseScraper, RawJobRecord

GQL_QUERY = """
query JobBoard($slug: String!) {
  jobBoard: ashbyHQJobBoard(organizationHostedJobsPageName: $slug) {
    jobPostings {
      id
      title
      locationName
      isRemote
      publishedDate
      externalLink
      descriptionSocial
      departmentName
    }
  }
}
"""

class AshbyScraper(BaseScraper):
    ENDPOINT = "https://api.ashbyhq.com/posting-api/graphql"
    
    async def scrape(self) -> List[RawJobRecord]:
        results = []
        async with httpx.AsyncClient(timeout=20) as client:
            try:
                resp = await client.post(
                    self.ENDPOINT,
                    json={
                        "operationName": "JobBoard",
                        "variables": {"slug": self.company.ats_slug},
                        "query": GQL_QUERY,
                    }
                )
                data = resp.json()
                postings = (
                    data.get("data", {})
                        .get("jobBoard", {})
                        .get("jobPostings", [])
                )
            except Exception:
                return []
            
            for job in postings:
                title = job.get("title", "")
                if not self.matches_query(title):
                    continue
                
                location = job.get("locationName", "")
                is_remote = job.get("isRemote", False)
                work_mode = "Remote" if is_remote else ("Hybrid" if location else "Onsite")
                
                results.append(RawJobRecord(
                    company_name=self.company.name,
                    company_id=str(self.company.id),
                    exact_role_title=title,
                    source_url=job.get("externalLink", ""),
                    ats_platform="ashby",
                    source_label=f"Ashby @ {self.company.name}",
                    location=location,
                    location_written=bool(location),
                    work_mode=work_mode,
                    work_mode_written=True,  # isRemote field is explicit
                    posted_date=str(job.get("publishedDate", ""))[:10],
                    raw_description=job.get("descriptionSocial", ""),
                    raw_metadata=job,
                    team_scope=job.get("departmentName", ""),
                ))
        
        return results
```

### 9.5 SmartRecruiters Scraper

```python
# backend/app/scrapers/smartrecruiters.py
#
# SmartRecruiters public API — no auth required.
# GET https://api.smartrecruiters.com/v1/companies/{slug}/postings

import httpx
from typing import List
from .base import BaseScraper, RawJobRecord

class SmartRecruitersScraper(BaseScraper):
    BASE_URL = "https://api.smartrecruiters.com/v1/companies/{slug}/postings"
    
    async def scrape(self) -> List[RawJobRecord]:
        results = []
        params = {
            "limit": 100,
            "offset": 0,
        }
        
        async with httpx.AsyncClient(timeout=20) as client:
            while True:
                try:
                    resp = await client.get(
                        self.BASE_URL.format(slug=self.company.ats_slug),
                        params=params
                    )
                    data = resp.json()
                except Exception:
                    break
                
                jobs = data.get("content", [])
                if not jobs:
                    break
                
                for job in jobs:
                    title = job.get("name", "")
                    if not self.matches_query(title):
                        continue
                    
                    loc = job.get("location", {})
                    location = f"{loc.get('city', '')}, {loc.get('country', '')}".strip(", ")
                    
                    results.append(RawJobRecord(
                        company_name=self.company.name,
                        company_id=str(self.company.id),
                        exact_role_title=title,
                        source_url=f"https://careers.smartrecruiters.com/{self.company.ats_slug}/{job.get('id')}",
                        ats_platform="smartrecruiters",
                        source_label=f"SmartRecruiters @ {self.company.name}",
                        location=location,
                        location_written=bool(location),
                        raw_metadata=job,
                    ))
                
                total = data.get("totalFound", 0)
                params["offset"] += params["limit"]
                if params["offset"] >= total:
                    break
        
        return results
```

### 9.6 Generic Direct Scraper (Playwright Fallback)

```python
# backend/app/scrapers/direct/__init__.py
# Generic fallback for companies without a known ATS.
# Loads the careers page, looks for job listings in the DOM.
# Company-specific scrapers override this with precise selectors.

from playwright.async_api import async_playwright
from typing import List
from ..base import BaseScraper, RawJobRecord
import asyncio

class GenericDirectScraper(BaseScraper):
    """
    Fallback for unknown custom career pages.
    Uses heuristic selectors to find job listings.
    Not as reliable as ATS-specific scrapers.
    """
    
    HEURISTIC_SELECTORS = [
        "a[href*='/jobs/']",
        "a[href*='/careers/']",
        "a[href*='/openings/']",
        "[data-job-title]",
        ".job-listing",
        ".careers-listing",
        ".open-positions",
    ]
    
    async def scrape(self) -> List[RawJobRecord]:
        results = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"]
            )
            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
                )
            )
            page = await context.new_page()
            
            try:
                await page.goto(
                    self.company.careers_page_url,
                    wait_until="networkidle",
                    timeout=30000
                )
                await asyncio.sleep(2)
                
                for selector in self.HEURISTIC_SELECTORS:
                    links = await page.query_selector_all(selector)
                    for link in links:
                        try:
                            text = await link.inner_text()
                            href = await link.get_attribute("href")
                            if text and href and self.matches_query(text):
                                full_url = href if href.startswith("http") else \
                                    f"{self.company.website}{href}"
                                results.append(RawJobRecord(
                                    company_name=self.company.name,
                                    company_id=str(self.company.id),
                                    exact_role_title=text.strip(),
                                    source_url=full_url,
                                    ats_platform="direct",
                                    source_label=f"Careers Page @ {self.company.name}",
                                ))
                        except Exception:
                            continue
                    if results:
                        break
            except Exception as e:
                pass
            finally:
                await browser.close()
        
        return results
```

---

## 10. Enrichment Pipeline

### 10.1 Confidence Tagger

```python
# backend/app/enrichment/confidence_tagger.py
#
# Assigns WRITTEN / ESTIMATED / NOT_AVAILABLE to every field.
# This is the most important enrichment module for the UX.

from typing import Optional

WRITTEN = "WRITTEN"
ESTIMATED = "ESTIMATED"
NOT_AVAILABLE = "NOT_AVAILABLE"

def tag_field(
    value,
    is_written: bool = False,
    estimation_possible: bool = True,
    estimated_source: Optional[str] = None
) -> dict:
    """
    Returns a dict: {value, confidence, source}
    """
    if value is None or value == "":
        return {
            "value": None,
            "confidence": NOT_AVAILABLE,
            "source": None,
        }
    if is_written:
        return {
            "value": value,
            "confidence": WRITTEN,
            "source": "Job description",
        }
    if estimation_possible and estimated_source:
        return {
            "value": value,
            "confidence": ESTIMATED,
            "source": estimated_source,
        }
    return {
        "value": value,
        "confidence": ESTIMATED,
        "source": "LLM inference from job description",
    }


def tag_all_fields(raw: RawJobRecord, llm_enrichment: dict, comp_data: dict) -> dict:
    """
    Takes raw scrape + LLM output + comp data.
    Returns full confidence-tagged field dict ready for DB insert.
    """
    return {
        # Role title — always WRITTEN (we scraped it directly)
        "exact_role_title": raw.exact_role_title,
        "exact_role_title_conf": WRITTEN,
        
        # Location — WRITTEN if found in structured ATS data
        "location": raw.location,
        "location_conf": WRITTEN if raw.location_written else ESTIMATED,
        
        # Work mode
        "work_mode": raw.work_mode,
        "work_mode_conf": WRITTEN if raw.work_mode_written else ESTIMATED,
        
        # Experience — WRITTEN if explicitly stated in JD, ESTIMATED otherwise
        "years_exp_min": llm_enrichment.get("years_exp_min"),
        "years_exp_max": llm_enrichment.get("years_exp_max"),
        "years_exp_conf": (
            WRITTEN if raw.exp_written else
            ESTIMATED if llm_enrichment.get("years_exp_min") else
            NOT_AVAILABLE
        ),
        
        # Compensation
        "comp_fixed_min_inr": comp_data.get("fixed_min"),
        "comp_fixed_max_inr": comp_data.get("fixed_max"),
        "comp_fixed_conf": (
            WRITTEN if comp_data.get("from_jd") else
            ESTIMATED if comp_data.get("fixed_min") else
            NOT_AVAILABLE
        ),
        "comp_fixed_source": comp_data.get("fixed_source"),
        
        "comp_total_min_inr": comp_data.get("total_min"),
        "comp_total_max_inr": comp_data.get("total_max"),
        "comp_total_conf": (
            WRITTEN if comp_data.get("from_jd") else
            ESTIMATED if comp_data.get("total_min") else
            NOT_AVAILABLE
        ),
        "comp_total_source": comp_data.get("total_source"),
        
        # Domain / PM type — always ESTIMATED (LLM inference)
        "domain": llm_enrichment.get("domain"),
        "domain_conf": ESTIMATED if llm_enrichment.get("domain") else NOT_AVAILABLE,
        
        "pm_ownership_type": llm_enrichment.get("pm_ownership_type"),
        "pm_ownership_type_conf": ESTIMATED if llm_enrichment.get("pm_ownership_type") else NOT_AVAILABLE,
        
        # Team / reporting — WRITTEN only if explicitly in JD
        "team_scope": llm_enrichment.get("team_scope") or raw.raw_metadata.get("team", ""),
        "team_scope_conf": ESTIMATED,
        
        "reporting_to": llm_enrichment.get("reporting_to"),
        "reporting_to_conf": (
            WRITTEN if llm_enrichment.get("reporting_to_explicit") else
            ESTIMATED if llm_enrichment.get("reporting_to") else
            NOT_AVAILABLE
        ),
        
        # Company signals — always ESTIMATED (from external data)
        "company_stability_score": llm_enrichment.get("company_stability_score"),
        "company_stability_conf": ESTIMATED,
        
        "layoff_risk_score": llm_enrichment.get("layoff_risk_score"),
        "layoff_risk_conf": ESTIMATED,
        "layoff_risk_source": "Recent news + funding data",
        
        "wlb_score": llm_enrichment.get("wlb_score"),
        "wlb_conf": ESTIMATED,
        "wlb_source": "Glassdoor reviews + LLM inference",
        
        # All LLM fields
        **{k: llm_enrichment.get(k) for k in [
            "normalized_level", "brand_value_score", "pm_maturity_score",
            "growth_potential_score", "promotion_velocity", "internal_mobility",
            "international_mobility", "visa_sponsorship", "pressure_level",
            "interview_difficulty", "hiring_bar_strength", "pm_culture_quality",
            "overall_score", "priority_tier", "analysis_notes",
            "funding_status", "profitability_signal", "recent_layoff_signal",
        ]},
    }
```

### 10.2 LLM Classifier (Claude Haiku)

```python
# backend/app/enrichment/llm_classifier.py

import anthropic
import json
import asyncio
from typing import List

CLASSIFICATION_PROMPT = """
You are a senior PM recruiter and compensation specialist. Analyze this job posting.
Return ONLY a valid JSON object. No preamble, no markdown, no explanation.

Company: {company}
Title: {title}
Location: {location}
Description (first 2500 chars):
{description}

Return this exact JSON:
{{
  "normalized_level": "Senior PM | Lead PM | Principal PM | Group PM | Director of Product | Head of Product",
  "domain": "AI | Fintech | SaaS | Consumer | Platform | Infra | Growth | Healthcare | Edtech | Gaming | Other",
  "pm_ownership_type": "0→1 | Growth | Platform | Monetization | Core Product | Infra | Data | B2B | B2C | Other",
  "years_exp_min": <integer or null>,
  "years_exp_max": <integer or null>,
  "exp_explicitly_stated": <true if exp range is literally written in JD, else false>,
  "team_scope": "<1 sentence scope>",
  "reporting_to": "<role or null>",
  "reporting_to_explicit": <true if literally in JD>,
  "brand_value_score": <1-10>,
  "pm_maturity_score": <1-10>,
  "growth_potential_score": <1-10>,
  "promotion_velocity": "<e.g. 2-3 years to Staff PM, or null>",
  "internal_mobility": "Low | Medium | High",
  "international_mobility": "Low | Medium | High",
  "visa_sponsorship": "Yes | No | Possible | Not Applicable",
  "company_stability_score": <1-10>,
  "job_security_score": <1-10>,
  "layoff_risk_score": <1-10>,
  "financial_health_summary": "<2 sentence max>",
  "recent_layoff_signal": <true|false>,
  "funding_status": "<Series X | Public | Bootstrapped | Unknown>",
  "profitability_signal": "Profitable | Loss-making | Breakeven | Unknown",
  "wlb_score": <1-10>,
  "pressure_level": "Low | Medium | High | Very High",
  "interview_difficulty": <1-10>,
  "hiring_bar_strength": "Low | Medium | High | FAANG-level",
  "pm_culture_quality": "<1 sentence>",
  "equity_potential": "Low | Medium | High",
  "equity_source": "JD | Company type inference | Unknown",
  "overall_score": <1-100>,
  "priority_tier": <1|2|3|4>,
  "analysis_notes": "<2 sentence insight for this specific role>"
}}

Scoring guidelines:
- brand_value_score: Google/Stripe/Anthropic=9-10, Razorpay/Swiggy=7-8, unknown startup=3-5
- pm_maturity_score: Does this company have PM career ladders, tooling, dedicated PM orgs?
- overall_score: Weighted: comp_potential×0.3, stability×0.25, brand×0.25, growth×0.2
- priority_tier: 1=Must Target (score 80+), 2=Strong (65-79), 3=Optional (45-64), 4=Low (<45)
- layoff_risk_score: 10=very high risk, 1=very secure
- If description is thin, use your knowledge of this company to fill in scores
"""

class LLMClassifier:
    def __init__(self):
        self.client = anthropic.Anthropic()
    
    async def classify_single(self, record) -> dict:
        prompt = CLASSIFICATION_PROMPT.format(
            company=record.company_name,
            title=record.exact_role_title,
            location=record.location or "",
            description=record.raw_description[:2500],
        )
        try:
            # Note: Anthropic Python SDK is sync; wrap in executor for async
            import asyncio
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.messages.create(
                    model="claude-haiku-4-5-20251001",
                    max_tokens=1200,
                    messages=[{"role": "user", "content": prompt}]
                )
            )
            text = response.content[0].text.strip()
            # Strip markdown code fences
            if "```" in text:
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except Exception as e:
            return {}
    
    async def classify_batch(self, records: List) -> List[dict]:
        BATCH = 5
        results = []
        for i in range(0, len(records), BATCH):
            batch = records[i:i+BATCH]
            enrichments = await asyncio.gather(
                *[self.classify_single(r) for r in batch],
                return_exceptions=True
            )
            results.extend([
                e if isinstance(e, dict) else {}
                for e in enrichments
            ])
            await asyncio.sleep(1)
        return results
```

---

## 11. Search API

### 11.1 Search Engine

```python
# backend/app/search/engine.py
#
# On-demand search: takes a SearchQuery, runs scrapers against
# relevant companies, enriches results, returns them.

import asyncio
from typing import List, AsyncGenerator
from ..scrapers.runner import get_scraper_for_company
from ..enrichment.llm_classifier import LLMClassifier
from ..enrichment.compensation import CompensationEnricher
from ..enrichment.deduplicator import Deduplicator
from ..enrichment.confidence_tagger import tag_all_fields
from ..models.company import Company
from ..models.job import Job
from ..schemas.search import SearchQuery
from sqlmodel import select

class SearchEngine:
    def __init__(self, db_session):
        self.db = db_session
        self.classifier = LLMClassifier()
        self.comp_enricher = CompensationEnricher()
    
    async def get_target_companies(self, query: SearchQuery) -> List[Company]:
        """
        Select companies to scrape based on query context.
        
        Logic:
        - If location is India → prioritize India companies
        - If domain specified → prioritize sector match
        - Always include top 10 by brand_value_score
        - Exclude companies with scrape_error_count > 5 (circuit breaker)
        """
        stmt = (
            select(Company)
            .where(Company.is_active == True)
            .where(Company.scrape_error_count <= 5)
        )
        
        if query.location_flex == 0:  # Strict: exact location match
            stmt = stmt.where(Company.hq_country == "India")
        elif query.location_flex == 1:  # Flexible: India + remote-friendly
            pass  # Include all, filter results by location later
        # Open: scrape everything
        
        companies = (await self.db.exec(stmt)).all()
        return companies
    
    async def run_search(
        self,
        query: SearchQuery,
        progress_callback=None
    ) -> List[Job]:
        """
        Full on-demand search pipeline.
        progress_callback(message: str, company: str, done: int, total: int)
        """
        companies = await self.get_target_companies(query)
        total = len(companies)
        
        # Run scrapers concurrently (but limit to 10 at a time)
        semaphore = asyncio.Semaphore(10)
        all_raw = []
        
        async def scrape_with_sem(company, idx):
            async with semaphore:
                scraper = await get_scraper_for_company(company, query)
                if not scraper:
                    return []
                if progress_callback:
                    await progress_callback(
                        f"Checking {company.name}...",
                        company.name, idx, total
                    )
                try:
                    results = await scraper.scrape()
                    company.last_scraped_at = datetime.utcnow()
                    if not results:
                        company.scrape_error_count = max(0, company.scrape_error_count - 1)
                    return results
                except Exception as e:
                    company.scrape_error_count += 1
                    return []
        
        tasks = [scrape_with_sem(c, i) for i, c in enumerate(companies)]
        results = await asyncio.gather(*tasks)
        for batch in results:
            all_raw.extend(batch)
        
        if progress_callback:
            await progress_callback(f"Found {len(all_raw)} roles. Enriching...", "", total, total)
        
        # Deduplication
        deduplicator = Deduplicator(self.db)
        new_raw = await deduplicator.filter_new(all_raw)
        
        # LLM enrichment
        llm_results = await self.classifier.classify_batch(new_raw)
        
        # Compensation
        comp_results = await self.comp_enricher.enrich_batch(
            list(zip(new_raw, llm_results))
        )
        
        # Build Job records with confidence tags
        jobs = []
        for raw, llm, comp in zip(new_raw, llm_results, comp_results):
            tagged = tag_all_fields(raw, llm, comp)
            job = Job(
                company_id=raw.company_id,
                company_name=raw.company_name,
                source_url=raw.source_url,
                source_url_hash=raw.source_url_hash,
                ats_platform=raw.ats_platform,
                source_label=raw.source_label,
                raw_description=raw.raw_description,
                raw_metadata=raw.raw_metadata,
                **tagged
            )
            self.db.add(job)
            jobs.append(job)
        
        await self.db.commit()
        return jobs
```

### 11.2 Flex Engine

```python
# backend/app/search/flexibility.py
#
# Translates flex settings into query expansion.

def expand_title_by_flex(title: str, flex: int) -> List[str]:
    """
    flex=0 (Strict): exact title tokens only
    flex=1 (Flexible): add common alternates
    flex=2 (Open): all PM seniority variants
    """
    TITLE_EXPANSIONS = {
        "senior product manager": {
            0: ["senior product manager", "sr product manager", "sr. product manager"],
            1: ["senior product manager", "sr pm", "lead product manager", "principal product manager"],
            2: ["senior", "lead", "principal", "group", "staff", "head of product", "director of product"],
        },
        "principal product manager": {
            0: ["principal product manager", "principal pm"],
            1: ["principal product manager", "staff product manager", "lead product manager"],
            2: ["senior", "lead", "principal", "group", "staff", "director"],
        },
        "group product manager": {
            0: ["group product manager", "group pm", "gpm"],
            1: ["group product manager", "director of product", "principal product manager"],
            2: ["senior", "lead", "principal", "group", "director", "head"],
        },
    }
    title_lower = title.lower()
    for key, expansions in TITLE_EXPANSIONS.items():
        if key in title_lower:
            return expansions.get(flex, expansions[2])
    return [title]


def expand_location_by_flex(location: str, flex: int) -> List[str]:
    LOCATION_EXPANSIONS = {
        "bengaluru": {
            0: ["bengaluru", "bangalore"],
            1: ["bengaluru", "bangalore", "remote india"],
            2: ["bengaluru", "bangalore", "remote india", "india", "remote"],
        },
        "hyderabad": {
            0: ["hyderabad"],
            1: ["hyderabad", "remote india"],
            2: ["hyderabad", "remote india", "india", "remote"],
        },
        "mumbai": {
            0: ["mumbai"],
            1: ["mumbai", "remote india"],
            2: ["mumbai", "remote india", "india", "remote"],
        },
    }
    location_lower = location.lower()
    for key, expansions in LOCATION_EXPANSIONS.items():
        if key in location_lower:
            return expansions.get(flex, [location, "remote india", "india"])
    return [location]
```

---

## 12. Backend API — All Endpoints

```python
# backend/app/api/search.py

from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from ..database import get_session
from ..search.engine import SearchEngine
from ..schemas.search import SearchRequest, SearchResponse
import asyncio
import json

router = APIRouter()

@router.post("/", response_model=SearchResponse)
async def run_search(
    request: SearchRequest,
    session=Depends(get_session)
):
    """
    Main search endpoint. Triggers live scrape and returns results.
    Use /stream for real-time progress.
    """
    engine = SearchEngine(db_session=session)
    jobs = await engine.run_search(query=request.to_search_query())
    return SearchResponse(
        total=len(jobs),
        jobs=[JobResponse.from_orm(j) for j in jobs]
    )


@router.post("/stream")
async def stream_search(
    request: SearchRequest,
    session=Depends(get_session)
):
    """
    SSE endpoint for live scrape progress.
    Frontend connects here to show the progress bar as scrapers run.
    
    Event format:
    data: {"type": "progress", "message": "Checking Razorpay...", "company": "Razorpay", "done": 3, "total": 45}
    data: {"type": "result", "job": {...}}
    data: {"type": "complete", "total": 12}
    """
    engine = SearchEngine(db_session=session)
    queue = asyncio.Queue()
    
    async def on_progress(message, company, done, total):
        await queue.put({"type": "progress", "message": message,
                         "company": company, "done": done, "total": total})
    
    async def run():
        jobs = await engine.run_search(
            query=request.to_search_query(),
            progress_callback=on_progress
        )
        for job in jobs:
            await queue.put({"type": "result", "job": job.dict()})
        await queue.put({"type": "complete", "total": len(jobs)})
    
    async def event_generator():
        asyncio.create_task(run())
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=60)
                yield f"data: {json.dumps(event)}\n\n"
                if event["type"] == "complete":
                    break
            except asyncio.TimeoutError:
                yield "data: {\"type\": \"keepalive\"}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )


@router.get("/jobs", response_model=JobListResponse)
async def get_jobs(
    # All filters
    country: Optional[str] = None,
    city: Optional[str] = None,
    level: Optional[str] = None,
    domain: Optional[str] = None,
    work_mode: Optional[str] = None,
    priority_tier: Optional[int] = None,
    min_score: Optional[int] = None,
    company: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
    sort_by: str = "overall_score",
    sort_dir: str = "desc",
    session=Depends(get_session)
):
    """Returns cached/persisted job results with filters."""
    ...


@router.get("/export/csv")
async def export_csv(session=Depends(get_session)):
    """Stream full results as CSV download."""
    ...


@router.get("/companies")
async def list_companies(session=Depends(get_session)):
    """Returns the company registry for the 'Companies' page."""
    ...
```

---

## 13. Frontend — Design System

### Design Direction

VacancyBible is a **precision tool for serious professionals**. The aesthetic should
communicate exactness, depth, and trust — not excitement or gamification.

```
Tone:        Editorial meets data terminal. Refined, dense, precise.
Palette:     Near-black background (#0C0C0F), warm white text (#F5F0E8),
             sage green for WRITTEN (#4CAF7D / #1A3D2B bg),
             amber for ESTIMATED (#D4924A / #3D2A14 bg),
             grey for NOT_AVAILABLE (#6B7280 / transparent bg).
             Indigo accent (#5B6EF5) for interactive elements.
Typography:  Display: "DM Serif Display" (editorial gravitas)
             Body: "IBM Plex Mono" (data terminal feel, perfect for tables)
             UI: "DM Sans" (clean labels, navigation)
Motion:      Subtle. Table rows fade in staggered. Progress bar slides smooth.
             Confidence badges pulse once on reveal.
Layout:      Full-bleed dark. Search form centered with ample breathing room.
             Results in a dense but readable table. Right panel slides in.
```

### Tailwind Config Extension

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Base
        "vb-bg":          "#0C0C0F",
        "vb-surface":     "#141418",
        "vb-border":      "#1E1E26",
        "vb-text":        "#F5F0E8",
        "vb-muted":       "#7A7A8C",
        
        // Confidence badges
        "written-bg":     "#1A3D2B",
        "written-text":   "#4CAF7D",
        "written-border": "#2A5E42",
        
        "estimated-bg":   "#3D2A14",
        "estimated-text": "#D4924A",
        "estimated-border":"#5E4220",
        
        // Accent
        "vb-accent":      "#5B6EF5",
        "vb-accent-dim":  "#1E2456",
      },
      fontFamily: {
        display: ["DM Serif Display", "Georgia", "serif"],
        mono:    ["IBM Plex Mono", "Courier New", "monospace"],
        sans:    ["DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
}
```

### Global CSS

```css
/* frontend/app/globals.css */

@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --bg: #0C0C0F;
  --surface: #141418;
  --border: #1E1E26;
  --text: #F5F0E8;
  --muted: #7A7A8C;
  --accent: #5B6EF5;
  
  --written:    #4CAF7D;
  --estimated:  #D4924A;
  --na:         #4B5563;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Table mono numbers */
.mono { font-family: 'IBM Plex Mono', monospace; }

/* Confidence badge base */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-family: 'IBM Plex Mono', monospace;
  border: 1px solid transparent;
}

.badge-written {
  background: #1A3D2B;
  color: #4CAF7D;
  border-color: #2A5E42;
}

.badge-estimated {
  background: #3D2A14;
  color: #D4924A;
  border-color: #5E4220;
}

.badge-na {
  color: #4B5563;
}

/* Table row animation */
@keyframes rowReveal {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.result-row {
  animation: rowReveal 0.3s ease forwards;
}
```

---

## 14. Frontend — Pages & Components

### 14.1 Homepage — Search Form

```tsx
// frontend/app/page.tsx

import { SearchForm } from "@/components/search/SearchForm"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0C0C0F] flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 border-b border-[#1E1E26]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl text-[#F5F0E8]">VacancyBible</span>
            <span className="text-xs font-mono text-[#7A7A8C] border border-[#1E1E26] px-2 py-0.5 rounded">
              beta
            </span>
          </div>
          <nav className="flex gap-6 text-sm text-[#7A7A8C]">
            <a href="#" className="hover:text-[#F5F0E8] transition-colors">How it works</a>
            <a href="#" className="hover:text-[#F5F0E8] transition-colors">Companies</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-2xl w-full">
          <h1 className="font-display text-5xl text-[#F5F0E8] leading-tight mb-3">
            Find the role.<br />
            <span className="italic text-[#7A7A8C]">Cut the noise.</span>
          </h1>
          <p className="text-[#7A7A8C] mb-12 leading-relaxed">
            We scan company career pages directly — not job boards.
            Every result links to the original source.
            Every data point is labeled: written, estimated, or unavailable.
          </p>
          
          <SearchForm />
        </div>
      </div>

      {/* Footer note */}
      <footer className="px-8 py-4 border-t border-[#1E1E26] text-center">
        <p className="text-xs text-[#4B5563] font-mono">
          VacancyBible does not host job listings. All results link to original sources.
        </p>
      </footer>
    </main>
  )
}
```

### 14.2 Search Form with Flexibility Bar

```tsx
// frontend/components/search/SearchForm.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FlexSlider } from "@/components/ui/FlexSlider"
import { useSearchStore } from "@/lib/search-store"

const FLEX_LABELS = ["Strict", "Flexible", "Open"]

interface SearchField {
  key: string
  label: string
  placeholder: string
  type: "text" | "select" | "range"
  options?: string[]
}

const SEARCH_FIELDS: SearchField[] = [
  {
    key: "title",
    label: "Role",
    placeholder: "e.g. Senior Product Manager",
    type: "text",
  },
  {
    key: "location",
    label: "Location",
    placeholder: "e.g. Bengaluru, Remote India",
    type: "text",
  },
  {
    key: "experience",
    label: "Experience",
    placeholder: "e.g. 5–9 years",
    type: "text",
  },
  {
    key: "package",
    label: "Package",
    placeholder: "e.g. ₹40L+ total comp",
    type: "text",
  },
  {
    key: "domain",
    label: "Domain",
    placeholder: "e.g. Fintech, AI, SaaS",
    type: "select",
    options: ["Any", "AI", "Fintech", "SaaS", "Consumer", "Platform", "Infra", "Growth", "Healthcare", "Edtech"],
  },
]

export function SearchForm() {
  const router = useRouter()
  const { setQuery } = useSearchStore()
  
  const [values, setValues] = useState<Record<string, string>>({})
  const [flex, setFlex] = useState<Record<string, number>>({
    title: 1,
    location: 1,
    experience: 1,
    package: 2,
    domain: 2,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit() {
    setIsSubmitting(true)
    const query = {
      title: values.title || "",
      location: values.location || "",
      experience: values.experience || "",
      package: values.package || "",
      domain: values.domain || "Any",
      flex,
    }
    setQuery(query)
    router.push("/results")
  }

  return (
    <div className="space-y-2">
      {/* Column headers */}
      <div className="flex items-center gap-3 px-1 mb-3">
        <div className="flex-1">
          <span className="text-xs font-mono text-[#4B5563] uppercase tracking-wider">
            What you want
          </span>
        </div>
        <div className="w-48">
          <span className="text-xs font-mono text-[#4B5563] uppercase tracking-wider">
            How flexible
          </span>
        </div>
      </div>

      {/* Fields */}
      {SEARCH_FIELDS.map((field) => (
        <div
          key={field.key}
          className="flex items-center gap-3 p-4 bg-[#141418] border border-[#1E1E26] rounded-xl
                     hover:border-[#2A2A36] transition-colors group"
        >
          {/* Label */}
          <div className="w-24 shrink-0">
            <label className="text-xs font-mono text-[#7A7A8C] uppercase tracking-wider">
              {field.label}
            </label>
          </div>

          {/* Input */}
          <div className="flex-1">
            {field.type === "select" ? (
              <select
                value={values[field.key] || ""}
                onChange={(e) => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                className="w-full bg-transparent text-[#F5F0E8] text-sm outline-none
                           appearance-none cursor-pointer"
              >
                <option value="">Any</option>
                {field.options?.slice(1).map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder={field.placeholder}
                value={values[field.key] || ""}
                onChange={(e) => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                className="w-full bg-transparent text-[#F5F0E8] placeholder:text-[#3A3A4A]
                           text-sm outline-none font-mono"
              />
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-[#1E1E26]" />

          {/* Flex slider */}
          <div className="w-48 shrink-0">
            <FlexSlider
              value={flex[field.key]}
              onChange={(v) => setFlex(f => ({ ...f, [field.key]: v }))}
            />
          </div>
        </div>
      ))}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !values.title}
        className="w-full mt-4 py-4 bg-[#5B6EF5] hover:bg-[#4A5DE4] text-white rounded-xl
                   font-sans font-medium text-sm transition-all
                   disabled:opacity-40 disabled:cursor-not-allowed
                   relative overflow-hidden"
      >
        {isSubmitting ? (
          <span className="font-mono text-sm animate-pulse">Scanning career pages...</span>
        ) : (
          "Search VacancyBible →"
        )}
      </button>

      {/* Flex legend */}
      <p className="text-center text-xs text-[#4B5563] font-mono pt-2">
        Strict = exact match · Flexible = close variants · Open = broad
      </p>
    </div>
  )
}
```

### 14.3 FlexSlider Component

```tsx
// frontend/components/ui/FlexSlider.tsx
// 3-state toggle: Strict (0) | Flexible (1) | Open (2)

"use client"

interface FlexSliderProps {
  value: number      // 0 | 1 | 2
  onChange: (v: number) => void
}

const STATES = [
  { label: "Strict",   color: "bg-[#4CAF7D] text-[#0C0C0F]" },
  { label: "Flexible", color: "bg-[#5B6EF5] text-white" },
  { label: "Open",     color: "bg-[#D4924A] text-[#0C0C0F]" },
]

export function FlexSlider({ value, onChange }: FlexSliderProps) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-[#2A2A36] h-7">
      {STATES.map((state, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`
            flex-1 text-[10px] font-mono font-medium tracking-wide
            transition-all duration-150
            ${value === i
              ? state.color
              : "text-[#4B5563] hover:text-[#7A7A8C] bg-transparent"
            }
          `}
        >
          {state.label}
        </button>
      ))}
    </div>
  )
}
```

### 14.4 Confidence Badge Component

```tsx
// frontend/components/ui/ConfidenceBadge.tsx
// The single most important UI component in VacancyBible.
// Every data point carries one of these.

"use client"

import { useState } from "react"

type Confidence = "WRITTEN" | "ESTIMATED" | "NOT_AVAILABLE"

interface ConfidenceBadgeProps {
  confidence: Confidence
  source?: string    // Shown in tooltip for ESTIMATED
  size?: "sm" | "xs"
}

const CONFIG = {
  WRITTEN: {
    label: "Written",
    icon: "✓",
    className: "badge-written",
    tooltip: "This information appears verbatim in the job description.",
  },
  ESTIMATED: {
    label: "Est.",
    icon: "~",
    className: "badge-estimated",
    tooltip: null,  // Dynamic: shows source
  },
  NOT_AVAILABLE: {
    label: null,
    icon: null,
    className: "badge-na",
    tooltip: "This information is not available and cannot be reliably estimated.",
  },
}

export function ConfidenceBadge({ confidence, source, size = "xs" }: ConfidenceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const config = CONFIG[confidence]
  
  if (confidence === "NOT_AVAILABLE") {
    return (
      <span
        className="text-[#4B5563] text-xs font-mono cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title="Not available"
      >
        —
      </span>
    )
  }
  
  const tooltipText = confidence === "ESTIMATED" && source
    ? `Estimated from: ${source}`
    : config.tooltip
  
  return (
    <span className="relative inline-flex items-center">
      <span
        className={`badge ${config.className} cursor-help`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {config.icon} {config.label}
      </span>
      
      {showTooltip && tooltipText && (
        <span className="
          absolute bottom-full left-0 mb-1.5 z-50
          bg-[#1E1E26] border border-[#2A2A36] text-[#F5F0E8]
          text-xs font-mono rounded-lg px-3 py-2 w-56
          shadow-xl pointer-events-none
        ">
          {tooltipText}
        </span>
      )}
    </span>
  )
}
```

### 14.5 FieldValue — Data + Badge Pair

```tsx
// frontend/components/ui/FieldValue.tsx
// Renders a value alongside its confidence badge.
// Used everywhere data is shown.

import { ConfidenceBadge } from "./ConfidenceBadge"

interface FieldValueProps {
  value: string | number | null | undefined
  confidence: "WRITTEN" | "ESTIMATED" | "NOT_AVAILABLE"
  source?: string
  format?: "text" | "currency" | "score"
  className?: string
}

export function FieldValue({
  value,
  confidence,
  source,
  format = "text",
  className = "",
}: FieldValueProps) {
  const displayValue = (() => {
    if (value == null || value === "") return null
    if (format === "currency") return `₹${value}L`
    if (format === "score") return `${value}/10`
    return String(value)
  })()
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-[#F5F0E8] text-sm font-mono">
        {displayValue ?? <span className="text-[#4B5563]">—</span>}
      </span>
      <ConfidenceBadge confidence={confidence} source={source} />
    </div>
  )
}
```

### 14.6 Results Page with Progress Stream

```tsx
// frontend/app/results/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useSearchStore } from "@/lib/search-store"
import { ProgressStream } from "@/components/results/ProgressStream"
import { ResultsTable } from "@/components/results/ResultsTable"
import { SearchMeta } from "@/components/layout/SearchMeta"

export default function ResultsPage() {
  const { query } = useSearchStore()
  const [jobs, setJobs] = useState<Job[]>([])
  const [status, setStatus] = useState<"idle"|"running"|"complete">("idle")
  const [progress, setProgress] = useState({ message: "", done: 0, total: 0 })
  
  useEffect(() => {
    if (!query) return
    setStatus("running")
    setJobs([])
    
    // Connect to SSE stream
    const params = new URLSearchParams({ query: JSON.stringify(query) })
    const eventSource = new EventSource(`/api/search/stream?${params}`)
    
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data)
      
      if (data.type === "progress") {
        setProgress({ message: data.message, done: data.done, total: data.total })
      }
      if (data.type === "result") {
        setJobs(prev => [...prev, data.job])
      }
      if (data.type === "complete") {
        setStatus("complete")
        eventSource.close()
      }
    }
    
    eventSource.onerror = () => {
      setStatus("complete")
      eventSource.close()
    }
    
    return () => eventSource.close()
  }, [query])
  
  return (
    <main className="min-h-screen bg-[#0C0C0F]">
      <header className="sticky top-0 z-40 px-6 py-4 border-b border-[#1E1E26] bg-[#0C0C0F]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="font-display text-lg text-[#F5F0E8]">VacancyBible</a>
          <SearchMeta jobs={jobs} status={status} query={query} />
        </div>
      </header>
      
      {/* Progress bar — shown while running */}
      {status === "running" && (
        <ProgressStream progress={progress} jobsFoundSoFar={jobs.length} />
      )}
      
      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {jobs.length > 0 ? (
          <ResultsTable jobs={jobs} isLoading={status === "running"} />
        ) : status === "complete" ? (
          <NoResults query={query} />
        ) : null}
      </div>
    </main>
  )
}
```

### 14.7 Progress Stream Component

```tsx
// frontend/components/results/ProgressStream.tsx

interface ProgressProps {
  progress: { message: string; done: number; total: number }
  jobsFoundSoFar: number
}

export function ProgressStream({ progress, jobsFoundSoFar }: ProgressProps) {
  const pct = progress.total > 0 ? (progress.done / progress.total) * 100 : 0
  
  return (
    <div className="border-b border-[#1E1E26] bg-[#141418]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-[#7A7A8C] animate-pulse">
            {progress.message || "Scanning career pages..."}
          </span>
          <div className="flex items-center gap-4">
            {jobsFoundSoFar > 0 && (
              <span className="text-xs font-mono text-[#4CAF7D]">
                {jobsFoundSoFar} found so far
              </span>
            )}
            <span className="text-xs font-mono text-[#4B5563]">
              {progress.done} / {progress.total} sources
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-0.5 bg-[#1E1E26] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5B6EF5] transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
```

### 14.8 Results Table

```tsx
// frontend/components/results/ResultsTable.tsx

"use client"

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table"
import { useState } from "react"
import { Job } from "@/lib/types"
import { FieldValue } from "@/components/ui/FieldValue"
import { SourceLink } from "@/components/ui/SourceLink"
import { ResultDetailPanel } from "./ResultDetailPanel"

const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "company_name",
    header: "Company",
    cell: ({ row }) => (
      <div>
        <div className="font-sans font-semibold text-[#F5F0E8] text-sm">
          {row.original.company_name}
        </div>
        <div className="text-[#7A7A8C] text-xs font-mono mt-0.5">
          {row.original.domain}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "exact_role_title",
    header: "Role",
    cell: ({ row }) => (
      <div>
        <div className="text-[#F5F0E8] text-sm">{row.original.exact_role_title}</div>
        <div className="text-[#7A7A8C] text-xs font-mono mt-0.5">
          {row.original.pm_ownership_type}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <FieldValue
        value={row.original.location}
        confidence={row.original.location_conf}
      />
    ),
  },
  {
    accessorKey: "work_mode",
    header: "Mode",
    cell: ({ row }) => (
      <FieldValue
        value={row.original.work_mode}
        confidence={row.original.work_mode_conf}
      />
    ),
  },
  {
    accessorKey: "comp_total_max_inr",
    header: "Max TC",
    cell: ({ row }) => {
      const job = row.original
      if (job.comp_total_max_inr) {
        return (
          <FieldValue
            value={job.comp_total_max_inr}
            confidence={job.comp_total_conf}
            source={job.comp_total_source}
            format="currency"
          />
        )
      }
      if (job.comp_total_max_usd) {
        return (
          <FieldValue
            value={`$${job.comp_total_max_usd}K`}
            confidence={job.comp_total_conf}
            source={job.comp_total_source}
          />
        )
      }
      return <FieldValue value={null} confidence="NOT_AVAILABLE" />
    },
  },
  {
    accessorKey: "company_stability_score",
    header: "Stability",
    cell: ({ row }) => (
      <FieldValue
        value={row.original.company_stability_score}
        confidence={row.original.company_stability_conf}
        format="score"
      />
    ),
  },
  {
    accessorKey: "overall_score",
    header: "Score",
    cell: ({ getValue }) => {
      const s = getValue() as number
      const color = s >= 80 ? "#4CAF7D" : s >= 60 ? "#5B6EF5" : s >= 40 ? "#D4924A" : "#4B5563"
      return (
        <span
          className="font-mono font-bold text-sm"
          style={{ color }}
        >
          {s}
        </span>
      )
    },
  },
  {
    id: "source",
    header: "Source",
    cell: ({ row }) => (
      <SourceLink
        url={row.original.source_url}
        label={row.original.source_label}
      />
    ),
  },
]

export function ResultsTable({ jobs, isLoading }: { jobs: Job[]; isLoading: boolean }) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [sorting, setSorting] = useState([{ id: "overall_score", desc: true }])

  const table = useReactTable({
    data: jobs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  
  return (
    <>
      <div className="rounded-xl border border-[#1E1E26] overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#141418] border-b border-[#1E1E26]">
              {table.getFlatHeaders().map(header => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="px-4 py-3 text-left text-[10px] font-mono font-medium
                             text-[#4B5563] uppercase tracking-widest
                             cursor-pointer hover:text-[#7A7A8C] transition-colors
                             select-none whitespace-nowrap"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{asc: " ↑", desc: " ↓"}[header.column.getIsSorted() as string] ?? ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className="result-row border-b border-[#1E1E26]/50 hover:bg-[#141418]
                           cursor-pointer transition-colors"
                style={{ animationDelay: `${i * 30}ms` }}
                onClick={() => setSelectedJob(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {jobs.length === 0 && isLoading && (
          <div className="py-16 text-center">
            <div className="text-[#4B5563] font-mono text-sm animate-pulse">
              Scanning career pages...
            </div>
          </div>
        )}
      </div>
      
      {selectedJob && (
        <ResultDetailPanel
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  )
}
```

### 14.9 Source Link Component

```tsx
// frontend/components/ui/SourceLink.tsx
// "View Original" link — always present on every result row.
// This is a core principle: we always point back to the source.

interface SourceLinkProps {
  url: string
  label: string  // e.g. "Greenhouse @ Razorpay"
}

export function SourceLink({ url, label }: SourceLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}  // Don't open detail panel
      className="inline-flex items-center gap-1.5 px-2.5 py-1
                 border border-[#1E1E26] rounded-lg
                 text-[10px] font-mono text-[#7A7A8C]
                 hover:border-[#5B6EF5] hover:text-[#5B6EF5]
                 transition-all group whitespace-nowrap"
    >
      <span className="group-hover:translate-x-0.5 transition-transform">
        {label}
      </span>
      <span className="opacity-50 group-hover:opacity-100">↗</span>
    </a>
  )
}
```

### 14.10 Result Detail Panel

```tsx
// frontend/components/results/ResultDetailPanel.tsx
// Full detail slide-in panel when a row is clicked.
// Every field shows value + confidence badge + source.

"use client"

import { Job } from "@/lib/types"
import { FieldValue } from "@/components/ui/FieldValue"
import { SourceLink } from "@/components/ui/SourceLink"

export function ResultDetailPanel({ job, onClose }: { job: Job; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      
      <aside className="
        relative w-[600px] bg-[#0C0C0F] border-l border-[#1E1E26]
        overflow-y-auto flex flex-col
        animate-[slideIn_0.2s_ease]
      ">
        {/* Panel header */}
        <div className="sticky top-0 z-10 bg-[#0C0C0F]/95 backdrop-blur
                        border-b border-[#1E1E26] px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl text-[#F5F0E8]">{job.company_name}</h2>
              <p className="text-[#7A7A8C] text-sm mt-0.5">{job.exact_role_title}</p>
            </div>
            <div className="flex items-center gap-3">
              <SourceLink url={job.source_url} label="View Original ↗" />
              <button
                onClick={onClose}
                className="text-[#4B5563] hover:text-[#F5F0E8] transition-colors
                           font-mono text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
        
        {/* Panel body */}
        <div className="flex-1 px-6 py-6 space-y-8">
          
          {/* Data confidence legend — shown once at top of panel */}
          <div className="flex gap-4 p-3 bg-[#141418] rounded-lg border border-[#1E1E26]">
            <div className="flex items-center gap-2">
              <span className="badge badge-written">✓ Written</span>
              <span className="text-[10px] text-[#4B5563] font-mono">In the job description</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-estimated">~ Est.</span>
              <span className="text-[10px] text-[#4B5563] font-mono">Estimated from other sources</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4B5563] font-mono text-sm">—</span>
              <span className="text-[10px] text-[#4B5563] font-mono">Not available</span>
            </div>
          </div>
          
          {/* Position */}
          <Section title="Position">
            <Grid>
              <LabeledField label="Level" value={job.normalized_level} conf={job.normalized_level_conf} />
              <LabeledField label="Location" value={job.location} conf={job.location_conf} />
              <LabeledField label="Work Mode" value={job.work_mode} conf={job.work_mode_conf} />
              <LabeledField label="Domain" value={job.domain} conf={job.domain_conf} />
              <LabeledField label="PM Type" value={job.pm_ownership_type} conf={job.pm_ownership_type_conf} />
              <LabeledField
                label="Experience"
                value={job.years_exp_min ? `${job.years_exp_min}–${job.years_exp_max} years` : null}
                conf={job.years_exp_conf}
              />
              <LabeledField label="Team Scope" value={job.team_scope} conf={job.team_scope_conf} />
              <LabeledField label="Reports To" value={job.reporting_to} conf={job.reporting_to_conf} />
              <LabeledField label="Team Size" value={job.team_size} conf={job.team_size_conf} />
            </Grid>
          </Section>
          
          {/* Compensation */}
          <Section title="Compensation">
            <div className="space-y-3 bg-[#141418] rounded-xl p-4 border border-[#1E1E26]">
              <CompRow
                label="Fixed (Annual)"
                value={job.comp_fixed_min_inr ? `₹${job.comp_fixed_min_inr}L – ₹${job.comp_fixed_max_inr}L` : null}
                conf={job.comp_fixed_conf}
                source={job.comp_fixed_source}
              />
              <CompRow
                label="Total Comp"
                value={job.comp_total_min_inr ? `₹${job.comp_total_min_inr}L – ₹${job.comp_total_max_inr}L` : null}
                conf={job.comp_total_conf}
                source={job.comp_total_source}
                highlight
              />
              <CompRow
                label="Equity"
                value={job.equity_potential}
                conf={job.equity_conf}
                source={job.equity_source}
              />
              <CompRow
                label="Bonus"
                value={job.bonus_structure}
                conf={job.bonus_conf}
              />
            </div>
          </Section>
          
          {/* Scores */}
          <Section title="Intelligence Scores">
            <div className="space-y-3">
              {[
                { label: "Brand Value", val: job.brand_value_score, conf: job.brand_value_conf, max: 10 },
                { label: "PM Maturity", val: job.pm_maturity_score, conf: job.pm_maturity_conf, max: 10 },
                { label: "Company Stability", val: job.company_stability_score, conf: job.company_stability_conf, max: 10 },
                { label: "Growth Potential", val: job.growth_potential_score, conf: job.growth_potential_conf, max: 10 },
                { label: "Work-Life Balance", val: job.wlb_score, conf: job.wlb_conf, max: 10 },
                { label: "Layoff Risk", val: job.layoff_risk_score, conf: "ESTIMATED", max: 10, invert: true },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-4">
                  <span className="text-xs font-mono text-[#7A7A8C] w-36 shrink-0">{s.label}</span>
                  <div className="flex-1 h-1 bg-[#1E1E26] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${((s.val ?? 0) / s.max) * 100}%`,
                        background: s.invert ? "#D4924A" : "#5B6EF5",
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-[#F5F0E8] w-8 text-right">
                    {s.val ?? "—"}
                  </span>
                  <div className="w-14">
                    {/* Confidence badge for each score */}
                    <ConfidenceBadge confidence={s.conf || "NOT_AVAILABLE"} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
          
          {/* Analysis */}
          {job.analysis_notes && (
            <Section title="Analysis">
              <p className="text-[#7A7A8C] text-sm leading-relaxed font-mono">
                {job.analysis_notes}
              </p>
            </Section>
          )}
        </div>
      </aside>
    </div>
  )
}

// Sub-components
function Section({ title, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-[10px] font-mono font-medium text-[#4B5563] uppercase tracking-widest">
          {title}
        </h3>
        <div className="flex-1 h-px bg-[#1E1E26]" />
      </div>
      {children}
    </div>
  )
}

function Grid({ children }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
}

function LabeledField({ label, value, conf, source = undefined }) {
  return (
    <div>
      <div className="text-[10px] font-mono text-[#4B5563] uppercase tracking-wider mb-1">
        {label}
      </div>
      <FieldValue value={value} confidence={conf} source={source} />
    </div>
  )
}

function CompRow({ label, value, conf, source = undefined, highlight = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-mono text-[#7A7A8C]">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-mono ${highlight ? "text-[#4CAF7D] font-medium" : "text-[#F5F0E8]"}`}>
          {value ?? <span className="text-[#4B5563]">—</span>}
        </span>
        <ConfidenceBadge confidence={conf} source={source} />
      </div>
    </div>
  )
}
```

---

## 15. Environment Variables

```bash
# backend/.env

DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/vacancybible

ANTHROPIC_API_KEY=sk-ant-...

# Optional: residential proxy for protected career pages
PROXY_HOST=
PROXY_PORT=
PROXY_USER=
PROXY_PASS=

ADMIN_SECRET_KEY=your-long-random-string

ENVIRONMENT=production
LOG_LEVEL=INFO
CORS_ORIGINS=https://vacancybible.com,http://localhost:3000
```

```bash
# frontend/.env.local

NEXT_PUBLIC_API_URL=https://your-backend.railway.app
API_URL=https://your-backend.railway.app
```

---

## 16. Deployment

### Railway (Backend)

```toml
# railway.toml
[build]
builder = "DOCKERFILE"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1"
healthcheckPath = "/api/health"
restartPolicyType = "ON_FAILURE"
```

```dockerfile
# Dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    chromium libglib2.0-0 libnss3 libnspr4 libatk1.0-0 \
    libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN playwright install chromium

COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```
requirements.txt:
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlmodel==0.0.14
asyncpg==0.29.0
alembic==1.13.1
httpx==0.26.0
playwright==1.41.1
anthropic==0.18.1
python-dotenv==1.0.0
pydantic-settings==2.1.0
beautifulsoup4==4.12.3
```

### Vercel (Frontend)

Standard Next.js 14 deploy. Set `NEXT_PUBLIC_API_URL` in Vercel dashboard.

### Supabase (Database)

1. Create project → run SQL DDL from Section 6 → copy connection string
2. Use the Transaction pooler URL for Railway

---

## 17. Error Handling

| Failure | Behaviour |
|---|---|
| ATS API returns 404 | Log + skip company + increment `scrape_error_count` |
| ATS slug changed | Flag company as `needs_review`, continue |
| Playwright timeout | Retry once with 10s extra, then skip |
| LLM returns invalid JSON | Retry once, then use empty dict, fill NOT_AVAILABLE |
| DB write fails | Log full traceback, return results already enriched |
| All scrapers fail | Return empty array with error message to frontend |
| SSE connection drops | Frontend reconnects automatically (EventSource behaviour) |

Circuit breaker: if `scrape_error_count > 5`, company is skipped until manually reset.
Admin endpoint: `POST /api/admin/reset-company/{slug}` resets count.

---

*End of VacancyBible specification.*
*Cursor: build all modules simultaneously. Start with database models → scrapers → enrichment → API → frontend.*
