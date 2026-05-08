# VacancyBible — Dual Mode: Search All + Watch a Company
### Do not touch the existing search flow. Add new mode alongside it.

---

## WHAT WE ARE BUILDING

Two modes on the landing page. User picks one.

**Mode 1 — Search All Companies** (existing product, leave as-is)
The current search form. Do not change any of its logic, scrapers, or API routes.
Just wrap it in the new landing page layout.

**Mode 2 — Watch a Company** (new feature, build from scratch)
User pastes a company's careers page URL.
We detect the ATS, scrape matching roles, save the company to their watchlist.
Background job re-checks every 24 hours.
User sees new roles highlighted when they return.

---

## PART 1 — LANDING PAGE: MODE SELECTOR

Redesign the landing page to show two modes as the first choice.
Everything else comes after the user picks a mode.

```tsx
// app/page.tsx — full replacement

import { ModeSelector } from '@/components/landing/ModeSelector'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0C0C0F] flex flex-col">

      {/* Header */}
      <header className="px-8 py-6 border-b border-[#1E1E26]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-display text-xl text-[#F5F0E8]">
            VacancyBible
          </span>
          <nav className="flex gap-6 text-sm text-[#7A7A8C]">
            <a href="/watchlist"
               className="hover:text-[#F5F0E8] transition-colors">
              My Watchlist
            </a>
          </nav>
        </div>
      </header>

      {/* Mode selector — this is the entire homepage */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-3xl w-full">

          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl text-[#F5F0E8] leading-tight mb-4">
              Find the role.<br />
              <span className="italic text-[#7A7A8C]">Cut the noise.</span>
            </h1>
            <p className="text-[#7A7A8C] text-lg">
              How do you want to search today?
            </p>
          </div>

          <ModeSelector />

        </div>
      </div>

      <footer className="px-8 py-4 border-t border-[#1E1E26] text-center">
        <p className="text-xs text-[#4B5563] font-mono">
          VacancyBible does not host job listings.
          All results link to original sources.
        </p>
      </footer>

    </main>
  )
}
```

```tsx
// components/landing/ModeSelector.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchAllMode } from './SearchAllMode'
import { WatchCompanyMode } from './WatchCompanyMode'

type Mode = null | 'search' | 'watch'

export function ModeSelector() {
  const [selected, setSelected] = useState<Mode>(null)

  return (
    <div className="space-y-4">

      {/* Mode cards — shown when nothing selected */}
      {!selected && (
        <div className="grid grid-cols-2 gap-4">
          <ModeCard
            mode="search"
            icon="⊞"
            title="Search All Companies"
            description="Search across thousands of company career pages at once. Best for broad discovery."
            tag="Broad search"
            tagColor="text-[#5B6EF5]"
            onClick={() => setSelected('search')}
          />
          <ModeCard
            mode="watch"
            icon="◎"
            title="Watch a Company"
            description="Paste any company's careers page. We'll track it and alert you when new PM roles appear."
            tag="New"
            tagColor="text-[#4CAF7D]"
            onClick={() => setSelected('watch')}
            highlight
          />
        </div>
      )}

      {/* Selected mode — show the relevant form */}
      {selected && (
        <div>
          {/* Back button */}
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-xs font-mono text-[#7A7A8C]
                       hover:text-[#F5F0E8] transition-colors mb-6"
          >
            ← Change mode
          </button>

          {/* Active mode label */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xs font-mono text-[#4B5563] uppercase tracking-widest">
              Mode
            </span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
              selected === 'watch'
                ? 'text-[#4CAF7D] border-[#2A5E42] bg-[#1A3D2B]'
                : 'text-[#5B6EF5] border-[#1E2456] bg-[#0D1233]'
            }`}>
              {selected === 'watch' ? '◎ Watch a Company' : '⊞ Search All Companies'}
            </span>
          </div>

          {selected === 'search' && <SearchAllMode />}
          {selected === 'watch'  && <WatchCompanyMode />}
        </div>
      )}

    </div>
  )
}

