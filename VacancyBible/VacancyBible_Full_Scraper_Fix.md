# VacancyBible — Cursor Fix: All Scrapers + Unlimited Company Coverage
### Complete fix for silent scraper failures + expansion from 202 → 5,000+ companies

---

## WHAT WE ARE FIXING

1. **Only Ashby results showing** — Greenhouse, Lever, and all other scrapers are silently failing
2. **asyncio.gather swallowing exceptions** — failed scrapers return Exception objects that crash the loop
3. **Lever JSON format mismatch** — Lever returns an array, not an object
4. **Manual registry bottleneck** — 202 companies is a hard ceiling, we need auto-discovery
5. **SerpAPI Google Jobs layer** — catch everything ATS sitemaps miss
6. **Naukri Playwright scraper** — India-specific depth

Fix everything below completely. Do not skip any section.

---

## FIX 1 — RUNNER.PY: EXCEPTION HANDLING (do this first)

Find `backend/app/scrapers/runner.py`. Fix the `asyncio.gather` call.

Current broken pattern:
```python
results = await asyncio.gather(*tasks, return_exceptions=True)
for batch in results:
    all_raw.extend(batch)  # crashes when batch is an Exception object
```

Replace with:
```python
results = await asyncio.gather(*tasks, return_exceptions=True)

for i, batch in enumerate(results):
    if isinstance(batch, BaseException):
        # Log which scraper failed and why — critical for debugging
        print(f"[Runner] Scraper task {i} failed: {type(batch).__name__}: {batch}")
        continue
    if not isinstance(batch, list):
        print(f"[Runner] Scraper task {i} returned unexpected type: {type(batch)}")
        continue
    all_raw.extend(batch)

print(f"[Runner] Total raw records collected: {len(all_raw)}")
```

Also wrap each individual scraper call to catch and log failures at the company level:

```python
async def safe_scrape(scraper, company_name):
    try:
        results = await scraper.scrape()
        print(f"[Runner] ✓ {company_name} → {len(results)} jobs matched")
        return results
    except Exception as e:
        print(f"[Runner] ✗ {company_name} → {type(e).__name__}: {e}")
        return []
```

Pass every scraper through `safe_scrape()` before gathering.

---

## FIX 2 — LEVER SCRAPER: JSON FORMAT

Lever returns a raw JSON array `[{...}, {...}]`, NOT `{"jobs": [...]}`.

Find the Lever scraper. If it has any of these patterns, fix them:

```python
# WRONG — this is Greenhouse format, not Lever
data = resp.json()
jobs = data.get("jobs", [])

# CORRECT — Lever returns a flat array
jobs = resp.json()  # already a list
if not isinstance(jobs, list):
    print(f"[Lever @ {company}] Unexpected response format: {type(jobs)}")
    return []
```

Full corrected Lever scraper fetch block:

```python
async def scrape(self) -> List[RawJobRecord]:
    url = f"https://api.lever.co/v0/postings/{self.company.ats_slug}?mode=json"
    print(f"[Lever @ {self.company.name}] Fetching: {url}")

    async with httpx.AsyncClient(timeout=20) as client:
        try:
            resp = await client.get(url)
            print(f"[Lever @ {self.company.name}] HTTP {resp.status_code}")

            if resp.status_code != 200:
                print(f"[Lever @ {self.company.name}] Non-200 response, skipping")
                return []

            jobs = resp.json()

            if not isinstance(jobs, list):
                print(f"[Lever @ {self.company.name}] Expected list, got {type(jobs)} — slug may be wrong")
                return []

            print(f"[Lever @ {self.company.name}] {len(jobs)} total postings")

        except Exception as e:
            print(f"[Lever @ {self.company.name}] Request failed: {e}")
            return []

    results = []
    for job in jobs:
        title = job.get("text", "")
        if not self.matches_query(title, self.query.title_flex):
            continue
        categories = job.get("categories", {})
        location = categories.get("location", "")
        results.append(RawJobRecord(
            company_name=self.company.name,
            company_id=str(self.company.id),
            exact_role_title=title,
            source_url=job.get("hostedUrl", ""),
            ats_platform="lever",
            source_label=f"Lever @ {self.company.name}",
            location=location,
            location_written=bool(location),
            work_mode="Remote" if "remote" in location.lower() else "Hybrid",
            work_mode_written="remote" in location.lower(),
            raw_description=self._extract_description(job),
            raw_metadata=job,
            team_scope=categories.get("team", ""),
        ))

    print(f"[Lever @ {self.company.name}] {len(results)} matched title filter")
    return results

def _extract_description(self, job: dict) -> str:
    from bs4 import BeautifulSoup
    raw = ""
    for section in job.get("lists", []):
        raw += section.get("content", "")
    raw += job.get("descriptionPlain", "")
    return BeautifulSoup(raw, "html.parser").get_text(" ") if raw else ""
```

