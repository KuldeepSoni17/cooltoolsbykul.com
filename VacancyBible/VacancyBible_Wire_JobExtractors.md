# VacancyBible — Wire jobExtractors Data into Main Search UI

## CONTEXT

We have CSV files in the `jobExtractors/` subfolder containing verified company slugs
extracted from Common Crawl. We also have a working ATS detection + scraping mechanism
built for the "Watch a Company" feature. 

The goal: make the main search UI use these real companies and the same scraping logic.

---

## WHAT EXISTS

```
jobExtractors/
  greenhouse_companies.csv    columns: slug, greenhouse_url, api_url
  greenhouse_extract.js       the extraction script (don't touch)
  greenhouse_run.log          run log (don't touch)
  greenhouse_progress.json    progress file (don't touch)
```

The Watch a Company feature has:
- `lib/ats-detector.ts`       — detects ATS from URL, fetches jobs
- `lib/watch-scraper.ts`      — scrapes jobs from a detected company
- `app/api/watch/detect/`     — detect API route
- `app/api/watch/add/`        — add to watchlist API route

---

## WHAT TO BUILD

### Step 1 — Seed CSV into Supabase

Create `lib/seed-companies.ts`:

```typescript
// lib/seed-companies.ts
// Reads CSVs from jobExtractors/ and upserts into Supabase companies table
// Run once with: npx ts-node lib/seed-companies.ts
// Or trigger via POST /api/admin/seed-companies

import { supabaseAdmin } from './supabase-server'
import fs from 'fs'
import path from 'path'

interface CompanyRow {
  slug: string
  greenhouse_url: string
  api_url: string
}

function parseCSV(filePath: string): CompanyRow[] {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`)
    return []
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.trim().split('\n')
  const header = lines[0].split(',')

  return lines.slice(1).map(line => {
    // Handle commas inside values safely
    const cols = line.split(',')
    return {
      slug:            cols[0]?.trim() || '',
      greenhouse_url:  cols[1]?.trim() || '',
      api_url:         cols[2]?.trim() || '',
    }
  }).filter(r => r.slug.length > 0)
}