function ModeCard({
  icon, title, description, tag, tagColor, onClick, highlight = false
}: {
  mode: string
  icon: string
  title: string
  description: string
  tag: string
  tagColor: string
  onClick: () => void
  highlight?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`
        text-left p-6 rounded-2xl border transition-all duration-200
        hover:border-[#2E2E3E] hover:bg-[#141418] group
        ${highlight
          ? 'border-[#2A5E42] bg-[#0D1F15] hover:border-[#4CAF7D]/40'
          : 'border-[#1E1E26] bg-[#0C0C0F]'
        }
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className={`text-[10px] font-mono uppercase tracking-wider ${tagColor}`}>
          {tag}
        </span>
      </div>
      <h2 className="font-display text-lg text-[#F5F0E8] mb-2 group-hover:text-white">
        {title}
      </h2>
      <p className="text-sm text-[#7A7A8C] leading-relaxed">
        {description}
      </p>
      <div className="mt-6 text-xs font-mono text-[#4B5563]
                      group-hover:text-[#7A7A8C] transition-colors">
        Select →
      </div>
    </button>
  )
}
```

```tsx
// components/landing/SearchAllMode.tsx
// Just re-exports the existing SearchForm, unchanged

import { SearchForm } from '@/components/search/SearchForm'

export function SearchAllMode() {
  return <SearchForm />
}
```

---

## PART 2 — WATCH A COMPANY: FULL FEATURE

### 2a — WatchCompanyMode component

```tsx
// components/landing/WatchCompanyMode.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DetectionResult } from '@/lib/ats-detector'

type Step = 'input' | 'detecting' | 'confirm' | 'scraping' | 'done' | 'error'

export function WatchCompanyMode() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [step, setStep] = useState<Step>('input')
  const [detection, setDetection] = useState<DetectionResult | null>(null)
  const [error, setError] = useState('')
  const [jobCount, setJobCount] = useState(0)

  async function handleDetect() {
    if (!url.trim()) return

    setStep('detecting')
    setError('')

    try {
      const resp = await fetch('/api/watch/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await resp.json()

      if (!resp.ok) {
        setError(data.error || 'Could not read that URL. Is it a careers page?')
        setStep('error')
        return
      }

      setDetection(data)
      setStep('confirm')
    } catch (e) {
      setError('Network error. Please try again.')
      setStep('error')
    }
  }

  async function handleConfirmWatch() {
    if (!detection) return
    setStep('scraping')

    try {
      const resp = await fetch('/api/watch/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detection }),
      })
      const data = await resp.json()

      if (!resp.ok) {
        setError(data.error || 'Failed to start watching.')
        setStep('error')
        return
      }

      setJobCount(data.jobs_found || 0)
      setStep('done')

      // Redirect to watchlist after 2 seconds
      setTimeout(() => router.push('/watchlist'), 2000)
    } catch (e) {
      setError('Failed to start watching. Please try again.')
      setStep('error')
    }
  }

  // ── INPUT STEP ──────────────────────────────────────────────────
  if (step === 'input' || step === 'error') {
    return (
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-xs font-mono text-[#7A7A8C]
                            uppercase tracking-widest mb-3">
            Company Careers Page URL
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDetect()}
              placeholder="https://www.metacareers.com/jobs"
              className="flex-1 bg-[#141418] border border-[#1E1E26]
                         rounded-xl px-4 py-3.5 text-[#F5F0E8] font-mono text-sm
                         placeholder:text-[#3A3A4A]
                         focus:outline-none focus:border-[#5B6EF5]
                         transition-colors"
            />
            <button
              onClick={handleDetect}
              disabled={!url.trim()}
              className="px-6 py-3.5 bg-[#5B6EF5] hover:bg-[#4A5DE4]
                         text-white rounded-xl font-sans font-medium text-sm
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors whitespace-nowrap"
            >
              Detect →
            </button>
          </div>
        </div>

        {/* Examples */}
        <div className="space-y-1">
          <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-wider">
            Examples
          </p>
          {[
            'https://www.metacareers.com/jobs',
            'https://jobs.lever.co/razorpay',
            'https://boards.greenhouse.io/stripe',
            'https://careers.google.com/jobs/results',
            'https://www.amazon.jobs/en/search',
          ].map(example => (
            <button
              key={example}
              onClick={() => setUrl(example)}
              className="block text-xs font-mono text-[#4B5563]
                         hover:text-[#7A7A8C] transition-colors"
            >
              {example}
            </button>
          ))}
        </div>

        {/* Error */}
        {step === 'error' && (
          <div className="p-4 bg-red-950/30 border border-red-900/50
                          rounded-xl text-red-400 text-sm font-mono">
            {error}
          </div>
        )}
      </div>
    )
  }

  // ── DETECTING STEP ──────────────────────────────────────────────
  if (step === 'detecting') {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="p-6 bg-[#141418] border border-[#1E1E26] rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-[#5B6EF5] rounded-full animate-pulse" />
            <span className="text-sm font-mono text-[#7A7A8C]">
              Reading careers page...
            </span>
          </div>
          <p className="text-xs font-mono text-[#4B5563]">{url}</p>
        </div>

        <div className="space-y-2">
          {[
            'Fetching page...',
            'Detecting ATS platform...',
            'Looking for job listings...',
          ].map((msg, i) => (
            <div key={i}
                 className="flex items-center gap-2 text-xs font-mono text-[#4B5563]"
                 style={{ animationDelay: `${i * 400}ms` }}>
              <span className="animate-pulse">·</span>
              <span>{msg}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── CONFIRM STEP ────────────────────────────────────────────────
  if (step === 'confirm' && detection) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="p-6 bg-[#141418] border border-[#1E1E26] rounded-2xl space-y-5">

          {/* Company detected */}
          <div>
            <p className="text-[10px] font-mono text-[#4B5563]
                           uppercase tracking-wider mb-2">
              Detected
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[#F5F0E8] font-sans font-semibold text-lg">
                {detection.company_name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border
                               text-[#5B6EF5] border-[#1E2456] bg-[#0D1233]">
                {detection.ats_platform}
              </span>
              {detection.confidence === 'high' && (
                <span className="text-[10px] font-mono text-[#4CAF7D]">
                  ✓ Confident
                </span>
              )}
              {detection.confidence === 'low' && (
                <span className="text-[10px] font-mono text-[#D4924A]">
                  ~ Best guess
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#1E1E26]" />

          {/* What we found */}
          <div className="grid grid-cols-3 gap-4">
            <Stat
              label="Jobs found"
              value={String(detection.total_jobs_found)}
            />
            <Stat
              label="PM roles matched"
              value={String(detection.pm_roles_found)}
              highlight
            />
            <Stat
              label="Platform"
              value={detection.ats_platform}
            />
          </div>

          {/* Sample roles */}
          {detection.sample_roles.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-[#4B5563]
                             uppercase tracking-wider mb-2">
                Sample roles found
              </p>
              <div className="space-y-1">
                {detection.sample_roles.slice(0, 3).map((role, i) => (
                  <div key={i}
                       className="text-sm text-[#7A7A8C] font-mono
                                  flex items-center gap-2">
                    <span className="text-[#4B5563]">·</span>
                    {role}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* URL used */}
          <div>
            <p className="text-[10px] font-mono text-[#4B5563]
                           uppercase tracking-wider mb-1">
              Source
            </p>
            <a href={detection.canonical_url}
               target="_blank"
               rel="noopener noreferrer"
               className="text-xs font-mono text-[#4B5563]
                          hover:text-[#7A7A8C] transition-colors">
              {detection.canonical_url} ↗
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleConfirmWatch}
            className="flex-1 py-3.5 bg-[#5B6EF5] hover:bg-[#4A5DE4]
                       text-white rounded-xl font-sans font-medium text-sm
                       transition-colors"
          >
            Watch this company →
          </button>
          <button
            onClick={() => { setStep('input'); setDetection(null) }}
            className="px-6 py-3.5 border border-[#1E1E26]
                       text-[#7A7A8C] rounded-xl text-sm font-sans
                       hover:border-[#2E2E3E] hover:text-[#F5F0E8]
                       transition-colors"
          >
            Try different URL
          </button>
        </div>
      </div>
    )
  }

  // ── SCRAPING STEP ───────────────────────────────────────────────
  if (step === 'scraping') {
    return (
      <div className="max-w-2xl">
        <div className="p-6 bg-[#141418] border border-[#1E1E26] rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-[#4CAF7D] rounded-full animate-pulse" />
            <span className="text-sm font-mono text-[#7A7A8C]">
              Adding to watchlist and fetching roles...
            </span>
          </div>
          <p className="text-xs font-mono text-[#4B5563]">
            First scrape in progress. Taking you to your watchlist shortly.
          </p>
        </div>
      </div>
    )
  }

  // ── DONE STEP ───────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="max-w-2xl">
        <div className="p-6 bg-[#0D1F15] border border-[#2A5E42] rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[#4CAF7D]">✓</span>
            <span className="text-sm font-mono text-[#4CAF7D]">
              Watching {detection?.company_name}
            </span>
          </div>
          <p className="text-xs font-mono text-[#4B5563]">
            Found {jobCount} matching roles.
            Taking you to your watchlist...
          </p>
        </div>
      </div>
    )
  }

  return null
}

function Stat({
  label, value, highlight = false
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-xl font-mono font-medium ${
        highlight ? 'text-[#4CAF7D]' : 'text-[#F5F0E8]'
      }`}>
        {value}
      </p>
    </div>
  )
}
```

---

## PART 3 — BACKEND: ATS DETECTION API

```typescript
// app/api/watch/detect/route.ts
//
// Takes a careers page URL.
// Detects which ATS it uses.
// Returns company name, ATS platform, job count, sample roles.

