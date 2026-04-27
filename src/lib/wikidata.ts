export interface Representative {
  type: string;
  name: string;
  party?: string;
  photo?: string | null;
  wikidataUrl?: string | null;
  constituency?: string;
  state?: string;
  note?: string;
}

export async function fetchRepresentatives(
  constituency: string,
  state: string
): Promise<Representative[]> {
  try {
    const params = new URLSearchParams({ constituency, state });
    const res = await fetch(`/api/representatives?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.representatives ?? [];
  } catch {
    return [];
  }
}