export async function seedCompanies(): Promise<{
  greenhouse: number
  total: number
}> {
  const base = path.join(process.cwd(), 'jobExtractors')

  // Parse each CSV
  const greenhouseRows = parseCSV(path.join(base, 'greenhouse_companies.csv'))

  console.log(`Parsed: ${greenhouseRows.length} Greenhouse companies`)

  // Build upsert payload for Supabase
  const records = greenhouseRows.map(row => ({
    slug:         row.slug,
    name:         row.slug
                    .replace(/-/g, ' ')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, c => c.toUpperCase()),
    ats_platform: 'greenhouse',
    careers_url:  row.greenhouse_url,
    api_url:      row.api_url,
    slug_status:  'unknown',
    is_active:    true,
  }))

  // Upsert in batches of 500
  let saved = 0
  const BATCH = 500

  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH)

    const { data, error } = await supabaseAdmin
      .from('companies')
      .upsert(batch, {
        onConflict:       'slug,ats_platform',
        ignoreDuplicates: true,
      })
      .select('id')

    if (error) {
      console.error(`Batch ${i} error:`, error.message)
      continue
    }

    saved += data?.length || 0
    console.log(`Saved batch ${i}–${i + BATCH}: ${data?.length || 0} new`)
  }

  console.log(`Done. Total new companies saved: ${saved}`)

  return {
    greenhouse: greenhouseRows.length,
    total:      saved,
  }
}
```

Add `api_url` column to your companies table if it doesn't exist:
```sql
ALTER TABLE companies ADD COLUMN IF NOT EXISTS api_url TEXT;
```

---

### Step 2 — Admin endpoint to trigger seeding

Create `app/api/admin/seed-companies/route.ts`:

```typescript
import { seedCompanies } from '@/lib/seed-companies'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-key') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const result = await seedCompanies()
    return NextResponse.json({
      success: true,
      ...result,
      message: `Seeded ${result.total} new companies from jobExtractors CSVs`,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
```

---

### Step 3 — Reuse watch-scraper logic in main search

The Watch a Company feature already has working scraper functions in
`lib/watch-scraper.ts`. The main search needs to use the exact same functions.

Find `lib/search-engine.ts` (or wherever the main search scraping happens).
Replace whatever scraping logic is there with calls to the same functions
already in `watch-scraper.ts`.

Specifically, extract the per-platform fetch functions into a shared file
so both search modes use identical logic:

Create `lib/ats-scrapers.ts`:

```typescript
// lib/ats-scrapers.ts
// Shared scraping functions used by BOTH:
//   - Main search (search all companies mode)
//   - Watch a company mode
// Single source of truth for ATS fetching logic

export interface RawJob {
  title:       string
  url:         string
  location:    string
  description: string
  platform:    string
  companyName: string
  companySlug: string
}

// ── GREENHOUSE ────────────────────────────────────────────────────

export async function scrapeGreenhouse(slug: string, companyName: string): Promise<RawJob[]> {
  console.log(`[Greenhouse] Fetching: ${slug}`)

  const resp = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`,
    { headers: { 'User-Agent': 'VacancyBible/1.0' } }
  )

  if (!resp.ok) {
    console.log(`[Greenhouse] ${slug}: HTTP ${resp.status}`)
    return []
  }

  const data = await resp.json()

  if (data.error) {
    console.log(`[Greenhouse] ${slug}: API error — ${data.error}`)
    return []
  }

  const jobs = data.jobs || []
  console.log(`[Greenhouse] ${slug}: ${jobs.length} total jobs`)

  return jobs.map((j: any) => ({
    title:       j.title || '',
    url:         j.absolute_url || '',
    location:    j.offices?.[0]?.name || '',
    description: j.content || '',
    platform:    'greenhouse',
    companyName,
    companySlug: slug,
  }))
}

// ── LEVER ─────────────────────────────────────────────────────────

export async function scrapeLever(slug: string, companyName: string): Promise<RawJob[]> {
  console.log(`[Lever] Fetching: ${slug}`)

  const resp = await fetch(
    `https://api.lever.co/v0/postings/${slug}?mode=json`,
    { headers: { 'User-Agent': 'VacancyBible/1.0' } }
  )

  if (!resp.ok) {
    console.log(`[Lever] ${slug}: HTTP ${resp.status}`)
    return []
  }

  const jobs = await resp.json()

  if (!Array.isArray(jobs)) {
    console.log(`[Lever] ${slug}: unexpected format — slug may be wrong`)
    return []
  }

  console.log(`[Lever] ${slug}: ${jobs.length} total jobs`)

  return jobs.map((j: any) => ({
    title:       j.text || '',
    url:         j.hostedUrl || '',
    location:    j.categories?.location || '',
    description: j.descriptionPlain || '',
    platform:    'lever',
    companyName,
    companySlug: slug,
  }))
}

// ── ASHBY ─────────────────────────────────────────────────────────

export async function scrapeAshby(slug: string, companyName: string): Promise<RawJob[]> {
  console.log(`[Ashby] Fetching: ${slug}`)

  const resp = await fetch('https://api.ashbyhq.com/posting-api/graphql', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      query: `query J($s:String!){
        jobBoard:ashbyHQJobBoard(organizationHostedJobsPageName:$s){
          jobPostings{ title externalLink locationName descriptionSocial }
        }
      }`,
      variables: { s: slug },
    }),
  })

  const data = await resp.json()

  if (data.errors) {
    console.log(`[Ashby] ${slug}: ${data.errors[0]?.message}`)
    return []
  }

  const jobs = data?.data?.jobBoard?.jobPostings || []
  console.log(`[Ashby] ${slug}: ${jobs.length} total jobs`)

  return jobs.map((j: any) => ({
    title:       j.title || '',
    url:         j.externalLink || '',
    location:    j.locationName || '',
    description: j.descriptionSocial || '',
    platform:    'ashby',
    companyName,
    companySlug: slug,
  }))
}

// ── SMARTRECRUITERS ───────────────────────────────────────────────

