import type { EnrichedJob, SearchInput, SearchProgressEvent, SearchSession } from "./types";

export async function startSearch(
  input: SearchInput,
  forceRefresh = false,
): Promise<{
  sessionId: string;
  from_cache?: boolean;
  cached_at?: string;
  expires_at?: string;
}> {
  const res = await fetch("/api/vacancybible/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, force_refresh: forceRefresh }),
  });
  if (!res.ok) throw new Error("Failed to start search");
  const payload = (await res.json()) as {
    sessionId: string;
    from_cache?: boolean;
    cached_at?: string;
    expires_at?: string;
  };
  return payload;
}

export async function fetchJobs(
  sessionId: string,
): Promise<{ session: SearchSession | null; jobs: EnrichedJob[] }> {
  const res = await fetch(`/api/vacancybible/jobs?sessionId=${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return (await res.json()) as { session: SearchSession | null; jobs: EnrichedJob[] };
}

export function subscribeProgress(
  sessionId: string,
  onEvent: (event: SearchProgressEvent | { done: true; status: string }) => void,
): () => void {
  const source = new EventSource(
    `/api/vacancybible/search/stream?sessionId=${encodeURIComponent(sessionId)}`,
  );
  source.onmessage = (event) => {
    const parsed = JSON.parse(event.data) as SearchProgressEvent | { done: true; status: string };
    onEvent(parsed);
  };
  source.onerror = () => source.close();
  return () => source.close();
}
