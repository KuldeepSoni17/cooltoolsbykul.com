// greenhouse_extract.js
// Fetches all Greenhouse company slugs from Common Crawl CDX API
//
// KEY FINDING: Greenhouse migrated domains.
// OLD: boards.greenhouse.io      (redirects, still crawled)
// NEW: job-boards.greenhouse.io  (current domain, more data)
// We query BOTH and merge results.
//
// Run with: node greenhouse_extract.js
// Output:   greenhouse_companies.csv

const fs = require('fs')

const INDEXES = [
  { id: 'CC-MAIN-2026-17', name: 'April 2026'    },
  { id: 'CC-MAIN-2026-12', name: 'March 2026'    },
  { id: 'CC-MAIN-2026-08', name: 'February 2026' },
  { id: 'CC-MAIN-2026-04', name: 'January 2026'  },
  { id: 'CC-MAIN-2025-51', name: 'December 2025' },
  { id: 'CC-MAIN-2025-47', name: 'November 2025' },
]

// Query BOTH domains — old redirects + new domain
const DOMAINS = [
  'boards.greenhouse.io/*',
  'job-boards.greenhouse.io/*',
]

const CONFIG = {
  DELAY_MS: 500,
  OUTPUT:   'greenhouse_companies.csv',
  LOG:      'greenhouse_run.log',
  PROGRESS: 'greenhouse_progress.json',
}

// ─────────────────────────────────────────────────────────────────
// LOGGING
// ─────────────────────────────────────────────────────────────────

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`
  console.log(line)
  fs.appendFileSync(CONFIG.LOG, line + '\n')
}

// ─────────────────────────────────────────────────────────────────
// SLUG EXTRACTION
// Handles both old and new Greenhouse domains
// ─────────────────────────────────────────────────────────────────

function extractSlug(url) {
  try {
    // Match both old and new domain
    const match = url.match(/(?:boards|job-boards)\.greenhouse\.io\/([^\/\?#]+)/)
    if (!match) return null

    const slug = match[1].toLowerCase().trim()

    if (!slug || slug.length < 1)               return null
    if (/^[0-9a-f]{8}-[0-9a-f]{4}/.test(slug)) return null  // UUID
    if (/\.(js|css|png|jpg|ico|xml)$/.test(slug)) return null

    const SKIP = ['jobs', 'apply', 'embed', 'api', 'widget',
                  'favicon', 'robots', 'sitemap', 'about', 'blog']
    if (SKIP.includes(slug)) return null

    // NOTE: we keep numeric slugs like "113134"
    // Some companies have numeric Greenhouse board IDs — they are valid

    return slug
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────
// ALSO EXTRACT FROM REDIRECT FIELD
// Every record has a "redirect" to job-boards.greenhouse.io
// This gives us the new domain slug even from old domain records
// ─────────────────────────────────────────────────────────────────

function extractSlugFromRecord(record) {
  // Try main URL first
  const fromUrl = extractSlug(record.url || '')
  if (fromUrl) return fromUrl

  // Try redirect field (old domain records redirect to new domain)
  const fromRedirect = extractSlug(record.redirect || '')
  if (fromRedirect) return fromRedirect

  return null
}

// ─────────────────────────────────────────────────────────────────
// PROGRESS
// ─────────────────────────────────────────────────────────────────

function saveProgress(state) {
  fs.writeFileSync(CONFIG.PROGRESS, JSON.stringify(state, null, 2))
}

function loadProgress() {
  try {
    if (fs.existsSync(CONFIG.PROGRESS)) {
      const state = JSON.parse(fs.readFileSync(CONFIG.PROGRESS, 'utf8'))
      if (state.completed) {
        log(`Previous run completed with ${state.totalUnique} slugs.`)
        log(`Delete ${CONFIG.PROGRESS} to start fresh.`)
        process.exit(0)
      }
      log(`Resuming: ${state.totalUnique} slugs, last was "${state.lastKey}"`)
      return state
    }
  } catch {
    log('Starting fresh')
  }
  return null
}

// ─────────────────────────────────────────────────────────────────
// GET TOTAL PAGES
// ─────────────────────────────────────────────────────────────────

async function getTotalPages(indexId, domain) {
  const url = `https://index.commoncrawl.org/${indexId}-index?url=${domain}&output=json&showNumPages=true`

  const resp = await fetch(url, {
    headers: { 'User-Agent': 'VacancyBible-Research/1.0' },
    signal: AbortSignal.timeout(30000),
  })

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

  const text = await resp.text()
  log(`  [${indexId}/${domain}] pages: ${text.trim()}`)

  try {
    const data = JSON.parse(text)
    return parseInt(data.pages ?? data.numPages ?? 1, 10)
  } catch {
    const n = parseInt(text.trim(), 10)
    return isNaN(n) ? 1 : n
  }
}