export async function scrapeSmartRecruiters(slug: string, companyName: string): Promise<RawJob[]> {
  console.log(`[SmartRecruiters] Fetching: ${slug}`)

  const resp = await fetch(
    `https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`,
    { headers: { 'User-Agent': 'VacancyBible/1.0' } }
  )

  if (!resp.ok) {
    console.log(`[SmartRecruiters] ${slug}: HTTP ${resp.status}`)
    return []
  }

  const data = await resp.json()
  const jobs  = data.content || []
  console.log(`[SmartRecruiters] ${slug}: ${jobs.length} total jobs`)

  return jobs.map((j: any) => ({
    title:       j.name || '',
    url:         `https://careers.smartrecruiters.com/${slug}/${j.id}`,
    location:    `${j.location?.city || ''} ${j.location?.country || ''}`.trim(),
    description: j.jobAd?.sections?.jobDescription?.text || '',
    platform:    'smartrecruiters',
    companyName,
    companySlug: slug,
  }))
}

// ── ROUTER ────────────────────────────────────────────────────────

export async function scrapeCompany(
  platform: string,
  slug:     string,
  name:     string
): Promise<RawJob[]> {
  try {
    if (platform === 'greenhouse')      return await scrapeGreenhouse(slug, name)
    if (platform === 'lever')           return await scrapeLever(slug, name)
    if (platform === 'ashby')           return await scrapeAshby(slug, name)
    if (platform === 'smartrecruiters') return await scrapeSmartRecruiters(slug, name)
    console.log(`[Scraper] Unknown platform: ${platform}`)
    return []
  } catch (e: any) {
    console.error(`[Scraper] ${platform}/${slug} failed: ${e.message}`)
    return []
  }
}

// ── PM TITLE FILTER ───────────────────────────────────────────────

const PM_PATTERNS = [
  'senior product manager', 'senior pm', 'sr. product manager',
  'sr product manager', 'lead product manager', 'lead pm',
  'principal product manager', 'principal pm', 'group product manager',
  'group pm', 'staff product manager', 'director of product',
  'head of product', 'vp of product', 'product lead',
  'associate director', 'senior associate product',
]

export function isPMRole(title: string): boolean {
  const t = title.toLowerCase()
  return PM_PATTERNS.some(p => t.includes(p))
}

export function filterPMRoles(jobs: RawJob[], flex: number = 1): RawJob[] {
  if (flex === 2) {
    // Open — any PM role
    return jobs.filter(j => j.title.toLowerCase().includes('product manager')
                         || j.title.toLowerCase().includes(' pm '))
  }
  // Strict or Flexible — senior patterns only
  return jobs.filter(j => isPMRole(j.title))
}
```

Now update `lib/watch-scraper.ts` to import from `ats-scrapers.ts` instead of
duplicating the fetch logic. Replace all inline fetch functions with imports:

```typescript
// lib/watch-scraper.ts — simplified, imports shared logic
import { scrapeCompany, filterPMRoles } from './ats-scrapers'
// ... rest of watch logic unchanged
```

---

### Step 4 — Update main search engine to use Supabase + shared scrapers

Find `lib/search-engine.ts`. Replace its company loading and scraping logic:

```typescript
// lib/search-engine.ts

import { supabaseAdmin }              from './supabase-server'
import { scrapeCompany, filterPMRoles, RawJob } from './ats-scrapers'
import { hashUrl, getExistingJob, touchJobSeen } from './cache'

export interface SearchParams {
  title:       string
  location:    string
  experience?: string
  package?:    string
  domain?:     string
  flex: {
    title:    number   // 0=Strict 1=Flexible 2=Open
    location: number
  }
}