---

## FIX 3 — GREENHOUSE SCRAPER: VERIFY AND FIX

Full corrected Greenhouse scraper fetch block:

```python
async def scrape(self) -> List[RawJobRecord]:
    url = f"https://boards-api.greenhouse.io/v1/boards/{self.company.ats_slug}/jobs?content=true"
    print(f"[Greenhouse @ {self.company.name}] Fetching: {url}")

    async with httpx.AsyncClient(timeout=20) as client:
        try:
            resp = await client.get(url)
            print(f"[Greenhouse @ {self.company.name}] HTTP {resp.status_code}")

            if resp.status_code == 404:
                print(f"[Greenhouse @ {self.company.name}] 404 — slug '{self.company.ats_slug}' is wrong")
                return []

            data = resp.json()

            if "error" in data:
                print(f"[Greenhouse @ {self.company.name}] API error: {data['error']}")
                return []

            jobs = data.get("jobs", [])
            print(f"[Greenhouse @ {self.company.name}] {len(jobs)} total postings")

        except Exception as e:
            print(f"[Greenhouse @ {self.company.name}] Request failed: {e}")
            return []

    results = []
    for job in jobs:
        title = job.get("title", "")
        if not self.matches_query(title, self.query.title_flex):
            continue
        offices = job.get("offices", [])
        location = offices[0].get("name", "") if offices else ""
        results.append(RawJobRecord(
            company_name=self.company.name,
            company_id=str(self.company.id),
            exact_role_title=title,
            source_url=job.get("absolute_url", ""),
            ats_platform="greenhouse",
            source_label=f"Greenhouse @ {self.company.name}",
            location=location,
            location_written=bool(location),
            work_mode=self._infer_work_mode(job),
            work_mode_written=False,
            posted_date=str(job.get("updated_at", ""))[:10],
            raw_description=str(job.get("content", "")),
            raw_metadata=job,
        ))

    print(f"[Greenhouse @ {self.company.name}] {len(results)} matched title filter")
    return results
```

---

## FIX 4 — AUTO-DISCOVERY: CRAWL ATS SITEMAPS

This is the key to breaking out of the manual 202-company registry.
Add a new file: `backend/app/scrapers/discovery.py`

This module runs once a week (add to scheduler) and automatically discovers new companies
from Greenhouse, Lever, and Ashby sitemaps. New companies are added to the DB registry
automatically. No manual work required after setup.

