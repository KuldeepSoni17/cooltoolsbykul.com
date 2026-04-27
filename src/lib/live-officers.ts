import { load } from "cheerio";
import { Officer } from "@/data/departments";

const PHONE_REGEX = /(?:\+91[-\s]?)?(?:\d{3,5}[-\s]?\d{5,8}|\d{10})/g;
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

type SourceConfig = {
  url: string;
  keywords: string[];
};

const SOURCE_BY_DEPARTMENT: Record<string, SourceConfig> = {
  "bbmp-roads": {
    url: "https://site.bbmp.gov.in/zonewiseofficers.html",
    keywords: ["road", "engineer", "infrastructure", "executive engineer"],
  },
  "bbmp-swd": {
    url: "https://site.bbmp.gov.in/zonewiseofficers.html",
    keywords: ["storm", "drain", "swd", "manhole", "engineer"],
  },
  "bbmp-swm": {
    url: "https://site.bbmp.gov.in/zonewiseofficers.html",
    keywords: ["waste", "health", "sanitation", "swm", "officer"],
  },
  "bbmp-electrical": {
    url: "https://site.bbmp.gov.in/zonewiseofficers.html",
    keywords: ["electrical", "street light", "engineer", "electric"],
  },
  "bbmp-town-planning": {
    url: "https://site.bbmp.gov.in/zonewiseofficers.html",
    keywords: ["planning", "town", "enforcement", "encroachment"],
  },
  "bbmp-parks": {
    url: "https://site.bbmp.gov.in/zonewiseofficers.html",
    keywords: ["horticulture", "park", "garden", "tree"],
  },
  bwssb: {
    url: "https://bwssb.karnataka.gov.in/page/Contact+Us/en",
    keywords: ["water", "sewer", "engineer", "bwssb", "complaint"],
  },
  bescom: {
    url: "https://bescom.karnataka.gov.in/page/Contact+Us/en",
    keywords: ["electricity", "engineer", "bescom", "subdivision"],
  },
  "bengaluru-traffic-police": {
    url: "https://www.bangaloretrafficpolice.gov.in/",
    keywords: ["traffic", "police", "commissioner", "control room"],
  },
};

function scoreLine(line: string, keywords: string[]) {
  const normalized = line.toLowerCase();
  return keywords.reduce(
    (score, keyword) => score + (normalized.includes(keyword) ? 1 : 0),
    0
  );
}

function parseContactsFromHtml(
  html: string,
  keywords: string[],
  fallbackDesignation: string
) {
  const $ = load(html);
  const chunks: string[] = [];

  $("tr, li, p, td, div").each((_, node) => {
    const text = $(node).text().replace(/\s+/g, " ").trim();
    if (text.length >= 15 && text.length <= 280) {
      chunks.push(text);
    }
  });

  const unique = Array.from(new Set(chunks));
  const ranked = unique
    .map((line) => ({ line, score: scoreLine(line, keywords) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  const officers: Officer[] = [];
  for (const entry of ranked) {
    const phones = entry.line.match(PHONE_REGEX) ?? [];
    const emails = entry.line.match(EMAIL_REGEX) ?? [];

    if (phones.length === 0 && emails.length === 0) continue;

    officers.push({
      name: entry.line.slice(0, 80),
      designation: fallbackDesignation,
      phone: phones[0],
      email: emails[0],
      note: "Fetched live from official portal",
    });
    if (officers.length >= 3) break;
  }

  return officers;
}

export async function fetchLiveOfficersForDepartment(
  departmentId: string
): Promise<{ officers: Officer[]; sourceUrl?: string }> {
  const source = SOURCE_BY_DEPARTMENT[departmentId];
  if (!source) return { officers: [] };

  try {
    const res = await fetch(source.url, {
      headers: {
        "User-Agent": "WhosResponsible/1.0 (civic-accountability-app)",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { officers: [], sourceUrl: source.url };
    const html = await res.text();
    const officers = parseContactsFromHtml(html, source.keywords, "Officer");
    return { officers, sourceUrl: source.url };
  } catch {
    return { officers: [], sourceUrl: source.url };
  }
}