import { NextRequest, NextResponse } from 'next/server'
import { detectATS } from '@/lib/ats-detector'

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json(
      { error: 'URL is required' },
      { status: 400 }
    )
  }

  // Basic URL validation
  try {
    new URL(url)
  } catch {
    return NextResponse.json(
      { error: 'Invalid URL. Please include https://' },
      { status: 400 }
    )
  }

  try {
    const result = await detectATS(url)

    if (!result) {
      return NextResponse.json(
        { error: 'Could not detect a job listings page at this URL. Try the direct jobs search URL.' },
        { status: 422 }
      )
    }

    return NextResponse.json(result)
  } catch (e: any) {
    console.error('[API/detect]', e)
    return NextResponse.json(
      { error: 'Failed to read that URL. It may require a login or block automated access.' },
      { status: 500 }
    )
  }
}
```

---

## PART 4 — ATS DETECTOR LIBRARY

This is the core logic. It takes any career page URL and figures out what's powering it.

```typescript
// lib/ats-detector.ts

export interface DetectionResult {
  company_name: string
  canonical_url: string
  ats_platform: string        // greenhouse | lever | ashby | smartrecruiters | workday | custom
  ats_slug: string            // extracted slug for API calls
  api_url: string             // direct API URL to use for future scrapes
  api_method: string          // GET | POST
  api_payload?: object        // for POST requests (GraphQL etc.)
  total_jobs_found: number
  pm_roles_found: number
  sample_roles: string[]
  confidence: 'high' | 'medium' | 'low'
  notes?: string
}