```python
# backend/app/scrapers/discovery.py
#
# Discovers ALL companies using Greenhouse, Lever, and Ashby
# by parsing their public sitemaps and discovery endpoints.
# Run weekly via scheduler. Adds new companies to DB automatically.

import httpx
import asyncio
import xml.etree.ElementTree as ET
from typing import List, Dict
from sqlmodel import select
from ..models.company import Company
import re
import logging

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# GREENHOUSE DISCOVERY
# Endpoint: https://boards-api.greenhouse.io/v1/boards
# Returns paginated list of all public company boards
# ─────────────────────────────────────────────────────────────

async def discover_greenhouse_companies() -> List[Dict]:
    """
    Fetches all companies using Greenhouse.
    Returns list of {slug, name} dicts.
    """
    discovered = []
    page = 1

    async with httpx.AsyncClient(timeout=30) as client:
        while True:
            try:
                resp = await client.get(
                    "https://boards-api.greenhouse.io/v1/boards",
                    params={"page": page, "per_page": 100}
                )
                if resp.status_code != 200:
                    break

                data = resp.json()
                boards = data.get("boards", [])
                if not boards:
                    break

                for board in boards:
                    slug = board.get("token") or board.get("slug", "")
                    name = board.get("name", "")
                    if slug and name:
                        discovered.append({
                            "slug": slug,
                            "name": name,
                            "ats_platform": "greenhouse",
                            "careers_page_url": f"https://boards.greenhouse.io/{slug}",
                        })

                logger.info(f"[Discovery/Greenhouse] Page {page}: {len(boards)} boards")
                page += 1
                await asyncio.sleep(0.5)  # polite rate limit

                # Greenhouse boards endpoint may not paginate — break if same count
                if len(boards) < 100:
                    break

            except Exception as e:
                logger.error(f"[Discovery/Greenhouse] Failed on page {page}: {e}")
                break

    logger.info(f"[Discovery/Greenhouse] Total discovered: {len(discovered)}")
    return discovered


# ─────────────────────────────────────────────────────────────
# LEVER DISCOVERY
# Source: https://jobs.lever.co/sitemap.xml
# Lists every active Lever company as a URL
# ─────────────────────────────────────────────────────────────

async def discover_lever_companies() -> List[Dict]:
    """
    Parses Lever's sitemap to find all companies.
    Sitemap entries look like: https://jobs.lever.co/razorpay
    """
    discovered = []

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get("https://jobs.lever.co/sitemap.xml")
            if resp.status_code != 200:
                logger.error(f"[Discovery/Lever] Sitemap returned {resp.status_code}")
                return []

            # Parse XML sitemap
            root = ET.fromstring(resp.text)
            ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

            urls = [loc.text for loc in root.findall(".//sm:loc", ns) if loc.text]

            # Extract company slugs from URLs like https://jobs.lever.co/razorpay
            slugs_seen = set()
            for url in urls:
                match = re.match(r"https://jobs\.lever\.co/([^/]+)/?$", url)
                if match:
                    slug = match.group(1)
                    if slug not in slugs_seen:
                        slugs_seen.add(slug)
                        # Convert slug to display name: razorpay → Razorpay
                        name = slug.replace("-", " ").replace("_", " ").title()
                        discovered.append({
                            "slug": slug,
                            "name": name,
                            "ats_platform": "lever",
                            "careers_page_url": f"https://jobs.lever.co/{slug}",
                        })

            logger.info(f"[Discovery/Lever] Total discovered: {len(discovered)}")

        except Exception as e:
            logger.error(f"[Discovery/Lever] Sitemap parse failed: {e}")

    return discovered


# ─────────────────────────────────────────────────────────────
# ASHBY DISCOVERY
# Source: https://jobs.ashbyhq.com/sitemap.xml
# ─────────────────────────────────────────────────────────────

async def discover_ashby_companies() -> List[Dict]:
    """
    Parses Ashby's sitemap to find all companies.
    """
    discovered = []

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get("https://jobs.ashbyhq.com/sitemap.xml")
            if resp.status_code != 200:
                logger.error(f"[Discovery/Ashby] Sitemap returned {resp.status_code}")
                return []

            root = ET.fromstring(resp.text)
            ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            urls = [loc.text for loc in root.findall(".//sm:loc", ns) if loc.text]

            slugs_seen = set()
            for url in urls:
                # URLs like https://jobs.ashbyhq.com/linear or https://jobs.ashbyhq.com/perplexity-ai
                match = re.match(r"https://jobs\.ashbyhq\.com/([^/]+)/?$", url)
                if match:
                    slug = match.group(1)
                    if slug not in slugs_seen:
                        slugs_seen.add(slug)
                        name = slug.replace("-", " ").replace("_", " ").title()
                        discovered.append({
                            "slug": slug,
                            "name": name,
                            "ats_platform": "ashby",
                            "careers_page_url": f"https://jobs.ashbyhq.com/{slug}",
                        })

            logger.info(f"[Discovery/Ashby] Total discovered: {len(discovered)}")

        except Exception as e:
            logger.error(f"[Discovery/Ashby] Sitemap parse failed: {e}")

    return discovered


# ─────────────────────────────────────────────────────────────
# SMARTRECRUITERS DISCOVERY
# ─────────────────────────────────────────────────────────────

async def discover_smartrecruiters_companies() -> List[Dict]:
    """
    SmartRecruiters doesn't have a public sitemap.
    Use their job search API to discover active companies.
    """
    discovered = []
    companies_seen = set()

    async with httpx.AsyncClient(timeout=30) as client:
        # Search for product manager roles across all SmartRecruiters companies
        search_terms = ["product manager", "senior product manager"]
        for term in search_terms:
            try:
                resp = await client.get(
                    "https://api.smartrecruiters.com/v1/postings",
                    params={"q": term, "limit": 100}
                )
                if resp.status_code != 200:
                    continue

                data = resp.json()
                for job in data.get("content", []):
                    company = job.get("company", {})
                    slug = company.get("identifier", "")
                    name = company.get("name", "")
                    if slug and slug not in companies_seen:
                        companies_seen.add(slug)
                        discovered.append({
                            "slug": slug,
                            "name": name,
                            "ats_platform": "smartrecruiters",
                            "careers_page_url": f"https://careers.smartrecruiters.com/{slug}",
                        })
            except Exception as e:
                logger.error(f"[Discovery/SmartRecruiters] Failed for '{term}': {e}")

    logger.info(f"[Discovery/SmartRecruiters] Total discovered: {len(discovered)}")
    return discovered


# ─────────────────────────────────────────────────────────────
# SAVE TO DATABASE
# ─────────────────────────────────────────────────────────────

async def save_discovered_companies(companies: List[Dict], db_session) -> int:
    """
    Upserts discovered companies into the DB.
    Skips companies already in registry.
    Returns count of NEW companies added.
    """
    new_count = 0

    for company_data in companies:
        slug = company_data["slug"]

        # Check if already exists
        existing = (await db_session.exec(
            select(Company).where(Company.slug == slug)
        )).first()

        if existing:
            continue  # Already in registry, skip

        # Add new company with default scores
        # PM maturity and brand scores default to 5 (unknown)
        # Will be enriched by LLM on first scrape
        new_company = Company(
            name=company_data["name"],
            slug=slug,
            careers_page_url=company_data["careers_page_url"],
            ats_platform=company_data["ats_platform"],
            ats_slug=slug,
            sector="Unknown",              # enriched later
            hq_country="Unknown",          # enriched later
            is_active=True,
            pm_maturity_score=5,
            brand_value_score=5,
            stability_score=5,
            scrape_error_count=0,
        )
        db_session.add(new_company)
        new_count += 1

    await db_session.commit()
    logger.info(f"[Discovery] Added {new_count} new companies to registry")
    return new_count


# ─────────────────────────────────────────────────────────────
# MASTER DISCOVERY RUNNER
# Called by scheduler weekly
# ─────────────────────────────────────────────────────────────

async def run_full_discovery(db_session):
    """
    Runs all discovery sources and saves new companies to DB.
    Call this from the scheduler weekly.
    """
    logger.info("[Discovery] Starting full company discovery run")

    all_discovered = []

    greenhouse = await discover_greenhouse_companies()
    all_discovered.extend(greenhouse)

    lever = await discover_lever_companies()
    all_discovered.extend(lever)

    ashby = await discover_ashby_companies()
    all_discovered.extend(ashby)

    smartrecruiters = await discover_smartrecruiters_companies()
    all_discovered.extend(smartrecruiters)

    logger.info(f"[Discovery] Total across all platforms: {len(all_discovered)}")

    new = await save_discovered_companies(all_discovered, db_session)

    logger.info(f"[Discovery] Discovery complete. {new} new companies added.")
    return {
        "greenhouse": len(greenhouse),
        "lever": len(lever),
        "ashby": len(ashby),
        "smartrecruiters": len(smartrecruiters),
        "total_discovered": len(all_discovered),
        "new_added": new,
    }
```

