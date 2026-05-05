import type { EnrichedJob, SearchProgressEvent, SearchSession } from "./types";

const jobsBySession = new Map<string, EnrichedJob[]>();
const sessions = new Map<string, SearchSession>();
const progressBySession = new Map<string, SearchProgressEvent[]>();
const diagnosticsBySession = new Map<
  string,
  {
    startedAt: string;
    companyCountAtStart: number;
    sourceCounts: Record<string, number>;
    rawJobsBeforeEnrichment: number;
    enrichedJobs: number;
    notes: string[];
  }
>();

export function saveSession(session: SearchSession): void {
  sessions.set(session.id, session);
}

export function updateSession(
  sessionId: string,
  update: Partial<SearchSession>,
): SearchSession | null {
  const current = sessions.get(sessionId);
  if (!current) return null;
  const next = { ...current, ...update };
  sessions.set(sessionId, next);
  return next;
}

export function getSession(sessionId: string): SearchSession | null {
  return sessions.get(sessionId) ?? null;
}

export function saveJobs(sessionId: string, jobs: EnrichedJob[]): void {
  jobsBySession.set(sessionId, jobs);
}

export function getJobs(sessionId: string): EnrichedJob[] {
  return jobsBySession.get(sessionId) ?? [];
}

export function listSessions(limit = 25): SearchSession[] {
  return [...sessions.values()]
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
    .slice(0, limit);
}

export function pushProgress(event: SearchProgressEvent): void {
  const current = progressBySession.get(event.sessionId) ?? [];
  current.push(event);
  progressBySession.set(event.sessionId, current);
}

export function getProgress(sessionId: string): SearchProgressEvent[] {
  return progressBySession.get(sessionId) ?? [];
}

export function saveDiagnostics(
  sessionId: string,
  diagnostics: {
    startedAt: string;
    companyCountAtStart: number;
    sourceCounts: Record<string, number>;
    rawJobsBeforeEnrichment: number;
    enrichedJobs: number;
    notes: string[];
  },
): void {
  diagnosticsBySession.set(sessionId, diagnostics);
}

export function getDiagnostics(sessionId: string) {
  return diagnosticsBySession.get(sessionId) ?? null;
}
