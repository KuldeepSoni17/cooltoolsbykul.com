# VacancyBible — Discovery Fix + Caching + Local Deploy
### Three things: fix slug discovery, add caching, run locally first.

---

## IMPORTANT — LOCAL FIRST

Do everything in this prompt for local development first.
Do NOT touch Vercel, Railway, or any production config until instructed.

When done, I will test locally, confirm it works, then we push to production.

Local URLs will be:
- Frontend: http://localhost:3000
- Backend (if separate): http://localhost:8000
- Supabase: use the same Supabase project (it's already cloud, shared between local and prod)

---

## PART 1 — FIX SLUG DISCOVERY (root cause of 404s and empty results)

The problem: slugs in registryData.ts were typed manually and most are wrong.
Greenhouse returns 404 for wrong slugs. Lever returns HTTP 200 with empty `[]`.
Both fail silently. Only Ashby works because those slugs happen to be correct.

The fix: pull slugs directly from each ATS's own source of truth.
Never type a slug manually again.

### 1a — Supabase: create the companies table

Run this in your Supabase SQL editor right now:

```sql
-- Companies discovered from ATS sitemaps
CREATE TABLE IF NOT EXISTS companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL,
  name            TEXT NOT NULL,
  ats_platform    TEXT NOT NULL,
  careers_url     TEXT,
  slug_status     TEXT DEFAULT 'unknown',
  slug_checked_at TIMESTAMPTZ,
  job_count_last  INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, ats_platform)
);

CREATE INDEX IF NOT EXISTS idx_companies_platform ON companies(ats_platform);
CREATE INDEX IF NOT EXISTS idx_companies_status   ON companies(slug_status);
CREATE INDEX IF NOT EXISTS idx_companies_active   ON companies(is_active);

-- Jobs table with caching fields
CREATE TABLE IF NOT EXISTS jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url          TEXT NOT NULL,
  source_url_hash     TEXT UNIQUE NOT NULL,
  company_slug        TEXT,
  company_name        TEXT NOT NULL,
  ats_platform        TEXT,
  source_label        TEXT,
  exact_role_title    TEXT NOT NULL,
  normalized_level    TEXT,
  location            TEXT,
  city                TEXT,
  country             TEXT,
  work_mode           TEXT,
  domain              TEXT,
  pm_ownership_type   TEXT,
  years_exp_min       INTEGER,
  years_exp_max       INTEGER,
  posted_date         DATE,
  comp_fixed_min      INTEGER,
  comp_fixed_max      INTEGER,
  comp_total_min      INTEGER,
  comp_total_max      INTEGER,
  comp_currency       TEXT DEFAULT 'INR',
  comp_confidence     TEXT DEFAULT 'NOT_AVAILABLE',
  comp_source         TEXT,
  equity_potential    TEXT,
  overall_score       SMALLINT,
  priority_tier       SMALLINT,
  brand_value_score   SMALLINT,
  stability_score     SMALLINT,
  wlb_score           SMALLINT,
  layoff_risk_score   SMALLINT,
  analysis_notes      TEXT,
  raw_description     TEXT,
  -- Cache control fields
  first_seen_at       TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at        TIMESTAMPTZ DEFAULT NOW(),
  enriched_at         TIMESTAMPTZ,
  is_active           BOOLEAN DEFAULT TRUE,
  -- Confidence labels per field
  location_conf       TEXT DEFAULT 'NOT_AVAILABLE',
  work_mode_conf      TEXT DEFAULT 'NOT_AVAILABLE',
  exp_conf            TEXT DEFAULT 'NOT_AVAILABLE',
  comp_fixed_conf     TEXT DEFAULT 'NOT_AVAILABLE',
  comp_total_conf     TEXT DEFAULT 'NOT_AVAILABLE',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_hash        ON jobs(source_url_hash);
CREATE INDEX IF NOT EXISTS idx_jobs_active      ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_platform    ON jobs(ats_platform);
CREATE INDEX IF NOT EXISTS idx_jobs_score       ON jobs(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_seen        ON jobs(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_company     ON jobs(company_slug);

-- Search cache table
CREATE TABLE IF NOT EXISTS search_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash      TEXT UNIQUE NOT NULL,
  query_params    JSONB NOT NULL,
  job_ids         UUID[] NOT NULL,
  result_count    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cache_hash    ON search_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON search_cache(expires_at);
```

### 1b — Create lib/supabase-server.ts

```typescript
// lib/supabase-server.ts

import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false }
  }
)
```

### 1c — Create lib/discovery.ts

This pulls real slugs from each ATS's own source of truth.
No manual slug typing. Ever.

```typescript
// lib/discovery.ts

import { supabaseAdmin } from './supabase-server'

interface DiscoveredCompany {
  slug: string
  name: string
  ats_platform: 'greenhouse' | 'lever' | 'ashby' | 'smartrecruiters'
  careers_url: string
}

// ─────────────────────────────────────────────────────────────────
// GREENHOUSE
// GET https://boards-api.greenhouse.io/v1/boards
// Returns every public Greenhouse board with correct slug (token field)
// ─────────────────────────────────────────────────────────────────

export async function discoverGreenhouse(): Promise<DiscoveredCompany[]> {
  console.log('[Discovery] Greenhouse: fetching boards...')
  const discovered: DiscoveredCompany[] = []

  try {
    const resp = await fetch('https://boards-api.greenhouse.io/v1/boards', {
      headers: { 'User-Agent': 'VacancyBible/1.0' },
      next: { revalidate: 0 }
    })

    if (!resp.ok) {
      console.error(`[Discovery] Greenhouse boards returned HTTP ${resp.status}`)
      return []
    }

    const data = await resp.json()
    const boards = data.boards || []

    for (const board of boards) {
      const slug = board.token || ''
      const name = board.name || slug
      if (!slug) continue

      discovered.push({
        slug,
        name,
        ats_platform: 'greenhouse',
        careers_url: `https://boards.greenhouse.io/${slug}`,
      })
    }

    console.log(`[Discovery] Greenhouse: ${discovered.length} companies found`)
  } catch (e) {
    console.error('[Discovery] Greenhouse failed:', e)
  }

  return discovered
}

