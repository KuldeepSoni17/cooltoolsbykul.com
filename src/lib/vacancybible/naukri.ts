import { load } from "cheerio";
import type { RawJobRecord } from "./types";

const NAUKRI_SEARCH_URLS = [
  "https://www.naukri.com/senior-product-manager-jobs-in-india",
  "https://www.naukri.com/principal-product-manager-jobs-in-india",
  "https://www.naukri.com/lead-product-manager-jobs-in-india",
  "https://www.naukri.com/group-product-manager-jobs-in-india",
  "https://www.naukri.com/head-of-product-jobs-in-india",
  "https://www.naukri.com/director-product-management-jobs-in-india",
];

function safeAbsoluteUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://www.naukri.com${url}`;
}

export async function scrapeNaukri(maxPagesPerQuery = 2): Promise<RawJobRecord[]> {
  const results: RawJobRecord[] = [];
  for (const baseUrl of NAUKRI_SEARCH_URLS) {
    for (let pageNum = 1; pageNum <= maxPagesPerQuery; pageNum += 1) {
      const url = pageNum > 1 ? `${baseUrl}-${pageNum}` : baseUrl;
      console.log(`[Naukri] Scraping: ${url}`);
      try {
        const resp = await fetch(url, {
          cache: "no-store",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          },
        });
        if (!resp.ok) {
          console.warn(`[Naukri] HTTP ${resp.status} at ${url}`);
          break;
        }
        const html = await resp.text();
        const $ = load(html);
        const cards = $("article.jobTuple, div.srp-jobtuple-wrapper");
        if (cards.length === 0) break;

        cards.each((_, element) => {
          const card = $(element);
          const titleEl = card.find("a.title, a.jobTitle, [class*='title'] a").first();
          const title = titleEl.text().trim();
          const href = safeAbsoluteUrl(titleEl.attr("href") ?? "");
          if (!title) return;

          const company = card.find("a.subTitle, a.companyName, [class*='company'] a").first().text().trim();
          const location = card
            .find("span.locWdth, span.location, [class*='location']")
            .first()
            .text()
            .trim();
          const experience = card
            .find("span.expwdth, span.experience, [class*='experience']")
            .first()
            .text()
            .trim();
          const posted = card.find("span.type2, span.date, [class*='date']").first().text().trim();
          const salary = card.find("span.salary, [class*='salary']").first().text().trim();

          results.push({
            companySlug: company
              ? company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
              : "naukri",
            companyName: company || "Naukri Listing",
            sourceUrl: href || url,
            title,
            location: location || "India",
            description: experience,
            postedAt: posted,
            metadata: {
              source: "naukri",
              salary,
            },
          });
        });
      } catch (error) {
        console.error(`[Naukri] Failed ${url}:`, error);
        break;
      }
    }
  }
  console.log(`[Naukri] Total scraped: ${results.length}`);
  return results;
}