// Known ATS URL patterns
const ATS_PATTERNS: Array<{
  platform: string
  patterns: RegExp[]
  extractSlug: (url: string) => string
  buildApiUrl: (slug: string) => string
  apiMethod: string
}> = [
  {
    platform: 'greenhouse',
    patterns: [
      /boards\.greenhouse\.io\/([^\/\?]+)/,
      /boards-api\.greenhouse\.io.*\/boards\/([^\/\?]+)/,
    ],
    extractSlug: (url) => {
      const m = url.match(/boards\.greenhouse\.io\/([^\/\?#]+)/)
      return m ? m[1] : ''
    },
    buildApiUrl: (slug) =>
      `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`,
    apiMethod: 'GET',
  },
  {
    platform: 'lever',
    patterns: [
      /jobs\.lever\.co\/([^\/\?]+)/,
    ],
    extractSlug: (url) => {
      const m = url.match(/jobs\.lever\.co\/([^\/\?#]+)/)
      return m ? m[1] : ''
    },
    buildApiUrl: (slug) =>
      `https://api.lever.co/v0/postings/${slug}?mode=json`,
    apiMethod: 'GET',
  },
  {
    platform: 'ashby',
    patterns: [
      /jobs\.ashbyhq\.com\/([^\/\?]+)/,
    ],
    extractSlug: (url) => {
      const m = url.match(/jobs\.ashbyhq\.com\/([^\/\?#]+)/)
      return m ? m[1] : ''
    },
    buildApiUrl: (slug) => `https://api.ashbyhq.com/posting-api/graphql`,
    apiMethod: 'POST',
  },
  {
    platform: 'smartrecruiters',
    patterns: [
      /careers\.smartrecruiters\.com\/([^\/\?]+)/,
    ],
    extractSlug: (url) => {
      const m = url.match(/careers\.smartrecruiters\.com\/([^\/\?#]+)/)
      return m ? m[1] : ''
    },
    buildApiUrl: (slug) =>
      `https://api.smartrecruiters.com/v1/companies/${slug}/postings`,
    apiMethod: 'GET',
  },
  {
    platform: 'workday',
    patterns: [
      /([a-z0-9]+)\.wd\d+\.myworkdayjobs\.com/,
      /myworkdayjobs\.com/,
    ],
    extractSlug: (url) => {
      const m = url.match(/https?:\/\/([^\.]+)\.wd/)
      return m ? m[1] : ''
    },
    buildApiUrl: (slug) => url => url, // Workday needs the full URL
    apiMethod: 'GET',
  },
]

// PM role title patterns
const PM_PATTERNS = [
  'senior product manager',
  'senior pm',
  'lead product manager',
  'lead pm',
  'principal product manager',
  'principal pm',
  'group product manager',
  'group pm',
  'staff product manager',
  'director of product',
  'head of product',
  'product lead',
  'associate director',
  'vp of product',
  'sr. product manager',
  'sr product manager',
]

function isPMRole(title: string): boolean {
  const t = title.toLowerCase()
  return PM_PATTERNS.some(p => t.includes(p))
}

// ─────────────────────────────────────────────────────────────────
// GREENHOUSE FETCH
// ─────────────────────────────────────────────────────────────────

async function fetchGreenhouseJobs(slug: string): Promise<{
  total: number
  pmRoles: string[]
}> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'VacancyBible/1.0' }
  })

  if (!resp.ok) {
    throw new Error(`Greenhouse API returned ${resp.status} for slug "${slug}"`)
  }

  const data = await resp.json()

  if (data.error) {
    throw new Error(`Greenhouse error: ${data.error}`)
  }

  const jobs = data.jobs || []
  const pmRoles = jobs
    .map((j: any) => j.title as string)
    .filter(isPMRole)

  return { total: jobs.length, pmRoles }
}

// ─────────────────────────────────────────────────────────────────
// LEVER FETCH
// ─────────────────────────────────────────────────────────────────

async function fetchLeverJobs(slug: string): Promise<{
  total: number
  pmRoles: string[]
}> {
  const url = `https://api.lever.co/v0/postings/${slug}?mode=json`
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'VacancyBible/1.0' }
  })

  if (!resp.ok) {
    throw new Error(`Lever API returned ${resp.status}`)
  }

  const jobs = await resp.json()

  if (!Array.isArray(jobs)) {
    throw new Error(`Lever returned unexpected format for slug "${slug}"`)
  }

  const pmRoles = jobs
    .map((j: any) => j.text as string)
    .filter(isPMRole)

  return { total: jobs.length, pmRoles }
}

// ─────────────────────────────────────────────────────────────────
// ASHBY FETCH
// ─────────────────────────────────────────────────────────────────

async function fetchAshbyJobs(slug: string): Promise<{
  total: number
  pmRoles: string[]
}> {
  const resp = await fetch('https://api.ashbyhq.com/posting-api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'VacancyBible/1.0',
    },
    body: JSON.stringify({
      query: `query Jobs($slug: String!) {
        jobBoard: ashbyHQJobBoard(organizationHostedJobsPageName: $slug) {
          jobPostings { title }
        }
      }`,
      variables: { slug },
    }),
  })

  const data = await resp.json()

  if (data.errors) {
    throw new Error(`Ashby error: ${data.errors[0]?.message}`)
  }

  const jobs = data?.data?.jobBoard?.jobPostings || []
  const pmRoles = jobs
    .map((j: any) => j.title as string)
    .filter(isPMRole)

  return { total: jobs.length, pmRoles }
}

// ─────────────────────────────────────────────────────────────────
// SMARTRECRUITERS FETCH
// ─────────────────────────────────────────────────────────────────

async function fetchSmartRecruitersJobs(slug: string): Promise<{
  total: number
  pmRoles: string[]
}> {
  const url = `https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'VacancyBible/1.0' }
  })

  if (!resp.ok) {
    throw new Error(`SmartRecruiters returned ${resp.status}`)
  }

  const data = await resp.json()
  const jobs = data.content || []
  const pmRoles = jobs
    .map((j: any) => j.name as string)
    .filter(isPMRole)

  return { total: data.totalFound || jobs.length, pmRoles }
}

// ─────────────────────────────────────────────────────────────────
// MASTER DETECTOR
// ─────────────────────────────────────────────────────────────────

export async function detectATS(inputUrl: string): Promise<DetectionResult | null> {
  const urlLower = inputUrl.toLowerCase()

  // ── TRY KNOWN ATS PATTERNS FIRST ────────────────────────────────

  for (const ats of ATS_PATTERNS) {
    const matched = ats.patterns.some(p => p.test(urlLower))
    if (!matched) continue

    const slug = ats.extractSlug(inputUrl)
    if (!slug) continue

    console.log(`[Detect] Matched ${ats.platform} with slug "${slug}"`)

    try {
      let result: { total: number; pmRoles: string[] }

      if (ats.platform === 'greenhouse') {
        result = await fetchGreenhouseJobs(slug)
      } else if (ats.platform === 'lever') {
        result = await fetchLeverJobs(slug)
      } else if (ats.platform === 'ashby') {
        result = await fetchAshbyJobs(slug)
      } else if (ats.platform === 'smartrecruiters') {
        result = await fetchSmartRecruitersJobs(slug)
      } else {
        continue
      }

      // Extract company name from slug
      const companyName = slug
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())

      return {
        company_name: companyName,
        canonical_url: inputUrl,
        ats_platform: ats.platform,
        ats_slug: slug,
        api_url: ats.buildApiUrl(slug),
        api_method: ats.apiMethod,
        total_jobs_found: result.total,
        pm_roles_found: result.pmRoles.length,
        sample_roles: result.pmRoles.slice(0, 5),
        confidence: 'high',
      }
    } catch (e: any) {
      console.error(`[Detect] ${ats.platform} fetch failed:`, e.message)
      return {
        company_name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        canonical_url: inputUrl,
        ats_platform: ats.platform,
        ats_slug: slug,
        api_url: ats.buildApiUrl(slug),
        api_method: ats.apiMethod,
        total_jobs_found: 0,
        pm_roles_found: 0,
        sample_roles: [],
        confidence: 'low',
        notes: e.message,
      }
    }
  }

  // ── UNKNOWN PLATFORM ─────────────────────────────────────────────
  // URL doesn't match any known ATS pattern.
  // Return a "custom portal" result — Playwright interception
  // will be needed for scraping. Flag it for now.

  console.log(`[Detect] No ATS pattern matched for ${inputUrl} — custom portal`)

  return {
    company_name: extractCompanyNameFromUrl(inputUrl),
    canonical_url: inputUrl,
    ats_platform: 'custom',
    ats_slug: '',
    api_url: inputUrl,
    api_method: 'GET',
    total_jobs_found: 0,
    pm_roles_found: 0,
    sample_roles: [],
    confidence: 'low',
    notes: 'Custom career portal. We\'ll do our best to scan it.',
  }
}

function extractCompanyNameFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname
    // Remove common subdomains and suffixes
    return hostname
      .replace(/^(www|careers|jobs|work)\./i, '')
      .replace(/\.(com|io|co|net|org|in)(\..*)?$/i, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
  } catch {
    return 'Unknown Company'
  }
}
```

---

## PART 5 — ADD TO WATCHLIST API

```typescript
// app/api/watch/add/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { scrapeAndSaveJobs } from '@/lib/watch-scraper'
import { DetectionResult } from '@/lib/ats-detector'

export async function POST(req: NextRequest) {
  const { detection }: { detection: DetectionResult } = await req.json()

  if (!detection?.canonical_url) {
    return NextResponse.json({ error: 'Invalid detection data' }, { status: 400 })
  }

  // Save company to watchlist
  const { data: company, error: companyError } = await supabaseAdmin
    .from('watched_companies')
    .upsert(
      {
        canonical_url: detection.canonical_url,
        company_name: detection.company_name,
        ats_platform: detection.ats_platform,
        ats_slug: detection.ats_slug,
        api_url: detection.api_url,
        api_method: detection.api_method,
        is_active: true,
        last_checked_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      { onConflict: 'canonical_url' }
    )
    .select('id')
    .single()

  if (companyError) {
    console.error('[Watch/Add] Failed to save company:', companyError)
    return NextResponse.json(
      { error: 'Failed to save company to watchlist' },
      { status: 500 }
    )
  }

  // Run first scrape immediately
  const jobs = await scrapeAndSaveJobs(detection, company.id)

  return NextResponse.json({
    success: true,
    company_id: company.id,
    jobs_found: jobs.length,
  })
}
```

---

## PART 6 — WATCH SCRAPER

```typescript
// lib/watch-scraper.ts
// Scrapes a watched company using its detected ATS.
// Only fetches PM roles. Saves to jobs table.
// Called on first add AND by background refresh job.

import { supabaseAdmin } from './supabase-server'
import { DetectionResult } from './ats-detector'
import { hashUrl } from './cache'

const PM_PATTERNS = [
  'senior product manager', 'senior pm', 'lead product manager',
  'lead pm', 'principal product manager', 'principal pm',
  'group product manager', 'group pm', 'staff product manager',
  'director of product', 'head of product', 'product lead',
  'associate director', 'vp of product', 'sr. product manager',
]

function isPMRole(title: string): boolean {
  const t = title.toLowerCase()
  return PM_PATTERNS.some(p => t.includes(p))
}

export async function scrapeAndSaveJobs(
  detection: DetectionResult,
  watchedCompanyId: string
): Promise<any[]> {
  let rawJobs: Array<{
    title: string
    url: string
    location: string
    description: string
  }> = []

  try {
    if (detection.ats_platform === 'greenhouse') {
      rawJobs = await scrapeGreenhouse(detection.ats_slug)
    } else if (detection.ats_platform === 'lever') {
      rawJobs = await scrapeLever(detection.ats_slug)
    } else if (detection.ats_platform === 'ashby') {
      rawJobs = await scrapeAshby(detection.ats_slug)
    } else if (detection.ats_platform === 'smartrecruiters') {
      rawJobs = await scrapeSmartRecruiters(detection.ats_slug)
    }
    // custom platform: return empty for now, Playwright support coming later
  } catch (e) {
    console.error(`[WatchScraper] Scrape failed for ${detection.company_name}:`, e)
    return []
  }

  const pmJobs = rawJobs.filter(j => isPMRole(j.title))
  console.log(
    `[WatchScraper] ${detection.company_name}: ` +
    `${rawJobs.length} total → ${pmJobs.length} PM roles`
  )

  const savedJobs = []
  const activeHashes: string[] = []

  for (const job of pmJobs) {
    const urlHash = hashUrl(job.url)
    activeHashes.push(urlHash)

    // Check if already exists
    const { data: existing } = await supabaseAdmin
      .from('jobs')
      .select('id, first_seen_at')
      .eq('source_url_hash', urlHash)
      .single()

    if (existing) {
      // Update last seen
      await supabaseAdmin
        .from('jobs')
        .update({
          last_seen_at: new Date().toISOString(),
          is_active: true,
        })
        .eq('id', existing.id)
      savedJobs.push({ id: existing.id, is_new: false })
      continue
    }

    // New job — save it (LLM enrichment happens async, not blocking)
    const { data: newJob } = await supabaseAdmin
      .from('jobs')
      .insert({
        source_url: job.url,
        source_url_hash: urlHash,
        company_name: detection.company_name,
        company_slug: detection.ats_slug,
        exact_role_title: job.title,
        location: job.location || '',
        ats_platform: detection.ats_platform,
        source_label: `${detection.ats_platform} @ ${detection.company_name}`,
        raw_description: job.description || '',
        watched_company_id: watchedCompanyId,
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        is_active: true,
        is_new: true,
      })
      .select('id')
      .single()

    if (newJob) savedJobs.push({ id: newJob.id, is_new: true })
  }

  // Mark jobs that disappeared as inactive
  if (activeHashes.length > 0) {
    await supabaseAdmin
      .from('jobs')
      .update({ is_active: false })
      .eq('watched_company_id', watchedCompanyId)
      .not('source_url_hash', 'in', `(${activeHashes.map(h => `'${h}'`).join(',')})`)
  }

  // Update last checked timestamp
  await supabaseAdmin
    .from('watched_companies')
    .update({ last_checked_at: new Date().toISOString() })
    .eq('id', watchedCompanyId)

  return savedJobs
}

async function scrapeGreenhouse(slug: string) {
  const resp = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`,
    { headers: { 'User-Agent': 'VacancyBible/1.0' } }
  )
  const data = await resp.json()
  return (data.jobs || []).map((j: any) => ({
    title: j.title,
    url: j.absolute_url,
    location: j.offices?.[0]?.name || '',
    description: j.content || '',
  }))
}

async function scrapeLever(slug: string) {
  const resp = await fetch(
    `https://api.lever.co/v0/postings/${slug}?mode=json`,
    { headers: { 'User-Agent': 'VacancyBible/1.0' } }
  )
  const jobs = await resp.json()
  if (!Array.isArray(jobs)) return []
  return jobs.map((j: any) => ({
    title: j.text,
    url: j.hostedUrl,
    location: j.categories?.location || '',
    description: j.descriptionPlain || '',
  }))
}

async function scrapeAshby(slug: string) {
  const resp = await fetch('https://api.ashbyhq.com/posting-api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query Jobs($slug: String!) {
        jobBoard: ashbyHQJobBoard(organizationHostedJobsPageName: $slug) {
          jobPostings {
            title
            externalLink
            locationName
            descriptionSocial
          }
        }
      }`,
      variables: { slug },
    }),
  })
  const data = await resp.json()
  return (data?.data?.jobBoard?.jobPostings || []).map((j: any) => ({
    title: j.title,
    url: j.externalLink,
    location: j.locationName || '',
    description: j.descriptionSocial || '',
  }))
}

async function scrapeSmartRecruiters(slug: string) {
  const resp = await fetch(
    `https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`,
    { headers: { 'User-Agent': 'VacancyBible/1.0' } }
  )
  const data = await resp.json()
  return (data.content || []).map((j: any) => ({
    title: j.name,
    url: `https://careers.smartrecruiters.com/${slug}/${j.id}`,
    location: `${j.location?.city || ''}, ${j.location?.country || ''}`.trim(),
    description: j.jobAd?.sections?.jobDescription?.text || '',
  }))
}
```

---

## PART 7 — SUPABASE: WATCHED COMPANIES TABLE

Run this in Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS watched_companies (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_url    TEXT UNIQUE NOT NULL,
  company_name     TEXT NOT NULL,
  ats_platform     TEXT NOT NULL,
  ats_slug         TEXT,
  api_url          TEXT,
  api_method       TEXT DEFAULT 'GET',
  is_active        BOOLEAN DEFAULT TRUE,
  last_checked_at  TIMESTAMPTZ,
  new_roles_count  INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Add watched_company_id and is_new to jobs table
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS watched_company_id UUID
    REFERENCES watched_companies(id),
  ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_jobs_watched
  ON jobs(watched_company_id);
```