// ─────────────────────────────────────────────────────────────────
// LEVER
// GET https://jobs.lever.co/sitemap.xml
// Parse every URL matching https://jobs.lever.co/{slug}
// These are all valid, active Lever slugs
// ─────────────────────────────────────────────────────────────────

export async function discoverLever(): Promise<DiscoveredCompany[]> {
  console.log('[Discovery] Lever: fetching sitemap...')
  const discovered: DiscoveredCompany[] = []

  try {
    const resp = await fetch('https://jobs.lever.co/sitemap.xml', {
      headers: { 'User-Agent': 'VacancyBible/1.0' },
      next: { revalidate: 0 }
    })

    if (!resp.ok) {
      console.error(`[Discovery] Lever sitemap returned HTTP ${resp.status}`)
      return []
    }

    const xml = await resp.text()
    const slugsSeen = new Set<string>()

    // Extract all loc entries
    const locMatches = xml.match(/<loc>([^<]+)<\/loc>/g) || []

    for (const match of locMatches) {
      const url = match.replace(/<\/?loc>/g, '').trim()
      // Only match top-level company URLs: https://jobs.lever.co/razorpay
      const slugMatch = url.match(/^https:\/\/jobs\.lever\.co\/([^\/\?]+)\/?$/)
      if (!slugMatch) continue

      const slug = slugMatch[1]
      if (slugsSeen.has(slug)) continue
      slugsSeen.add(slug)

      // Convert slug to display name
      const name = slug
        .split(/[-_]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

      discovered.push({
        slug,
        name,
        ats_platform: 'lever',
        careers_url: `https://jobs.lever.co/${slug}`,
      })
    }

    console.log(`[Discovery] Lever: ${discovered.length} companies found`)
  } catch (e) {
    console.error('[Discovery] Lever failed:', e)
  }

  return discovered
}

// ─────────────────────────────────────────────────────────────────
// ASHBY
// GET https://jobs.ashbyhq.com/sitemap.xml
// Same pattern as Lever
// ─────────────────────────────────────────────────────────────────

export async function discoverAshby(): Promise<DiscoveredCompany[]> {
  console.log('[Discovery] Ashby: fetching sitemap...')
  const discovered: DiscoveredCompany[] = []

  try {
    const resp = await fetch('https://jobs.ashbyhq.com/sitemap.xml', {
      headers: { 'User-Agent': 'VacancyBible/1.0' },
      next: { revalidate: 0 }
    })

    if (!resp.ok) {
      console.error(`[Discovery] Ashby sitemap returned HTTP ${resp.status}`)
      return []
    }

    const xml = await resp.text()
    const slugsSeen = new Set<string>()
    const locMatches = xml.match(/<loc>([^<]+)<\/loc>/g) || []

    for (const match of locMatches) {
      const url = match.replace(/<\/?loc>/g, '').trim()
      const slugMatch = url.match(/^https:\/\/jobs\.ashbyhq\.com\/([^\/\?]+)\/?$/)
      if (!slugMatch) continue

      const slug = slugMatch[1]
      if (slugsSeen.has(slug)) continue
      slugsSeen.add(slug)

      const name = slug
        .split(/[-_]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

      discovered.push({
        slug,
        name,
        ats_platform: 'ashby',
        careers_url: `https://jobs.ashbyhq.com/${slug}`,
      })
    }

    console.log(`[Discovery] Ashby: ${discovered.length} companies found`)
  } catch (e) {
    console.error('[Discovery] Ashby failed:', e)
  }

  return discovered
}

// ─────────────────────────────────────────────────────────────────
// SMARTRECRUITERS
// No slug needed — their search API queries across ALL companies at once
// GET https://api.smartrecruiters.com/v1/postings?q=product+manager&limit=100
// ─────────────────────────────────────────────────────────────────

export async function discoverSmartRecruiters(): Promise<DiscoveredCompany[]> {
  console.log('[Discovery] SmartRecruiters: discovering via job search...')
  const discovered: DiscoveredCompany[] = []
  const companiesSeen = new Set<string>()

  const searchTerms = [
    'senior product manager',
    'principal product manager',
    'lead product manager',
    'group product manager',
    'director of product',
  ]

  try {
    for (const term of searchTerms) {
      let offset = 0
      const limit = 100

      while (true) {
        const url = new URL('https://api.smartrecruiters.com/v1/postings')
        url.searchParams.set('q', term)
        url.searchParams.set('limit', String(limit))
        url.searchParams.set('offset', String(offset))

        const resp = await fetch(url.toString(), {
          headers: { 'User-Agent': 'VacancyBible/1.0' }
        })

        if (!resp.ok) break

        const data = await resp.json()
        const postings = data.content || []
        if (postings.length === 0) break

        for (const posting of postings) {
          const company = posting.company || {}
          const slug = company.identifier || ''
          const name = company.name || slug
          if (!slug || companiesSeen.has(slug)) continue
          companiesSeen.add(slug)

          discovered.push({
            slug,
            name,
            ats_platform: 'smartrecruiters',
            careers_url: `https://careers.smartrecruiters.com/${slug}`,
          })
        }

        const total = data.totalFound || 0
        offset += limit
        if (offset >= total || offset >= 500) break

        await new Promise(r => setTimeout(r, 300))
      }
    }

    console.log(`[Discovery] SmartRecruiters: ${discovered.length} companies found`)
  } catch (e) {
    console.error('[Discovery] SmartRecruiters failed:', e)
  }

  return discovered
}

// ─────────────────────────────────────────────────────────────────
// SAVE TO SUPABASE
// ─────────────────────────────────────────────────────────────────

export async function saveDiscoveredCompanies(
  companies: DiscoveredCompany[]
): Promise<number> {
  if (companies.length === 0) return 0

  let newCount = 0
  const BATCH = 500

  for (let i = 0; i < companies.length; i += BATCH) {
    const batch = companies.slice(i, i + BATCH)

    const { data, error } = await supabaseAdmin
      .from('companies')
      .upsert(
        batch.map(c => ({
          slug: c.slug,
          name: c.name,
          ats_platform: c.ats_platform,
          careers_url: c.careers_url,
          slug_status: 'unknown',
          is_active: true,
        })),
        {
          onConflict: 'slug,ats_platform',
          ignoreDuplicates: true,
        }
      )
      .select('id')

    if (error) {
      console.error(`[Discovery] Supabase save error on batch ${i}:`, error.message)
      continue
    }

    newCount += data?.length || 0
    console.log(`[Discovery] Saved batch ${i}–${i + BATCH}: ${data?.length || 0} new`)
  }

  return newCount
}

// ─────────────────────────────────────────────────────────────────
// MASTER RUNNER
// ─────────────────────────────────────────────────────────────────

export async function runFullDiscovery() {
  console.log('[Discovery] ===== Starting full discovery =====')

  const [greenhouse, lever, ashby, smartrecruiters] = await Promise.all([
    discoverGreenhouse(),
    discoverLever(),
    discoverAshby(),
    discoverSmartRecruiters(),
  ])

  const all = [...greenhouse, ...lever, ...ashby, ...smartrecruiters]
  console.log(`[Discovery] Total across all platforms: ${all.length}`)

  const newlySaved = await saveDiscoveredCompanies(all)

  const result = {
    greenhouse: greenhouse.length,
    lever: lever.length,
    ashby: ashby.length,
    smartrecruiters: smartrecruiters.length,
    total_discovered: all.length,
    newly_saved: newlySaved,
  }

  console.log('[Discovery] ===== Discovery complete =====', result)
  return result
}
```

### 1d — Load companies from Supabase instead of registryData.ts

Find every place the scraper/search reads the company list.
Replace it with this function. Keep registryData.ts only as an emergency fallback.

```typescript
// lib/load-companies.ts

import { supabaseAdmin } from './supabase-server'

export interface CompanyRecord {
  slug: string
  name: string
  ats_platform: string
  careers_url: string
  slug_status: string
}

export async function loadActiveCompanies(): Promise<CompanyRecord[]> {
  const { data, error } = await supabaseAdmin
    .from('companies')
    .select('slug, name, ats_platform, careers_url, slug_status')
    .eq('is_active', true)
    .neq('slug_status', 'invalid')  // skip confirmed bad slugs
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[LoadCompanies] Supabase error, falling back to registry:', error.message)
    // Emergency fallback only
    const { registryData } = await import('./registryData')
    return registryData
  }

  console.log(`[LoadCompanies] Loaded ${data.length} companies from Supabase`)
  return data as CompanyRecord[]
}
```

---

## PART 2 — CACHING

### How it works (read this carefully before implementing)

```
User submits search query
         ↓
Hash the query params → check search_cache table
         ↓
    Cache HIT (not expired)?
    → Return stored job IDs from Supabase instantly
    → Show "Results from X hours ago · Refresh?"
         ↓
    Cache MISS or expired?
    → Run live scrape across all companies
    → For each job found:
        - Hash the source URL
        - Check jobs table: already exists?
            YES → update last_seen_at only, skip LLM
            NO  → enrich with LLM, save full record
    → After scrape: mark jobs from this company
      that did NOT appear as is_active = false
      (they were taken down)
    → Save query → job_ids mapping to search_cache
    → Return results
```

Cache TTL: 6 hours for active searches.
Jobs older than 30 days without a last_seen_at refresh: mark inactive.

### 2a — Create lib/cache.ts

```typescript
// lib/cache.ts

import { supabaseAdmin } from './supabase-server'
import crypto from 'crypto'

const CACHE_TTL_HOURS = 6

// ─────────────────────────────────────────────────────────────────
// QUERY CACHE
// ─────────────────────────────────────────────────────────────────

export function hashQuery(params: Record<string, any>): string {
  // Normalize: sort keys, lowercase strings, remove empty values
  const normalized = Object.fromEntries(
    Object.entries(params)
      .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, typeof v === 'string' ? v.toLowerCase().trim() : v])
  )
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(normalized))
    .digest('hex')
}

