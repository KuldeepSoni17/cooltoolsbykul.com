# VacancyBible — Cursor Fix: Scraper Coverage & Results Bug
### Two issues to fix completely. Do not move on until both are verified working.

---

## THE TWO PROBLEMS

1. **Results only come from Supabase** — out of 58 companies, only Supabase returns jobs. Every other scraper is silently failing or being filtered out.
2. **Company coverage is too small** — 58 companies is not enough. We need 200+ companies across India and global.

Fix both completely.

---

## FIX 1 — WHY ONLY SUPABASE IS RETURNING RESULTS

Supabase uses Ashby. The Ashby scraper works. Everything else is broken somewhere.
Do a full diagnostic pass in this order:

### Step 1 — Add Aggressive Logging to Every Scraper

In every scraper class (Greenhouse, Lever, Ashby, Workday, SmartRecruiters, all Direct scrapers), add this logging pattern:

```python
async def scrape(self) -> List[RawJobRecord]:
    print(f"[{self.name} @ {self.company.name}] Starting scrape → {self.url}")
    try:
        resp = await client.get(self.url)
        print(f"[{self.name} @ {self.company.name}] HTTP {resp.status_code} — {len(data)} jobs in response")
        matched = [j for j in data if self.matches_query(j['title'])]
        print(f"[{self.name} @ {self.company.name}] {len(matched)} matched title filter")
        return matched
    except Exception as e:
        print(f"[{self.name} @ {self.company.name}] FAILED — {type(e).__name__}: {e}")
        return []
```

Run a search and look at the logs. Every company should produce one of:
- `HTTP 200 — 45 jobs in response, 3 matched title filter` ← working
- `HTTP 404` ← wrong slug
- `HTTP 200 — 0 jobs in response` ← wrong slug or company has no open roles
- `FAILED — TimeoutError` ← network issue
- `HTTP 200 — 45 jobs, 0 matched` ← title filter too strict

Fix each failure type accordingly before moving to the next step.

### Step 2 — Fix the Greenhouse Scraper

The Greenhouse API URL must include `?content=true` to get job descriptions.
Verify the exact URL being called is:
```
https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true
```

Common reasons Greenhouse returns 0 results:
- Wrong slug (most common). The slug is NOT always the company name.
  Test every slug manually in a browser before using it:
  `https://boards-api.greenhouse.io/v1/boards/freshworks/jobs`
  If it returns `{"error": "..."}` or `{"jobs": []}` consistently — the slug is wrong.

