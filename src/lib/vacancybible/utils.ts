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
  "lead product manager",
  "lead pm",
  "principal product manager",
  "principal pm",
  "group product manager",
  "group pm",
  "director of product",
  "director, product",
  "product director",
  "sr. product manager",
  "sr product manager",
  "staff product manager",
  "head of product",
  "vp of product",
  "associate director",
  "product lead",
  "senior associate pm",
];

const BROADER_PM_PATTERNS = ["product manager", " pm ", "product owner"];

export function expandTitle(title: string, mode: FlexMode): string[] {
  const normalized = title.trim().toLowerCase();
  if (mode === "STRICT") return [normalized, ...SENIOR_PM_PATTERNS];
  if (mode === "FLEXIBLE") return [normalized, ...SENIOR_PM_PATTERNS];
  return [normalized, ...SENIOR_PM_PATTERNS, ...BROADER_PM_PATTERNS];
}

export function matchesTitleByFlex(title: string, mode: FlexMode): boolean {
  const normalized = ` ${title.toLowerCase().trim()} `;
  if (mode === "STRICT" || mode === "FLEXIBLE") {
    return SENIOR_PM_PATTERNS.some((pattern) => normalized.includes(` ${pattern} `));
  }
  return (
    SENIOR_PM_PATTERNS.some((pattern) => normalized.includes(` ${pattern} `)) ||
    BROADER_PM_PATTERNS.some((pattern) => normalized.includes(pattern))
  );
}

export function shouldMatchText(value: string | undefined, query: SearchInput): boolean {
  if (!value) return false;
  const text = value.toLowerCase().trim();
  const titleCandidates = expandTitle(query.title, query.flexibility.title).filter(Boolean);
  const titleMatch =
    titleCandidates.some((candidate) => text.includes(candidate.toLowerCase())) ||
    matchesTitleByFlex(text, query.flexibility.title);
  if (!titleMatch) return false;

  if (query.location?.trim()) {
    const locationText = query.location.toLowerCase();
    if (query.flexibility.location === "STRICT") {
      return text.includes(locationText);
    }
    return text.includes(locationText) || text.includes("remote");
  }
  return true;
}