export async function getSearchCache(queryHash: string) {
  const { data, error } = await supabaseAdmin
    .from('search_cache')
    .select('*')
    .eq('query_hash', queryHash)
    .gt('expires_at', new Date().toISOString())  // not expired
    .single()

  if (error || !data) return null
  return data
}

export async function getJobsByIds(jobIds: string[]) {
  if (jobIds.length === 0) return []

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .in('id', jobIds)
    .eq('is_active', true)
    .order('overall_score', { ascending: false })

  if (error) {
    console.error('[Cache] Failed to fetch jobs by IDs:', error.message)
    return []
  }

  return data || []
}

export async function saveSearchCache(
  queryHash: string,
  queryParams: Record<string, any>,
  jobIds: string[]
): Promise<void> {
  const expiresAt = new Date(
    Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000
  ).toISOString()

  const { error } = await supabaseAdmin
    .from('search_cache')
    .upsert(
      {
        query_hash: queryHash,
        query_params: queryParams,
        job_ids: jobIds,
        result_count: jobIds.length,
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
      },
      { onConflict: 'query_hash' }
    )

  if (error) {
    console.error('[Cache] Failed to save search cache:', error.message)
  }
}

export async function clearExpiredCache(): Promise<void> {
  const { error } = await supabaseAdmin
    .from('search_cache')
    .delete()
    .lt('expires_at', new Date().toISOString())

  if (error) {
    console.error('[Cache] Failed to clear expired cache:', error.message)
  }
}