---

## PART 8 — WATCHLIST PAGE

```tsx
// app/watchlist/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function WatchlistPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabaseBrowser
        .from('watched_companies')
        .select(`
          *,
          jobs (
            id, exact_role_title, location, ats_platform,
            source_url, is_new, first_seen_at, is_active
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      setCompanies(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0C0C0F] flex items-center justify-center">
        <span className="font-mono text-[#4B5563] animate-pulse text-sm">
          Loading watchlist...
        </span>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0C0C0F]">
      <header className="px-8 py-6 border-b border-[#1E1E26]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/"
             className="font-display text-xl text-[#F5F0E8]">
            VacancyBible
          </a>
          <a href="/"
             className="text-xs font-mono text-[#7A7A8C]
                        hover:text-[#F5F0E8] transition-colors">
            ← Add company
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl text-[#F5F0E8]">
            My Watchlist
          </h1>
          <span className="text-xs font-mono text-[#4B5563]">
            {companies.length} companies watched
          </span>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#7A7A8C] font-sans mb-4">
              No companies watched yet.
            </p>
            <a href="/"
               className="text-xs font-mono text-[#5B6EF5]
                          hover:underline">
              Add your first company →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map(company => {
              const activeJobs = (company.jobs || [])
                .filter((j: any) => j.is_active)
              const newJobs = activeJobs.filter((j: any) => j.is_new)

              return (
                <div key={company.id}
                     className="border border-[#1E1E26] bg-[#141418]
                                rounded-2xl overflow-hidden">
                  {/* Company header */}
                  <div className="px-6 py-4 flex items-center
                                  justify-between border-b border-[#1E1E26]">
                    <div className="flex items-center gap-3">
                      <span className="font-sans font-semibold
                                       text-[#F5F0E8]">
                        {company.company_name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5
                                       rounded border text-[#5B6EF5]
                                       border-[#1E2456] bg-[#0D1233]">
                        {company.ats_platform}
                      </span>
                      {newJobs.length > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5
                                         rounded border text-[#4CAF7D]
                                         border-[#2A5E42] bg-[#1A3D2B]">
                          {newJobs.length} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-[#4B5563]">
                        {activeJobs.length} PM roles
                      </span>
                      <span className="text-xs font-mono text-[#4B5563]">
                        Checked {timeAgo(company.last_checked_at)}
                      </span>
                    </div>
                  </div>

                  {/* Job rows */}
                  <div className="divide-y divide-[#1E1E26]/50">
                    {activeJobs.length === 0 ? (
                      <div className="px-6 py-4 text-xs font-mono
                                      text-[#4B5563]">
                        No PM roles currently open
                      </div>
                    ) : (
                      activeJobs.map((job: any) => (
                        <div key={job.id}
                             className="px-6 py-3 flex items-center
                                        justify-between hover:bg-[#1A1A22]
                                        transition-colors">
                          <div className="flex items-center gap-3">
                            {job.is_new && (
                              <span className="w-1.5 h-1.5 rounded-full
                                               bg-[#4CAF7D] shrink-0" />
                            )}
                            <span className={`text-sm font-sans ${
                              job.is_new
                                ? 'text-[#F5F0E8]'
                                : 'text-[#7A7A8C]'
                            }`}>
                              {job.exact_role_title}
                            </span>
                            {job.location && (
                              <span className="text-xs font-mono
                                               text-[#4B5563]">
                                {job.location}
                              </span>
                            )}
                          </div>
                          <a href={job.source_url}
                             target="_blank"
                             rel="noopener noreferrer"
                             onClick={e => e.stopPropagation()}
                             className="text-[10px] font-mono text-[#4B5563]
                                        hover:text-[#5B6EF5] transition-colors
                                        whitespace-nowrap">
                            View ↗
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

function timeAgo(iso: string): string {
  if (!iso) return 'never'
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 36e5)
  const m = Math.floor((diff % 36e5) / 6e4)
  if (h > 23) return `${Math.floor(h / 24)}d ago`
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}
```

---

## PART 9 — LOCAL STARTUP

```bash
# 1. Install any new deps if needed
npm install

# 2. Run Supabase SQL from Part 7 in your Supabase dashboard

# 3. Start dev server
npm run dev

# 4. Open http://localhost:3000
#    You should see two mode cards: Search All + Watch a Company

# 5. Test Watch a Company with these URLs:
#    https://jobs.lever.co/swiggy
#    https://boards.greenhouse.io/freshworks
#    https://jobs.ashbyhq.com/linear

# Each should:
#  - Show detection result with company name + ATS platform
#  - Show PM role count found
#  - On confirm, save to watchlist and redirect to /watchlist
```

---

## WHAT NOT TO TOUCH

- Do not modify any existing search flow, scrapers, or search API routes
- Do not modify ResultsTable, SearchForm, or any existing components
- Do not change any existing DB tables
- Only ADD new files and new DB tables