export async function runSearch(params: SearchParams) {
  // 1. Load companies from Supabase (not static registry)
  const companies = await loadCompanies(params)
  console.log(`[Search] Loaded ${companies.length} companies to search`)

  // 2. Scrape in parallel, max 15 concurrent
  const CONCURRENCY = 15
  const allRaw: RawJob[] = []

  for (let i = 0; i < companies.length; i += CONCURRENCY) {
    const batch = companies.slice(i, i + CONCURRENCY)

    const results = await Promise.all(
      batch.map(c =>
        scrapeCompany(c.ats_platform, c.slug, c.name)
          .then(jobs => {
            if (jobs.length > 0) {
              console.log(`[Search] ✓ ${c.name}: ${jobs.length} jobs`)
            }
            return jobs
          })
          .catch(e => {
            console.error(`[Search] ✗ ${c.name}: ${e.message}`)
            return []
          })
      )
    )

    results.forEach(r => allRaw.push(...r))
  }

  console.log(`[Search] Total raw jobs: ${allRaw.length}`)

  // 3. Filter to PM roles based on flex setting
  const pmJobs = filterPMRoles(allRaw, params.flex.title)
  console.log(`[Search] PM roles matched: ${pmJobs.length}`)

  // 4. Deduplicate + save to DB
  const savedIds: string[] = []

  for (const job of pmJobs) {
    if (!job.url) continue

    const urlHash = hashUrl(job.url)
    const existing = await getExistingJob(urlHash)

    if (existing) {
      await touchJobSeen(existing.id)
      savedIds.push(existing.id)
      continue
    }

    const { data } = await supabaseAdmin
      .from('jobs')
      .insert({
        source_url:       job.url,
        source_url_hash:  urlHash,
        company_name:     job.companyName,
        company_slug:     job.companySlug,
        exact_role_title: job.title,
        location:         job.location,
        ats_platform:     job.platform,
        source_label:     `${job.platform} @ ${job.companyName}`,
        raw_description:  job.description,
        first_seen_at:    new Date().toISOString(),
        last_seen_at:     new Date().toISOString(),
        is_active:        true,
      })
      .select('id')
      .single()

    if (data) savedIds.push(data.id)
  }

  // 5. Return saved jobs
  const { data: jobs } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .in('id', savedIds)
    .eq('is_active', true)
    .order('overall_score', { ascending: false, nullsFirst: false })

  return { jobs: jobs || [], jobIds: savedIds }
}

// Load companies from Supabase filtered by search context
async function loadCompanies(params: SearchParams) {
  let query = supabaseAdmin
    .from('companies')
    .select('slug, name, ats_platform, careers_url')
    .eq('is_active', true)
    .neq('slug_status', 'invalid')

  // If location is India-specific and strict, limit to India companies
  const isIndiaSearch = ['india', 'bengaluru', 'bangalore', 'hyderabad',
    'mumbai', 'pune', 'chennai', 'gurgaon', 'delhi']
    .some(c => params.location.toLowerCase().includes(c))

  if (isIndiaSearch && params.flex.location === 0) {
    query = query.eq('hq_country', 'India')
  }

  const { data, error } = await query.limit(500)

  if (error) {
    console.error('[Search] Failed to load companies:', error.message)
    return []
  }

  return data || []
}
```

---

### Step 5 — Run seeding immediately

After all code is in place, trigger the seed:

```bash
# Seed companies from jobExtractors CSVs into Supabase
curl -X POST http://localhost:3000/api/admin/seed-companies \
  -H "x-admin-key: your-admin-secret"
```

Expected response:
```json
{
  "success": true,
  "greenhouse": 4821,
  "total": 4821,
  "message": "Seeded 4821 new companies from jobExtractors CSVs"
}
```

Then verify:
```bash
curl http://localhost:3000/api/admin/company-count \
  -H "x-admin-key: your-admin-secret"
```

---

### Step 6 — Test the main search UI

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Select "Search All Companies"
4. Search: "Senior Product Manager" / "India" / Flexible
5. Watch terminal — should see logs like:
   ```
   [Search] Loaded 4821 companies to search
   [Greenhouse] freshworks: 142 total jobs
   [Greenhouse] browserstack: 38 total jobs
   [Greenhouse] stripe: 89 total jobs
   [Search] PM roles matched: 47
   ```

---

## FILE SUMMARY

Files to CREATE:
- `lib/ats-scrapers.ts`               shared scraping functions
- `lib/seed-companies.ts`             CSV → Supabase seeder
- `app/api/admin/seed-companies/route.ts`  trigger endpoint

Files to UPDATE:
- `lib/search-engine.ts`              use Supabase + shared scrapers
- `lib/watch-scraper.ts`              import from ats-scrapers.ts

Files to NOT TOUCH:
- `jobExtractors/` folder             all files in here are untouched
- Any frontend components             UI is already working
- Supabase schema                     only ADD api_url column

---

## IMPORTANT

Do not change anything in the Watch a Company flow.
Do not change any UI components.
Do not modify files inside `jobExtractors/`.
Only wire the data and unify the scraping logic.