// ─────────────────────────────────────────────────────────────────
// JOB CACHE
// Check if a job URL already exists in DB
// ─────────────────────────────────────────────────────────────────

export function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex')
}

export async function getExistingJob(urlHash: string) {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select('id, enriched_at, last_seen_at, is_active')
    .eq('source_url_hash', urlHash)
    .single()

  if (error) return null
  return data
}

export async function touchJobSeen(jobId: string): Promise<void> {
  await supabaseAdmin
    .from('jobs')
    .update({
      last_seen_at: new Date().toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
}

export async function markJobsInactive(
  companySlugs: string[],
  activeUrlHashes: string[]
): Promise<number> {
  // Mark jobs from these companies as inactive
  // if their URL hash is NOT in the current scrape
  // This detects jobs that have been taken down
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .in('company_slug', companySlugs)
    .not('source_url_hash', 'in', `(${activeUrlHashes.map(h => `'${h}'`).join(',')})`)
    .eq('is_active', true)
    .select('id')

  if (error) {
    console.error('[Cache] Failed to mark stale jobs inactive:', error.message)
    return 0
  }

  const count = data?.length || 0
  if (count > 0) {
    console.log(`[Cache] Marked ${count} jobs inactive (no longer in scrape)`)
  }
  return count
}
```

### 2b — Update the search API to use cache

Find your main search endpoint (likely `app/api/search/route.ts` or `pages/api/search.ts`).
Wrap it with the cache check:

```typescript
// app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server'
import {
  hashQuery,
  getSearchCache,
  getJobsByIds,
  saveSearchCache,
} from '@/lib/cache'
import { runSearch } from '@/lib/search-engine'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, location, experience, package: pkg, domain, flex } = body

  const queryParams = { title, location, experience, package: pkg, domain, flex }
  const queryHash = hashQuery(queryParams)

  // ── CHECK CACHE FIRST ──────────────────────────────────────────
  const cached = await getSearchCache(queryHash)

  if (cached) {
    console.log(`[Search] Cache HIT for hash ${queryHash.slice(0, 8)}`)
    const jobs = await getJobsByIds(cached.job_ids)

    return NextResponse.json({
      jobs,
      total: jobs.length,
      from_cache: true,
      cached_at: cached.created_at,
      expires_at: cached.expires_at,
      message: `Results from ${timeAgo(cached.created_at)}. Run fresh search to update.`,
    })
  }

  // ── CACHE MISS — RUN LIVE SCRAPE ───────────────────────────────
  console.log(`[Search] Cache MISS for hash ${queryHash.slice(0, 8)} — running live scrape`)

  const { jobs, jobIds } = await runSearch(queryParams)

  // Save to cache
  await saveSearchCache(queryHash, queryParams, jobIds)

  return NextResponse.json({
    jobs,
    total: jobs.length,
    from_cache: false,
    message: `Found ${jobs.length} jobs. Results cached for 6 hours.`,
  })
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}h ${minutes}m ago`
  return `${minutes}m ago`
}
```