---

## FIX 5 — ADD DISCOVERY TO SCHEDULER

Find `backend/app/scheduler/jobs.py`. Add the weekly discovery job:

```python
from ..scrapers.discovery import run_full_discovery

async def scheduled_discovery():
    """Runs weekly. Discovers new companies from ATS sitemaps."""
    logger.info("[Scheduler] Starting weekly company discovery")
    async for session in get_session():
        try:
            result = await run_full_discovery(session)
            logger.info(f"[Scheduler] Discovery complete: {result}")
        except Exception as e:
            logger.error(f"[Scheduler] Discovery failed: {e}", exc_info=True)

def setup_scheduler():
    # Existing search scrape jobs — keep as is

    # Add this — weekly discovery every Sunday at 2am UTC
    scheduler.add_job(
        scheduled_discovery,
        CronTrigger(day_of_week="sun", hour=2, minute=0),
        id="weekly_discovery",
        replace_existing=True,
    )

    scheduler.start()
```

---

## FIX 6 — ADD ADMIN ENDPOINT TO TRIGGER DISCOVERY MANUALLY

Add to `backend/app/api/admin.py`:

```python
@router.post("/trigger-discovery")
async def trigger_discovery(
    x_admin_key: str = Header(...),
    session=Depends(get_session)
):
    """
    Manually trigger company discovery.
    Use this on first deploy to populate the registry immediately.
    Protected by admin key.
    """
    if x_admin_key != settings.ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    asyncio.create_task(run_full_discovery(session))
    return {"status": "discovery started", "message": "Running in background. Check logs."}


@router.get("/company-count")
async def company_count(
    x_admin_key: str = Header(...),
    session=Depends(get_session)
):
    """Returns current company registry size."""
    if x_admin_key != settings.ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    from sqlmodel import func
    total = (await session.exec(select(func.count(Company.id)))).one()
    active = (await session.exec(
        select(func.count(Company.id)).where(Company.is_active == True)
    )).one()

    by_platform = {}
    for platform in ["greenhouse", "lever", "ashby", "workday", "smartrecruiters", "direct"]:
        count = (await session.exec(
            select(func.count(Company.id)).where(Company.ats_platform == platform)
        )).one()
        by_platform[platform] = count

    return {
        "total": total,
        "active": active,
        "by_platform": by_platform,
    }
```

