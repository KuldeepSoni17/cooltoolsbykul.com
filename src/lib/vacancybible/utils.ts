import { createHash, randomUUID } from "crypto";
import type { FlexMode, SearchInput } from "./types";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function makeId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

const TITLE_EXPANSIONS: Record<string, string[]> = {
  "product manager": [
    "product manager",
    "senior product manager",
    "lead product manager",
    "principal product manager",
    "group product manager",
  ],
};

export function expandTitle(title: string, mode: FlexMode): string[] {
  const normalized = title.trim().toLowerCase();
  if (mode === "STRICT") return [normalized];
  const candidates = TITLE_EXPANSIONS[normalized] ?? [normalized];
  if (mode === "FLEXIBLE") return candidates.slice(0, Math.min(3, candidates.length));
  return [...new Set([...candidates, normalized.replace("manager", "lead")])];
}

export function shouldMatchText(value: string | undefined, query: SearchInput): boolean {
  if (!value) return false;
  const text = value.toLowerCase();
  const titleCandidates = expandTitle(query.title, query.flexibility.title);
  const titleMatch = titleCandidates.some((candidate) => text.includes(candidate));
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