### 2c — Update search engine to use job-level cache

Find `lib/search-engine.ts` (or wherever individual jobs are scraped and enriched).
Add job-level cache check so existing jobs skip LLM enrichment:

```typescript
// Inside the job processing loop in your search engine:

import {
  hashUrl,
  getExistingJob,
  touchJobSeen,
  markJobsInactive,
} from '@/lib/cache'
import { enrichJobWithLLM } from './enrichment'
import { supabaseAdmin } from './supabase-server'

export async function processScrapedJobs(
  rawJobs: RawJob[],
  companySlugs: string[]
): Promise<{ jobs: any[], jobIds: string[] }> {

  const savedJobIds: string[] = []
  const activeUrlHashes: string[] = []
  const newJobsToEnrich: RawJob[] = []
  const existingJobMap: Map<string, string> = new Map() // urlHash → jobId

  // ── PHASE 1: CHECK WHICH JOBS ARE NEW ─────────────────────────
  for (const raw of rawJobs) {
    const urlHash = hashUrl(raw.source_url)
    activeUrlHashes.push(urlHash)

    const existing = await getExistingJob(urlHash)

    if (existing) {
      // Job already in DB — just update last_seen_at
      await touchJobSeen(existing.id)
      savedJobIds.push(existing.id)
      existingJobMap.set(urlHash, existing.id)
      console.log(`[Search] Existing job: ${raw.exact_role_title} @ ${raw.company_name}`)
    } else {
      // New job — needs enrichment
      newJobsToEnrich.push(raw)
    }
  }

  console.log(`[Search] ${rawJobs.length} total | ${newJobsToEnrich.length} new | ${existingJobMap.size} from cache`)

  // ── PHASE 2: ENRICH NEW JOBS ONLY ─────────────────────────────
  if (newJobsToEnrich.length > 0) {
    console.log(`[Search] Enriching ${newJobsToEnrich.length} new jobs with LLM`)

    // Process in batches of 5
    const BATCH = 5
    for (let i = 0; i < newJobsToEnrich.length; i += BATCH) {
      const batch = newJobsToEnrich.slice(i, i + BATCH)

      const enriched = await Promise.all(
        batch.map(raw => enrichJobWithLLM(raw))
      )

      // Save enriched jobs to Supabase
      for (const job of enriched) {
        const { data, error } = await supabaseAdmin
          .from('jobs')
          .insert({
            ...job,
            source_url_hash: hashUrl(job.source_url),
            first_seen_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
            enriched_at: new Date().toISOString(),
            is_active: true,
          })
          .select('id')
          .single()

        if (error) {
          console.error(`[Search] Failed to save job: ${error.message}`)
          continue
        }

        savedJobIds.push(data.id)
      }

      // Polite delay between LLM batches
      if (i + BATCH < newJobsToEnrich.length) {
        await new Promise(r => setTimeout(r, 1000))
      }
    }
  }

  // ── PHASE 3: MARK TAKEN-DOWN JOBS INACTIVE ────────────────────
  if (companySlugs.length > 0 && activeUrlHashes.length > 0) {
    await markJobsInactive(companySlugs, activeUrlHashes)
  }

  // ── PHASE 4: RETURN ALL JOBS (new + cached) ───────────────────
  const { data: allJobs } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .in('id', savedJobIds)
    .eq('is_active', true)
    .order('overall_score', { ascending: false })

  return {
    jobs: allJobs || [],
    jobIds: savedJobIds,
  }
}
```

