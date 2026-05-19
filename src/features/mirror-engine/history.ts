import type { AssessmentResults } from "./types";

const suffix = "-history";

export function saveResultHistory(storageKey: string, results: AssessmentResults): void {
  if (typeof window === "undefined") return;
  const key = `${storageKey}${suffix}`;
  const existing = loadResultHistory(storageKey);
  const next = [
    { savedAt: new Date().toISOString(), results },
    ...existing.filter((e) => e.results.completedAt !== results.completedAt),
  ].slice(0, 5);
  localStorage.setItem(key, JSON.stringify(next));
}

export function loadResultHistory(storageKey: string): { savedAt: string; results: AssessmentResults }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${storageKey}${suffix}`);
    if (!raw) return [];
    return JSON.parse(raw) as { savedAt: string; results: AssessmentResults }[];
  } catch {
    return [];
  }
}