// ─────────────────────────────────────────────────────────────────
// FETCH ONE PAGE
// ─────────────────────────────────────────────────────────────────

async function fetchPage(indexId, domain, pageNum, retries = 3) {
  const url = `https://index.commoncrawl.org/${indexId}-index?url=${domain}&output=json&page=${pageNum}`

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'VacancyBible-Research/1.0' },
        signal: AbortSignal.timeout(120000),  // 2 min timeout
      })

      if (resp.status === 404) return []
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

      const text = await resp.text()
      if (!text.trim()) return []

      const records = []
      for (const line of text.trim().split('\n')) {
        try {
          const parsed = JSON.parse(line)
          if (parsed.url) records.push(parsed)
        } catch { /* skip */ }
      }

      return records

    } catch (e) {
      log(`  [${indexId}/${domain}] page ${pageNum} attempt ${attempt}/${retries}: ${e.message}`)
      if (attempt === retries) return []
      await new Promise(r => setTimeout(r, 3000 * attempt))
    }
  }
  return []
}

// ─────────────────────────────────────────────────────────────────
// PROCESS ONE INDEX + DOMAIN COMBINATION
// ─────────────────────────────────────────────────────────────────

async function processIndexDomain(indexId, domain, globalSlugSet, sampleUrls) {
  let totalPages
  try {
    totalPages = await getTotalPages(indexId, domain)
  } catch (e) {
    log(`  Skipping ${indexId}/${domain}: ${e.message}`)
    return 0
  }

  if (totalPages === 0) {
    log(`  No pages for ${indexId}/${domain}`)
    return 0
  }

  log(`  Processing ${totalPages} pages for ${domain} in ${indexId}`)

  let newSlugs = 0
  let slugsSinceLastSample = 0

  for (let page = 0; page < totalPages; page++) {
    const prevCount = globalSlugSet.size
    const records = await fetchPage(indexId, domain, page)

    for (const record of records) {
      const slug = extractSlugFromRecord(record)
      if (!slug || globalSlugSet.has(slug)) continue

      globalSlugSet.add(slug)
      newSlugs++
      slugsSinceLastSample++

      // Log every 100th new unique slug for cross-checking
      if (slugsSinceLastSample >= 100) {
        const entry = {
          n:     globalSlugSet.size,
          index: indexId,
          domain,
          slug,
          from:  record.url,
          link:  `https://job-boards.greenhouse.io/${slug}`,
        }
        sampleUrls.push(entry)
        log(`  [SAMPLE #${globalSlugSet.size}] "${slug}" ← ${record.url}`)
        slugsSinceLastSample = 0
      }
    }

    const newThisPage = globalSlugSet.size - prevCount
    const pct = (((page + 1) / totalPages) * 100).toFixed(0)
    log(
      `  [${indexId}/${domain}] ` +
      `page ${page + 1}/${totalPages} (${pct}%) | ` +
      `records=${records.length} | ` +
      `+${newThisPage} new | ` +
      `total unique=${globalSlugSet.size}`
    )

    await new Promise(r => setTimeout(r, CONFIG.DELAY_MS))
  }

  return newSlugs
}