---

## PART 3 — ADMIN API ROUTES

Create these three routes. All protected by `ADMIN_SECRET` env var.

```typescript
// app/api/admin/discovery/route.ts

import { runFullDiscovery } from '@/lib/discovery'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const result = await runFullDiscovery()
  return NextResponse.json(result)
}
```

```typescript
// app/api/admin/company-count/route.ts

import { supabaseAdmin } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data } = await supabaseAdmin
    .from('companies')
    .select('ats_platform, slug_status, is_active')

  const total = data?.length || 0
  const byPlatform: Record<string, number> = {}
  const byStatus: Record<string, number> = {}

  for (const c of data || []) {
    byPlatform[c.ats_platform] = (byPlatform[c.ats_platform] || 0) + 1
    byStatus[c.slug_status] = (byStatus[c.slug_status] || 0) + 1
  }

  return NextResponse.json({ total, by_platform: byPlatform, by_status: byStatus })
}
```

```typescript
// app/api/admin/clear-cache/route.ts

import { clearExpiredCache } from '@/lib/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await clearExpiredCache()
  return NextResponse.json({ status: 'done' })
}
```

---

## PART 4 — UPDATE FRONTEND TO SHOW CACHE STATUS

Find the results display component. Add a subtle cache indicator:

```tsx
// In ResultsTable or SearchMeta component

{fromCache && cachedAt && (
  <div className="flex items-center gap-3 text-xs font-mono text-[#7A7A8C]">
    <span>
      Results from {timeAgo(cachedAt)}
    </span>
    <button
      onClick={onForceRefresh}
      className="text-[#5B6EF5] hover:underline"
    >
      Refresh →
    </button>
  </div>
)}

{!fromCache && (
  <div className="text-xs font-mono text-[#4CAF7D]">
    ✓ Fresh results · cached for 6 hours
  </div>
)}
```