---

## FIX 7 — SERPAPI GOOGLE JOBS LAYER

This catches everything the ATS sitemaps miss — Workday companies, custom portals, iCIMS, Taleo, and any company that posts to Google Jobs.

Add new file: `backend/app/scrapers/serpapi_scraper.py`

```python
# backend/app/scrapers/serpapi_scraper.py
#
# Uses SerpAPI to query Google Jobs.
# Cost: ~$0.01 per search call. Budget ~50 calls per user search = $0.50 max.
# Returns structured job data including title, company, location, apply URL.
# Covers everything Google has indexed — Workday, iCIMS, Taleo, custom portals.

import httpx
from typing import List
from .base import RawJobRecord
from ..config import settings
import logging

logger = logging.getLogger(__name__)

SERPAPI_URL = "https://serpapi.com/search.json"


async def search_google_jobs(
    query: str,
    location: str = "India",
    date_posted: str = "week",      # week | month | today
    num_pages: int = 3,
) -> List[RawJobRecord]:
    """
    Queries Google Jobs via SerpAPI.
    Returns structured RawJobRecord list.

    query:       e.g. "Senior Product Manager"
    location:    e.g. "India", "Bengaluru", "Remote"
    date_posted: filter to recent jobs only
    num_pages:   how many pages of results (10 results per page)
    """

    if not settings.SERPAPI_KEY:
        logger.warning("[SerpAPI] SERPAPI_KEY not set — skipping Google Jobs layer")
        return []

    all_results = []

    async with httpx.AsyncClient(timeout=30) as client:
        for page in range(num_pages):
            params = {
                "engine": "google_jobs",
                "q": query,
                "location": location,
                "chips": f"date_posted:{date_posted}",
                "start": page * 10,
                "api_key": settings.SERPAPI_KEY,
                "hl": "en",
                "gl": "in",  # India
            }

            try:
                resp = await client.get(SERPAPI_URL, params=params)

                if resp.status_code != 200:
                    logger.error(f"[SerpAPI] HTTP {resp.status_code} on page {page}")
                    break

                data = resp.json()
                jobs = data.get("jobs_results", [])

                if not jobs:
                    logger.info(f"[SerpAPI] No more results at page {page}")
                    break

                logger.info(f"[SerpAPI] Page {page}: {len(jobs)} jobs")

                for job in jobs:
                    title = job.get("title", "")
                    company = job.get("company_name", "")
                    location_str = job.get("location", "")

                    # Find the best apply URL
                    apply_url = ""
                    apply_options = job.get("apply_options", [])
                    if apply_options:
                        # Prefer direct company links over job board links
                        for option in apply_options:
                            link = option.get("link", "")
                            if not any(board in link for board in [
                                "linkedin.com", "indeed.com", "naukri.com",
                                "glassdoor.com", "monster.com"
                            ]):
                                apply_url = link
                                break
                        if not apply_url:
                            apply_url = apply_options[0].get("link", "")

                    # Detect ATS from the apply URL
                    ats_platform = _detect_ats_from_url(apply_url)
                    source_label = f"Google Jobs → {company}"

                    # Extract description
                    description = job.get("description", "")

                    # Detect work mode
                    work_mode = "Remote" if "remote" in (title + location_str + description).lower() else "Hybrid"

                    all_results.append(RawJobRecord(
                        company_name=company,
                        company_id="",  # No company ID — not in our registry
                        exact_role_title=title,
                        source_url=apply_url,
                        ats_platform=ats_platform,
                        source_label=source_label,
                        location=location_str,
                        location_written=True,
                        work_mode=work_mode,
                        work_mode_written=False,
                        posted_date=job.get("detected_extensions", {}).get("posted_at", ""),
                        raw_description=description,
                        raw_metadata=job,
                    ))

            except Exception as e:
                logger.error(f"[SerpAPI] Failed on page {page}: {e}")
                break

    logger.info(f"[SerpAPI] Total results: {len(all_results)}")
    return all_results


def _detect_ats_from_url(url: str) -> str:
    """Infer ATS from apply URL."""
    if not url:
        return "unknown"
    url_lower = url.lower()
    if "greenhouse.io" in url_lower:
        return "greenhouse"
    if "lever.co" in url_lower:
        return "lever"
    if "ashbyhq.com" in url_lower:
        return "ashby"
    if "myworkdayjobs.com" in url_lower or "workday.com" in url_lower:
        return "workday"
    if "smartrecruiters.com" in url_lower:
        return "smartrecruiters"
    if "icims.com" in url_lower:
        return "icims"
    if "taleo.net" in url_lower:
        return "taleo"
    return "direct"


async def build_serpapi_queries(search_query) -> List[dict]:
    """
    Builds multiple Google Jobs queries from a single user search.
    Uses flex settings to expand the query.
    """
    queries = []

    base_title = search_query.title or "Senior Product Manager"
    base_location = search_query.location or "India"

    # Primary query
    queries.append({
        "query": base_title,
        "location": base_location,
        "date_posted": "month",
    })

    # If flex is Open, add expanded title queries
    if search_query.title_flex >= 1:
        expanded_titles = [
            "Lead Product Manager",
            "Principal Product Manager",
            "Group Product Manager",
            "Director of Product",
        ]
        for title in expanded_titles:
            queries.append({
                "query": title,
                "location": base_location,
                "date_posted": "month",
            })

    # If location flex is Open, add remote
    if search_query.location_flex >= 2:
        queries.append({
            "query": base_title,
            "location": "Remote India",
            "date_posted": "month",
        })

    return queries
```