// ─────────────────────────────────────────────────────────────────
// WRITE CSV
// ─────────────────────────────────────────────────────────────────

function writeCSV(slugs) {
  const header = 'slug,greenhouse_url,api_url\n'
  const rows = slugs.map(s =>
    // Use new domain for URLs
    `${s},https://job-boards.greenhouse.io/${s},https://boards-api.greenhouse.io/v1/boards/${s}/jobs`
  ).join('\n')
  fs.writeFileSync(CONFIG.OUTPUT, header + rows)
  log(`CSV saved: ${slugs.length} companies → ${CONFIG.OUTPUT}`)
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────

async function main() {
  log('══════════════════════════════════════════════════')
  log('VacancyBible — Greenhouse Company Extractor v3')
  log('Querying BOTH greenhouse domains across 6 indexes')
  log(`Total combinations: ${INDEXES.length} indexes × ${DOMAINS.length} domains = ${INDEXES.length * DOMAINS.length}`)
  log('══════════════════════════════════════════════════')

  const saved = loadProgress()
  const globalSlugSet = new Set(saved?.slugs || [])
  const sampleUrls = saved?.sampleUrls || []

  // Build full task list: every index × every domain
  const tasks = []
  for (const index of INDEXES) {
    for (const domain of DOMAINS) {
      tasks.push({ indexId: index.id, indexName: index.name, domain })
    }
  }

  // Find resume point
  let startFrom = 0
  if (saved?.lastKey) {
    const idx = tasks.findIndex(t => `${t.indexId}/${t.domain}` === saved.lastKey)
    startFrom = idx === -1 ? 0 : idx + 1
    log(`Resuming from task ${startFrom + 1}/${tasks.length}`)
  }

  for (let i = startFrom; i < tasks.length; i++) {
    const { indexId, indexName, domain } = tasks[i]
    const key = `${indexId}/${domain}`

    log('')
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    log(`Task ${i + 1}/${tasks.length}: ${indexName} — ${domain}`)
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

    await processIndexDomain(indexId, domain, globalSlugSet, sampleUrls)

    // Save after every task
    const sorted = [...globalSlugSet].sort()
    saveProgress({
      lastKey:      key,
      tasksDone:    i + 1,
      totalTasks:   tasks.length,
      totalUnique:  globalSlugSet.size,
      slugs:        sorted,
      sampleUrls,
      savedAt:      new Date().toISOString(),
    })
    writeCSV(sorted)

    log(`After task ${i + 1}: ${globalSlugSet.size} unique companies total`)
  }

  // Final
  const finalSlugs = [...globalSlugSet].sort()
  writeCSV(finalSlugs)

  saveProgress({
    lastKey:      tasks[tasks.length - 1] ? `${tasks[tasks.length-1].indexId}/${tasks[tasks.length-1].domain}` : 'done',
    tasksDone:    tasks.length,
    totalTasks:   tasks.length,
    totalUnique:  finalSlugs.length,
    slugs:        finalSlugs,
    sampleUrls,
    completed:    true,
    completedAt:  new Date().toISOString(),
  })

  log('')
  log('══════════════════════════════════════════════════')
  log('CROSS-CHECK — every 100th unique slug:')
  log('══════════════════════════════════════════════════')
  for (const s of sampleUrls) {
    log(`  #${s.n} [${s.index}/${s.domain}]: ${s.slug} → ${s.link}`)
  }

  log('')
  log('══════════════════════════════════════════════════')
  log('COMPLETE')
  log(`Unique companies: ${finalSlugs.length}`)
  log(`Output:           ${CONFIG.OUTPUT}`)
  log('══════════════════════════════════════════════════')
  log('')
  log('Import to Google Sheets:')
  log('File → Import → Upload → greenhouse_companies.csv')
}

main().catch(e => {
  log(`FATAL: ${e.message}`)
  process.exit(1)
})