Add a `force_refresh` boolean param to your search API call when the user clicks Refresh.
When `force_refresh=true`, skip the cache check and run a live scrape.

```typescript
// In search route — add force refresh support
const forceRefresh = body.force_refresh === true

if (!forceRefresh) {
  const cached = await getSearchCache(queryHash)
  if (cached) {
    // return cached results
  }
}
// proceed with live scrape
```

---

## PART 5 — ENV VARS

Make sure `.env.local` has all of these before running locally:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin
ADMIN_SECRET=any-long-random-string-you-choose

# LLM (for enrichment)
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## PART 6 — LOCAL STARTUP SEQUENCE

After all code changes, follow these steps exactly to run locally:

### Step 1 — Install dependencies
```bash
npm install
# or
pnpm install
```

### Step 2 — Run Supabase SQL
Go to your Supabase dashboard → SQL Editor → run the SQL from Part 1a above.
Confirm all three tables exist: `companies`, `jobs`, `search_cache`.

### Step 3 — Start local dev server
```bash
npm run dev
```
App should be running at http://localhost:3000

### Step 4 — Run discovery to populate company registry
Open a new terminal:
```bash
curl -X POST http://localhost:3000/api/admin/discovery \
  -H "x-admin-key: your-admin-secret" \
  -H "Content-Type: application/json"
```
This will take 30–60 seconds. Watch the terminal for logs like:
```
[Discovery] Greenhouse: 4800 companies found
[Discovery] Lever: 900 companies found
[Discovery] Ashby: 400 companies found
[Discovery] SmartRecruiters: 150 companies found
[Discovery] Total: 6250 | Newly saved: 6250
```

### Step 5 — Verify company count
```bash
curl http://localhost:3000/api/admin/company-count \
  -H "x-admin-key: your-admin-secret"
```
Should return something like:
```json
{
  "total": 6250,
  "by_platform": {
    "greenhouse": 4800,
    "lever": 900,
    "ashby": 400,
    "smartrecruiters": 150
  },
  "by_status": {
    "unknown": 6250
  }
}
```

### Step 6 — Run a test search
Go to http://localhost:3000
Search "Senior Product Manager" / "India" / Open flexibility
Watch the terminal logs — you should see results from Greenhouse, Lever, AND Ashby.

### Step 7 — Run the same search again
Should return instantly from cache with "Results from Xm ago · Refresh →" indicator.

### Step 8 — Confirm everything works, then tell me
Once you've verified locally, we will push to production.

---

## WHAT TO CHECK LOCALLY BEFORE PUSHING TO PRODUCTION

- [ ] Company count is 5,000+ (not 202)
- [ ] First search: results come from multiple ATS platforms (not just Ashby)
- [ ] Second search (same query): returns from cache instantly
- [ ] "Results from Xm ago · Refresh →" shows in UI
- [ ] Clicking Refresh runs a fresh scrape and updates cache
- [ ] Console logs show: "X total | Y new | Z from cache" for each search
- [ ] No 404 errors in terminal for Greenhouse/Lever slugs

**Do NOT push to production until all checks above pass locally.**
**Do not change any UI design or styling — only logic, data layer, and API routes.**