- Known correct Greenhouse slugs (verify these are what's in the registry):
```python
VERIFIED_GREENHOUSE_SLUGS = {
    "freshworks":    "freshworks",
    "browserstack":  "browserstack",
    "meesho":        "meesho",
    "groww":         "groww",
    "chargebee":     "chargebee",
    "atlassian":     "atlassian",
    "stripe":        "stripe",
    "anthropic":     "anthropic",
    "notion":        "notion",
    "figma":         "figma",
    "vercel":        "vercel",
    "cohere":        "cohere",
    "uber":          "uber",
    "linkedin":      "linkedin",
    "coinbase":      "coinbase",
    "airbnb":        "airbnb",
    "cred":          "dreamplug",      # CRED uses slug "dreamplug" not "cred"
    "urban-company": "urbancompany",
    "cars24":        "cars24",
    "acko":          "acko",
    "ixigo":         "ixigo",
    "postman":       "postman",
    "clevertap":     "clevertap",
    "sprinklr":      "sprinklr",
    "wise":          "wiseuk",         # Wise uses "wiseuk"
    "revolut":       "revolut",
    "scaleai":       "scaleai",
    "salesforce":    "salesforce",
}
```

- Add a slug validation utility that runs at startup and logs all invalid slugs:
```python
async def validate_all_greenhouse_slugs():
    async with httpx.AsyncClient(timeout=10) as client:
        for company, slug in VERIFIED_GREENHOUSE_SLUGS.items():
            try:
                r = await client.get(f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs")
                count = len(r.json().get("jobs", []))
                status = "✓ VALID" if r.status_code == 200 else "✗ INVALID"
                print(f"  {status} — {company} (slug: {slug}) — {count} total jobs")
            except Exception as e:
                print(f"  ✗ ERROR — {company}: {e}")
```

Run this on app startup or via `GET /api/admin/validate-slugs` endpoint.

### Step 3 — Fix the Lever Scraper

Lever API URL:
```
https://api.lever.co/v0/postings/{slug}?mode=json
```

Known correct Lever slugs:
```python
VERIFIED_LEVER_SLUGS = {
    "razorpay":   "razorpay",
    "swiggy":     "swiggy",
    "zepto":      "zeptonow",     # Zepto uses "zeptonow" not "zepto"
    "spinny":     "spinny",
    "purplle":    "purplle",
    "mpl":        "mpl",
    "slice":      "sliceit",      # Slice uses "sliceit"
    "open":       "openfinancial",
}
```

Note: Lever returns an empty array `[]` for invalid slugs with HTTP 200.
This is why it silently fails — 200 status but no jobs.
Detect this: if response is `[]`, log it as "slug may be invalid — returned empty array".

### Step 4 — Fix the Ashby Scraper

Ashby works (confirmed by Supabase returning results). 
Verify these slugs are correct in the registry:
```python
VERIFIED_ASHBY_SLUGS = {
    "linear":      "linear",
    "supabase":    "supabase",      # confirmed working
    "retool":      "retool",
    "ramp":        "ramp",
    "mercury":     "mercury",
    "perplexity":  "perplexity-ai", # uses "perplexity-ai" not "perplexity"
    "dbt-labs":    "dbtlabs",
}
```

### Step 5 — Fix the Title Matching Filter

Even when scrapers return jobs, the title filter may be dropping them.
The current filter must handle ALL of these real-world title formats:

```python
SENIOR_PM_PATTERNS = [
    # Standard
    "senior product manager",
    "senior pm",
    "sr. product manager",
    "sr product manager",
    "sr. pm",

    # Lead
    "lead product manager",
    "lead pm",

    # Principal
    "principal product manager",
    "principal pm",

    # Group
    "group product manager",
    "group pm",
    "gpm",

    # Staff
    "staff product manager",
    "staff pm",

    # Director level
    "director of product",
    "director, product",
    "product director",
    "director of product management",

    # Head of
    "head of product",
    "head of product management",

    # VP
    "vp of product",
    "vp, product",
    "vice president of product",

    # India-specific variants
    "associate director",
    "product lead",
    "senior associate, product",
    "senior associate product",
    "senior product owner",
    "lead product owner",
]

# When flex = Open, also include:
BROADER_PM_PATTERNS = [
    "product manager",
    "product management",
    "product owner",
]

def matches_query(title: str, flex: int = 1) -> bool:
    t = title.lower().strip()
    senior_match = any(p in t for p in SENIOR_PM_PATTERNS)
    if flex <= 1:
        return senior_match
    return senior_match or any(p in t for p in BROADER_PM_PATTERNS)
```

### Step 6 — Check the Search Query is Passing Flex Correctly

Verify that when the user selects "Open" on the frontend, the API receives `flex=2` (or equivalent).
Check the SearchQuery object being constructed from the form submission.
A common bug: flex defaults to 1 (Flexible) even when user selects Open, because the form state isn't wired to the API payload.

Print the full search query object in the backend log on every search:
```python
print(f"[Search] Query received: {query.dict()}")
```

---

## FIX 2 — EXPAND TO 200+ COMPANIES

Add all companies below to the registry. These are real companies with known ATS platforms.
Organise them by ATS so the scraper routing is clean.

---

### GREENHOUSE COMPANIES (add all to Greenhouse scraper)

```python
GREENHOUSE_COMPANIES = {
    # India
    "freshworks":        "Freshworks",
    "browserstack":      "BrowserStack",
    "meesho":            "Meesho",
    "groww":             "Groww",
    "chargebee":         "Chargebee",
    "acko":              "Acko",
    "ixigo":             "Ixigo",
    "cars24":            "Cars24",
    "urbancompany":      "Urban Company",
    "postman":           "Postman",
    "clevertap":         "CleverTap",
    "sprinklr":          "Sprinklr",
    "moengage":          "MoEngage",
    "dreamplug":         "CRED",           # CRED's actual Greenhouse slug
    "setu":              "Setu",
    "smallcase":         "Smallcase",
    "niyo":              "Niyo",
    "epifi":             "Fi Money",
    "jupiter":           "Jupiter Money",
    "acceldata":         "Acceldata",
    "leadsquared":       "LeadSquared",
    "hasura":            "Hasura",
    "tooljet":           "ToolJet",
    "appsmith":          "Appsmith",
    "rudderstack":       "RudderStack",
    "clarisights":       "Clarisights",
    "kapture":           "Kapture CX",
    "cashfree":          "Cashfree",
    "signzy":            "Signzy",
    "setu":              "Setu",

    # Global Big Tech
    "atlassian":         "Atlassian",
    "uber":              "Uber",
    "linkedin":          "LinkedIn",
    "salesforce":        "Salesforce",
    "stripe":            "Stripe",
    "notion":            "Notion",
    "figma":             "Figma",
    "vercel":            "Vercel",
    "anthropic":         "Anthropic",
    "cohere":            "Cohere",
    "scaleai":           "Scale AI",
    "coinbase":          "Coinbase",
    "airbnb":            "Airbnb",
    "dropbox":           "Dropbox",
    "twilio":            "Twilio",
    "segment":           "Segment",
    "brex":              "Brex",
    "rippling":          "Rippling",
    "lattice":           "Lattice",
    "amplitude":         "Amplitude",
    "mixpanel":          "Mixpanel",
    "intercom":          "Intercom",
    "zendesk":           "Zendesk",
    "hubspot":           "HubSpot",
    "asana":             "Asana",
    "gitlab":            "GitLab",
    "hashicorp":         "HashiCorp",
    "mongodb":           "MongoDB",
    "datadog":           "Datadog",
    "elastic":           "Elastic",
    "confluent":         "Confluent",
    "dbt-labs":          "dbt Labs",       # also on Ashby, verify which
    "benchling":         "Benchling",
    "carta":             "Carta",
    "chime":             "Chime",
    "plaid":             "Plaid",
    "marqeta":           "Marqeta",
    "affirm":            "Affirm",
    "checkr":            "Checkr",
    "gusto":             "Gusto",
    "toast":             "Toast",
    "procore":           "Procore",
    "samsara":           "Samsara",
    "verkada":           "Verkada",
    "wiseuk":            "Wise",           # Wise's actual slug
    "revolut":           "Revolut",
    "monzo":             "Monzo",
    "gocardless":        "GoCardless",
    "checkout":          "Checkout.com",
    "sumup":             "SumUp",
    "klarna":            "Klarna",
    "adyen":             "Adyen",

    # AI / ML
    "huggingface":       "Hugging Face",
    "mistral":           "Mistral AI",
    "perplexity":        "Perplexity",     # also try "perplexity-ai"
    "together-ai":       "Together AI",
    "anyscale":          "Anyscale",
    "weights-biases":    "Weights & Biases",
    "wandb":             "W&B",
    "landing-ai":        "Landing AI",
    "labelbox":          "Labelbox",
    "snorkel-ai":        "Snorkel AI",
}
```

---

### LEVER COMPANIES (add all to Lever scraper)

```python
LEVER_COMPANIES = {
    # India
    "razorpay":          "Razorpay",
    "swiggy":            "Swiggy",
    "zeptonow":          "Zepto",          # actual slug: zeptonow
    "spinny":            "Spinny",
    "purplle":           "Purplle",
    "mpl":               "MPL",
    "sliceit":           "Slice",          # actual slug: sliceit
    "openfinancial":     "Open Financial",
    "dunzo":             "Dunzo",
    "milkbasket":        "Milkbasket",
    "shadowfax":         "Shadowfax",
    "delhivery":         "Delhivery",
    "loadshare":         "LoadShare",
    "porter":            "Porter",
    "rapido":            "Rapido",
    "yulu":              "Yulu",
    "bounce":            "Bounce",
    "vedantu":           "Vedantu",
    "physicswallah":     "Physics Wallah",
    "unacademy":         "Unacademy",
    "classplus":         "Classplus",
    "leadschool":        "Lead School",
    "eruditus":          "Eruditus",
    "emeritus":          "Emeritus",
    "upgrad":            "upGrad",
    "masaischool":       "Masai School",
    "scaler":            "Scaler",
    "stanza-living":     "Stanza Living",
    "nestaway":          "Nestaway",
    "nobroker":          "NoBroker",
    "magicbricks":       "MagicBricks",
    "housing":           "Housing.com",
    "droom":             "Droom",
    "cardekho":          "CarDekho",
    "bikes24":           "Bikes24",
    "beamery":           "Beamery",

    # Global
    "linear":            "Linear",         # also on Ashby, check which
    "loom":              "Loom",
    "retool":            "Retool",         # also on Ashby
    "mercury":           "Mercury",
    "ramp":              "Ramp",
    "pilot":             "Pilot",
    "remote":            "Remote",
    "deel":              "Deel",
    "papaya-global":     "Papaya Global",
    "workato":           "Workato",
    "calendly":          "Calendly",
    "lempire":           "Lempire",
    "sendbird":          "Sendbird",
    "contentful":        "Contentful",
    "storyblok":         "Storyblok",
    "sanity":            "Sanity",
    "hygraph":           "Hygraph",
    "fauna":             "Fauna",
    "planetscale":       "PlanetScale",
    "cockroachlabs":     "CockroachLabs",
    "timescale":         "Timescale",
    "clickhouse":        "ClickHouse",
    "singlestore":       "SingleStore",
}
```

---

### ASHBY COMPANIES (add all to Ashby scraper)

```python
ASHBY_COMPANIES = {
    "linear":            "Linear",
    "supabase":          "Supabase",
    "retool":            "Retool",
    "ramp":              "Ramp",
    "mercury":           "Mercury",
    "perplexity-ai":     "Perplexity",
    "dbtlabs":           "dbt Labs",
    "hex":               "Hex",
    "arc":               "Arc",
    "loom":              "Loom",
    "hightouch":         "Hightouch",
    "census":            "Census",
    "metabase":          "Metabase",
    "posthog":           "PostHog",
    "lago":              "Lago",
    "trigger":           "Trigger.dev",
    "resend":            "Resend",
    "neon":              "Neon",
    "turso":             "Turso",
    "outerbase":         "Outerbase",
    "basecamp":          "Basecamp",
    "readwise":          "Readwise",
    "fathom":            "Fathom",
    "cal":               "Cal.com",
    "dub":               "Dub.co",
    "loop":              "Loop",
    "puzzle":            "Puzzle",
    "vanta":             "Vanta",
    "drata":             "Drata",
    "secureframe":       "Secureframe",
    "anrok":             "Anrok",
    "roboflow":          "Roboflow",
    "encord":            "Encord",
    "scale":             "Scale AI",      # also on Greenhouse, check which
    "comet-ml":          "Comet ML",
    "arize":             "Arize AI",
    "whylabs":           "WhyLabs",
    "fiddler":           "Fiddler AI",
}
```

---

### SMARTRECRUITERS COMPANIES

```python
SMARTRECRUITERS_COMPANIES = {
    "IKEA":              "IKEA",
    "Booking.com":       "Booking.com",
    "Lidl":              "Lidl",
    "Skechers":          "Skechers",
    "Visa":              "Visa",
    "McDonald":          "McDonald's",
    "Bosch":             "Bosch",
    "Siemens":           "Siemens",
    "SAP":               "SAP",
    "Thoughtworks":      "Thoughtworks",
    "GlobalLogic":       "GlobalLogic",
}
```

---

### WORKDAY COMPANIES

```python
WORKDAY_COMPANIES = [
    # These need company-specific Workday URLs
    {
        "name": "Walmart",
        "workday_url": "https://walmart.wd5.myworkdayjobs.com/WalmartExternal",
    },
    {
        "name": "Adobe",
        "workday_url": "https://adobe.wd5.myworkdayjobs.com/external_experienced",
    },
    {
        "name": "Oracle",
        "workday_url": "https://oracle.wd1.myworkdayjobs.com/External_US",
    },
    {
        "name": "Workday",
        "workday_url": "https://workday.wd5.myworkdayjobs.com/Workday",
    },
    {
        "name": "ServiceNow",
        "workday_url": "https://servicenow.wd5.myworkdayjobs.com/External",
    },
    {
        "name": "VMware",
        "workday_url": "https://vmware.wd1.myworkdayjobs.com/VMware",
    },
    {
        "name": "OYO",
        "workday_url": "https://oyo.wd3.myworkdayjobs.com/oyocareers",
    },
    {
        "name": "Zomato",
        "workday_url": "https://zomato.wd3.myworkdayjobs.com/Zomato-Careers",
    },
    {
        "name": "Flipkart",
        "workday_url": "https://flipkart.wd3.myworkdayjobs.com/Flipkart_Careers",
    },
    {
        "name": "Infosys",
        "workday_url": "https://infosys.wd3.myworkdayjobs.com/Infosys_Careers",
    },
    {
        "name": "Wipro",
        "workday_url": "https://wipro.wd3.myworkdayjobs.com/Wipro_Careers",
    },
    {
        "name": "HCL",
        "workday_url": "https://hcltech.wd3.myworkdayjobs.com/HCLTech",
    },
    {
        "name": "TCS",
        "workday_url": "https://tcs.wd3.myworkdayjobs.com/TCS",
    },
]
```

For Workday scrapers, the search URL pattern is:
```
{workday_url}/jobs?q=product+manager&workerSubType=Regular
```
Use Playwright for Workday — it's a React SPA and doesn't have a public JSON API.

---

### DIRECT CAREER PAGE COMPANIES (Playwright required)

Build or fix a company-specific scraper for each of these.
Each one needs its own selector logic — do not use the generic fallback.

```python
DIRECT_COMPANIES = [
    {
        "name": "Google",
        "slug": "google",
        "search_url": "https://careers.google.com/jobs/results/?q=product+manager&location=India",
        "job_card_selector": "li.lLd3Je",
        "title_selector": "h3.QJPWVe",
        "location_selector": "span.r0wTof",
        "link_selector": "a.WpHeLc",
    },
    {
        "name": "Amazon",
        "slug": "amazon",
        "search_url": "https://www.amazon.jobs/en/search?base_query=senior+product+manager&loc_query=India",
        "job_card_selector": "div.job-tile",
        "title_selector": "h3.job-title",
        "location_selector": "p.location",
        "link_selector": "a.job-link",
    },
    {
        "name": "Microsoft",
        "slug": "microsoft",
        "search_url": "https://jobs.careers.microsoft.com/global/en/search?q=senior+product+manager&l=en_us&pg=1&pgSz=20&o=Relevance&flt=true",
        "note": "Microsoft uses a JSON API — fetch https://gcsservices.careers.microsoft.com/search/api/v1/search?q=product+manager&lc=India&l=en_us&pg=1&pgSz=20",
    },
    {
        "name": "Razorpay",
        "slug": "razorpay",
        "note": "Razorpay is on Lever — use Lever scraper with slug 'razorpay', not direct",
    },
    {
        "name": "PhonePe",
        "slug": "phonepe",
        "search_url": "https://phonepe.com/en-in/careers/",
        "job_card_selector": "div.job-listing-item",
        "title_selector": "h3",
        "link_selector": "a",
    },
    {
        "name": "Zerodha",
        "slug": "zerodha",
        "search_url": "https://zerodha.com/careers/",
        "note": "Zerodha careers page is static HTML — parse all <h2> job titles directly",
        "job_card_selector": "div.career-item",
        "title_selector": "h2",
        "link_selector": "a.button",
    },
    {
        "name": "Paytm",
        "slug": "paytm",
        "search_url": "https://jobs.lever.co/paytm",
        "note": "Paytm is actually on Lever — use Lever scraper with slug 'paytm'",
    },
    {
        "name": "Juspay",
        "slug": "juspay",
        "search_url": "https://juspay.in/careers",
        "job_card_selector": "div.job-card",
        "title_selector": "h3",
        "link_selector": "a",
    },
    {
        "name": "Navi",
        "slug": "navi",
        "search_url": "https://navi.com/careers",
        "note": "Navi uses Lever — try slug 'navitech' or 'navi'",
    },
    {
        "name": "Zoho",
        "slug": "zoho",
        "search_url": "https://careers.zohocorp.com/jobs/Careers",
        "note": "Zoho has their own careers portal, static HTML",
        "job_card_selector": "div.job-item",
        "title_selector": "a.job-title",
        "link_selector": "a.job-title",
    },
    {
        "name": "BharatPe",
        "slug": "bharatpe",
        "search_url": "https://bharatpe.com/careers",
        "note": "Check if BharatPe is on Greenhouse/Lever first before using direct",
    },
    {
        "name": "Nykaa",
        "slug": "nykaa",
        "search_url": "https://careers.nykaa.com/jobs/Careers",
        "note": "Check if Nykaa uses SmartRecruiters",
    },
    {
        "name": "Lenskart",
        "slug": "lenskart",
        "search_url": "https://lenskart.com/careers",
        "note": "May be on Lever — try slug 'lenskart'",
    },
]
```

---

## WORKDAY SCRAPER — FIX OR BUILD

If the Workday scraper doesn't exist or doesn't work, build it now.
Workday is a Playwright scraper. Pattern:

```python
class WorkdayScraper(BaseScraper):
    async def scrape(self) -> List[RawJobRecord]:
        search_url = f"{self.company.workday_url}/jobs"
        results = []

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
            page = await browser.new_page()

            # Build search URL with query params
            params = "?q=product+manager&workerSubType=Regular"
            await page.goto(search_url + params, wait_until="networkidle", timeout=45000)
            await asyncio.sleep(3)

            # Workday renders job cards in li[class*="WJEO"] or similar
            # The exact selector changes — use data-automation-id instead:
            job_cards = await page.query_selector_all("[data-automation-id='compositeContainer']")

            for card in job_cards:
                try:
                    title_el = await card.query_selector("[data-automation-id='jobTitle']")
                    title = await title_el.inner_text() if title_el else ""

                    if not self.matches_query(title):
                        continue

                    link_el = await card.query_selector("a")
                    href = await link_el.get_attribute("href") if link_el else ""
                    full_url = f"https://{self.company.workday_domain}{href}" if href.startswith("/") else href

                    loc_el = await card.query_selector("[data-automation-id='locations']")
                    location = await loc_el.inner_text() if loc_el else ""

                    results.append(RawJobRecord(
                        company_name=self.company.name,
                        company_id=str(self.company.id),
                        exact_role_title=title,
                        source_url=full_url,
                        ats_platform="workday",
                        source_label=f"Workday @ {self.company.name}",
                        location=location,
                        location_written=bool(location),
                    ))
                except Exception:
                    continue

            await browser.close()
        return results
```

---

## IMPLEMENTATION CHECKLIST

Work through this in order. Do not skip steps.

- [ ] Add verbose logging to every scraper (company name, HTTP status, total jobs, matched jobs)
- [ ] Run a test search and collect all logs
- [ ] Fix every slug that returns 0 or error using the verified slug lists above
- [ ] Add `validate_all_greenhouse_slugs()` and `validate_all_lever_slugs()` admin utilities
- [ ] Expand Greenhouse scraper company list to 80+ companies
- [ ] Expand Lever scraper company list to 50+ companies
- [ ] Expand Ashby scraper company list to 40+ companies
- [ ] Add SmartRecruiters companies to SmartRecruiters scraper
- [ ] Add Workday companies and build/fix Workday scraper
- [ ] Update direct scrapers with correct selectors per company
- [ ] Seed all new companies into the DB immediately
- [ ] Verify title matching works for flex=0, flex=1, flex=2
- [ ] Run a test search with flex=Open on all fields and confirm results from at least 20 different companies
- [ ] Confirm Supabase is NOT the only company returning results

**Do not change DB schema. Do not change API routes. Changes are: company registry, scraper modules, and logging only.**
