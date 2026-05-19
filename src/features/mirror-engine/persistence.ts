import type { AnswerValue, AssessmentResults } from "./types";

export type ProgressState = {
  stepIndex: number;
  answers: Record<string, AnswerValue>;
  updatedAt: string;
};

export function loadProgress(key: string): ProgressState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as ProgressState;
  } catch {
    return null;
  }
}

export function saveProgress(key: string, state: ProgressState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(state));
}

export function clearProgress(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function loadResults(key: string): AssessmentResults | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as AssessmentResults;
  } catch {
    return null;
  }
}

export function saveResults(key: string, results: AssessmentResults): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(results));
}

export function clearResults(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function savePartnerResults(
  storageKey: string,
  results: AssessmentResults,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${storageKey}-partner-results`, JSON.stringify(results));
}

export function loadPartnerResults(storageKey: string): AssessmentResults | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${storageKey}-partner-results`);
    if (!raw) return null;
    return JSON.parse(raw) as AssessmentResults;
  } catch {
    return null;
  }
}
