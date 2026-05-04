import { createHash, randomUUID } from "crypto";
import type { FlexMode, SearchInput } from "./types";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function makeId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

const SENIOR_PM_PATTERNS = [
  "senior product manager",
  "senior pm",
  "sr. product manager",
  "sr product manager",
  "sr. pm",
  "lead product manager",
  "lead pm",
  "principal product manager",
  "principal pm",
  "group product manager",
  "group pm",
  "gpm",
  "staff product manager",
  "staff pm",
  "director of product",
  "director, product",
  "product director",
  "director of product management",
  "head of product",
  "head of product management",
  "vp of product",
  "vp, product",
  "vice president of product",
  "associate director",
  "product lead",
  "senior associate, product",
  "senior associate product",
  "senior product owner",
  "lead product owner",
];

const BROADER_PM_PATTERNS = ["product manager", "product management", "product owner", " pm "];

function matchesTitlePatterns(title: string, flex: FlexMode): boolean {
  const t = title.toLowerCase().trim();
  const seniorMatch = SENIOR_PM_PATTERNS.some((p) => t.includes(p));
  if (flex === "STRICT" || flex === "FLEXIBLE") {
    return seniorMatch;
  }
  return seniorMatch || BROADER_PM_PATTERNS.some((p) => t.includes(p));
}

export function expandTitle(title: string, mode: FlexMode): string[] {
  const normalized = title.trim().toLowerCase();
  if (mode === "STRICT" || mode === "FLEXIBLE") {
    return [normalized, ...SENIOR_PM_PATTERNS];
  }
  return [normalized, ...SENIOR_PM_PATTERNS, ...BROADER_PM_PATTERNS];
}

export function shouldMatchText(value: string | undefined, query: SearchInput): boolean {
  if (!value) return false;
  const text = value.toLowerCase().trim();
  if (!matchesTitlePatterns(text, query.flexibility.title)) {
    return false;
  }

  if (query.location?.trim()) {
    const locationText = query.location.toLowerCase();
    if (query.flexibility.location === "STRICT") {
      return text.includes(locationText);
    }
    return text.includes(locationText) || text.includes("remote");
  }
  return true;
}