Add SerpAPI to the search engine in `backend/app/search/engine.py`:

```python
from ..scrapers.serpapi_scraper import search_google_jobs, build_serpapi_queries

async def run_search(self, query: SearchQuery, progress_callback=None) -> List[Job]:
    # ... existing scraper code ...

    # After ATS scrapers complete, add Google Jobs layer
    if progress_callback:
        await progress_callback("Searching Google Jobs...", "Google Jobs", total, total)

    serpapi_queries = await build_serpapi_queries(query)
    for q in serpapi_queries:
        google_results = await search_google_jobs(
            query=q["query"],
            location=q["location"],
            date_posted=q["date_posted"],
            num_pages=2,
        )
        all_raw.extend(google_results)

    # Continue with dedup + enrichment as before
    # ...
```

Add to `.env`:
```
SERPAPI_KEY=your_serpapi_key_here
```

Add to `config.py`:
```python
SERPAPI_KEY: str = ""
```

SerpAPI pricing: $50/month for 5,000 searches. At ~5 Google Jobs calls per user search, that's 1,000 user searches per month on the base plan. Upgrade as needed.

---

## FIX 8 — NAUKRI PLAYWRIGHT SCRAPER (India depth)

Add new file: `backend/app/scrapers/naukri.py`

```python
# backend/app/scrapers/naukri.py
#
# Naukri is India's largest job board. It's a React SPA — needs Playwright.
# We search Naukri directly for senior PM roles in India.
# This covers roles from companies that don't use Western ATS platforms
# (traditional Indian enterprises, PSUs, Indian MNCs, etc.)

from playwright.async_api import async_playwright
from typing import List
from .base import RawJobRecord
import asyncio
import logging

logger = logging.getLogger(__name__)

NAUKRI_SEARCH_URLS = [
    "https://www.naukri.com/senior-product-manager-jobs-in-india",
    "https://www.naukri.com/principal-product-manager-jobs-in-india",
    "https://www.naukri.com/lead-product-manager-jobs-in-india",
    "https://www.naukri.com/group-product-manager-jobs-in-india",
    "https://www.naukri.com/head-of-product-jobs-in-india",
    "https://www.naukri.com/director-product-management-jobs-in-india",
]

MAX_PAGES_PER_QUERY = 3   # 20 results per page = 60 per query


async def scrape_naukri(title_flex: int = 1) -> List[RawJobRecord]:
    """
    Scrapes Naukri for senior PM jobs.
    Returns RawJobRecord list.
    """
    results = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
            ]
        )

        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
            locale="en-IN",
            timezone_id="Asia/Kolkata",
        )

        page = await context.new_page()

        # Hide automation signals
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        """)

        for search_url in NAUKRI_SEARCH_URLS:
            logger.info(f"[Naukri] Scraping: {search_url}")

            for page_num in range(1, MAX_PAGES_PER_QUERY + 1):
                url = f"{search_url}-{page_num}" if page_num > 1 else search_url

                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                    await asyncio.sleep(2)

                    # Wait for job cards to appear
                    try:
                        await page.wait_for_selector("article.jobTuple, div.srp-jobtuple-wrapper", timeout=10000)
                    except Exception:
                        logger.info(f"[Naukri] No job cards found at {url} — stopping pagination")
                        break

                    # Try multiple selectors — Naukri changes their DOM frequently
                    job_cards = await page.query_selector_all("article.jobTuple")
                    if not job_cards:
                        job_cards = await page.query_selector_all("div.srp-jobtuple-wrapper")
                    if not job_cards:
                        logger.info(f"[Naukri] No cards matched any selector at page {page_num}")
                        break

                    logger.info(f"[Naukri] Page {page_num}: {len(job_cards)} cards found")

                    for card in job_cards:
                        try:
                            # Title
                            title_el = (
                                await card.query_selector("a.title") or
                                await card.query_selector("a.jobTitle") or
                                await card.query_selector("[class*='title'] a")
                            )
                            title = (await title_el.inner_text()).strip() if title_el else ""
                            href = await title_el.get_attribute("href") if title_el else ""

                            if not title:
                                continue

                            # Company
                            company_el = (
                                await card.query_selector("a.subTitle") or
                                await card.query_selector("a.companyName") or
                                await card.query_selector("[class*='company'] a")
                            )
                            company = (await company_el.inner_text()).strip() if company_el else ""

                            # Location
                            loc_el = (
                                await card.query_selector("span.locWdth") or
                                await card.query_selector("span.location") or
                                await card.query_selector("[class*='location']")
                            )
                            location = (await loc_el.inner_text()).strip() if loc_el else "India"

                            # Experience
                            exp_el = (
                                await card.query_selector("span.expwdth") or
                                await card.query_selector("span.experience") or
                                await card.query_selector("[class*='experience']")
                            )
                            experience = (await exp_el.inner_text()).strip() if exp_el else ""

                            # Posted date
                            date_el = (
                                await card.query_selector("span.type2") or
                                await card.query_selector("span.date") or
                                await card.query_selector("[class*='date']")
                            )
                            posted = (await date_el.inner_text()).strip() if date_el else ""

                            # Salary (Naukri sometimes discloses this)
                            salary_el = await card.query_selector("span.salary, [class*='salary']")
                            salary = (await salary_el.inner_text()).strip() if salary_el else ""

                            work_mode = "Remote" if "remote" in location.lower() else (
                                "Hybrid" if "hybrid" in location.lower() else "Onsite"
                            )

                            results.append(RawJobRecord(
                                company_name=company,
                                company_id="",
                                exact_role_title=title,
                                source_url=href if href.startswith("http") else f"https://www.naukri.com{href}",
                                ats_platform="naukri",
                                source_label=f"Naukri @ {company}",
                                location=location,
                                location_written=True,
                                work_mode=work_mode,
                                work_mode_written=work_mode == "Remote",
                                posted_date=posted,
                                raw_description=experience,
                                salary_written=bool(salary),
                                raw_metadata={"experience": experience, "salary": salary},
                            ))

                        except Exception as e:
                            logger.debug(f"[Naukri] Card parse error: {e}")
                            continue

                    await asyncio.sleep(2)  # polite delay between pages

                except Exception as e:
                    logger.error(f"[Naukri] Page load failed for {url}: {e}")
                    break

        await browser.close()

    logger.info(f"[Naukri] Total scraped: {len(results)}")
    return results
```

