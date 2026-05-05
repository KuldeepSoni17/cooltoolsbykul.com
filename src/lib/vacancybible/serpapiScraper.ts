import type { RawJobRecord } from "./types";

const SERPAPI_URL = "https://serpapi.com/search.json";

function detectAtsFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("greenhouse.io")) return "greenhouse";
  if (lower.includes("lever.co")) return "lever";
  if (lower.includes("ashbyhq.com")) return "ashby";
  if (lower.includes("myworkdayjobs.com") || lower.includes("workday.com")) return "workday";
  if (lower.includes("smartrecruiters.com")) return "smartrecruiters";
  if (lower.includes("icims.com")) return "icims";
  if (lower.includes("taleo.net")) return "taleo";
  return "direct";
}

function slugifyCompany(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function searchGoogleJobs(
  query: string,
  location: string,
  datePosted: "week" | "month" | "today" = "month",
  numPages = 2,
): Promise<RawJobRecord[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.warn("[SerpAPI] SERPAPI_KEY not configured - skipping");
    return [];
  }

  const records: RawJobRecord[] = [];
  for (let page = 0; page < numPages; page += 1) {
    const params = new URLSearchParams({
      engine: "google_jobs",
      q: query,
      location,
      chips: `date_posted:${datePosted}`,
      start: String(page * 10),
      api_key: apiKey,
      hl: "en",
      gl: "in",
    });
    const url = `${SERPAPI_URL}?${params.toString()}`;
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) {
        console.error(`[SerpAPI] HTTP ${resp.status} on page ${page}`);
        break;
      }
      const data = (await resp.json()) as {
        jobs_results?: Array<{
          title?: string;
          company_name?: string;
          location?: string;
          description?: string;
          apply_options?: Array<{ link?: string }>;
          detected_extensions?: { posted_at?: string };
        }>;
      };
      const jobs = data.jobs_results ?? [];
      if (jobs.length === 0) break;
      console.log(`[SerpAPI] Page ${page}: ${jobs.length} jobs`);
      for (const job of jobs) {
        const companyName = job.company_name ?? "Unknown Company";
        const applyOptions = job.apply_options ?? [];
        let applyUrl = "";
        for (const option of applyOptions) {
          const link = option.link ?? "";
          if (
            link &&
            !["linkedin.com", "indeed.com", "naukri.com", "glassdoor.com", "monster.com"].some((board) =>
              link.includes(board),
            )
          ) {
            applyUrl = link;
            break;
          }
        }
        applyUrl ||= applyOptions[0]?.link ?? "";

        records.push({
          companySlug: slugifyCompany(companyName) || "unknown",
          companyName,
          sourceUrl: applyUrl,
          title: job.title ?? "",
          location: job.location ?? "",
          description: job.description ?? "",
          postedAt: job.detected_extensions?.posted_at,
          metadata: {
            source: "serpapi",
            ats: detectAtsFromUrl(applyUrl),
          },
        });
      }
    } catch (error) {
      console.error(`[SerpAPI] Failed page ${page}:`, error);
      break;
    }
  }
  console.log(`[SerpAPI] Total results: ${records.length}`);
  return records;
}

export function buildSerpapiQueries(query: {
  title?: string;
  location?: string;
  titleFlex?: number;
  locationFlex?: number;
}): Array<{ query: string; location: string; datePosted: "month" }> {
  const baseTitle = query.title?.trim() || "Senior Product Manager";
  const baseLocation = query.location?.trim() || "India";
  const results: Array<{ query: string; location: string; datePosted: "month" }> = [
    { query: baseTitle, location: baseLocation, datePosted: "month" },
  ];

  if ((query.titleFlex ?? 1) >= 1) {
    for (const t of [
      "Lead Product Manager",
      "Principal Product Manager",
      "Group Product Manager",
      "Director of Product",
    ]) {
      results.push({ query: t, location: baseLocation, datePosted: "month" });
    }
  }

  if ((query.locationFlex ?? 1) >= 2) {
    results.push({ query: baseTitle, location: "Remote India", datePosted: "month" });
  }

  return results;
}
