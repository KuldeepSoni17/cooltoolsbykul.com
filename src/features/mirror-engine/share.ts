import type { AssessmentResults } from "./types";

export type SharePayload = {
  id: string;
  profileId: string;
  profileName: string;
  domains: { domainId: string; domainName: string; percent: number; label: string }[];
  completedAt: string;
};

export function encodeShareResults(results: AssessmentResults, assessmentId: string): string {
  const payload: SharePayload = {
    id: assessmentId,
    profileId: results.profile.id ?? results.profile.name,
    profileName: results.profile.name,
    domains: results.domains.map((d) => ({
      domainId: d.domainId,
      domainName: d.domainName,
      percent: d.percent,
      label: d.label,
    })),
    completedAt: results.completedAt,
  };
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeShareResults(token: string): SharePayload | null {
  try {
    const json = decodeURIComponent(escape(atob(token)));
    return JSON.parse(json) as SharePayload;
  } catch {
    return null;
  }
}

export function buildShareUrl(basePath: string, token: string): string {
  if (typeof window === "undefined") return `${basePath}?share=${token}`;
  return `${window.location.origin}${basePath}?share=${encodeURIComponent(token)}`;
}