Add Naukri to the search engine in `backend/app/search/engine.py`:

```python
from ..scrapers.naukri import scrape_naukri

async def run_search(self, query: SearchQuery, progress_callback=None) -> List[Job]:
    # ... existing ATS scraper code ...

    # Add Naukri layer for India searches
    if query.country in ["India", ""] or "india" in query.location.lower():
        if progress_callback:
            await progress_callback("Scanning Naukri...", "Naukri", total, total)
        naukri_results = await scrape_naukri(title_flex=query.title_flex)
        all_raw.extend(naukri_results)

    # ... continue with SerpAPI + dedup + enrichment ...
```

---

## FIX 9 — RUN DISCOVERY ON FIRST DEPLOY

After all code changes are deployed, run discovery immediately to populate the registry.
Do this via the admin endpoint — don't wait for the weekly cron:

```bash
# Trigger discovery manually on first deploy
curl -X POST https://your-backend.railway.app/api/admin/trigger-discovery \
  -H "x-admin-key: your-admin-secret-key"

# Check how many companies were added
curl https://your-backend.railway.app/api/admin/company-count \
  -H "x-admin-key: your-admin-secret-key"
```

Expected output after first discovery run:
```json
{
  "total": 4800,
  "active": 4800,
  "by_platform": {
    "greenhouse": 3200,
    "lever": 900,
    "ashby": 400,
    "smartrecruiters": 150,
    "workday": 80,
    "direct": 70
  }
}
```

---

## FIX 10 — DEDUPLICATION MUST HANDLE COMPANY-LESS RECORDS

SerpAPI and Naukri results don't have a `company_id` (they're not in our registry).
The deduplicator must handle this gracefully.

In `backend/app/enrichment/deduplicator.py`, ensure the DB check handles empty company_id:

```python
async def filter_new(self, records: List[RawJobRecord]) -> List[RawJobRecord]:
    new = []
    seen_hashes = set()

    for record in records:
        # Skip records with no source URL
        if not record.source_url:
            continue

        url_hash = record.source_url_hash

        # In-batch dedup
        if url_hash in seen_hashes:
            continue
        seen_hashes.add(url_hash)

        # DB dedup — check by URL hash only (company_id may be empty for Google/Naukri results)
        try:
            existing = (await self.db.exec(
                select(Job).where(Job.source_url_hash == url_hash)
            )).first()

            if existing:
                existing.last_seen_at = datetime.utcnow()
                continue

        except Exception as e:
            logger.error(f"[Dedup] DB check failed for {record.source_url}: {e}")
            continue

        new.append(record)

    return new
```

---

## SUMMARY CHECKLIST FOR CURSOR

Work through these in order. Verify each one before moving to the next.

**Immediate fixes (do first — unblocks all results):**
- [ ] Fix `asyncio.gather` exception handling in `runner.py` — wrap in `safe_scrape()`
- [ ] Fix Lever JSON parsing — `resp.json()` returns a list, not `{"jobs": [...]}`
- [ ] Add verbose per-scraper logging everywhere
- [ ] Run a test search and verify results now come from Greenhouse + Lever + Ashby

**Auto-discovery (breaks the 202-company ceiling):**
- [ ] Create `backend/app/scrapers/discovery.py` with all four discovery functions
- [ ] Add `POST /api/admin/trigger-discovery` endpoint
- [ ] Add `GET /api/admin/company-count` endpoint
- [ ] Add weekly discovery cron to scheduler
- [ ] Trigger discovery manually and verify 4,000+ companies are added to DB

**Google Jobs layer (fills the gaps):**
- [ ] Create `backend/app/scrapers/serpapi_scraper.py`
- [ ] Add `SERPAPI_KEY` to `.env` and `config.py`
- [ ] Integrate SerpAPI calls into `search/engine.py` after ATS scrapers
- [ ] Verify SerpAPI results appear in search results

**Naukri (India depth):**
- [ ] Create `backend/app/scrapers/naukri.py`
- [ ] Integrate Naukri into `search/engine.py` for India searches
- [ ] Verify Naukri results appear for India-based searches

**Deduplication:**
- [ ] Update `deduplicator.py` to handle records without `company_id`

**Verification:**
- [ ] Run a search for "Senior Product Manager, India, Open flexibility"
- [ ] Confirm results from at least 10 different companies
- [ ] Confirm results from both ATS (Greenhouse/Lever/Ashby) AND Google Jobs AND Naukri
- [ ] Confirm no duplicate jobs appear (same role, same company, same URL)

**Do not change DB schema. Do not change frontend. Do not change existing API route signatures.**
