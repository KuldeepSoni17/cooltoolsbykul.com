import { Officer } from "@/data/departments";

type LiveOfficerResponse = {
  data: Array<{
    departmentId: string;
    officers: Officer[];
    sourceUrl?: string;
    fetchedAt: string;
  }>;
};

export async function fetchLiveOfficers(
  departmentIds: string[]
): Promise<Record<string, Officer[]>> {
  if (departmentIds.length === 0) return {};

  try {
    const params = new URLSearchParams();
    for (const id of departmentIds) params.append("departmentId", id);
    const res = await fetch(`/api/officers?${params.toString()}`);
    if (!res.ok) return {};
    const payload = (await res.json()) as LiveOfficerResponse;

    return payload.data.reduce<Record<string, Officer[]>>((acc, row) => {
      acc[row.departmentId] = row.officers;
      return acc;
    }, {});
  } catch {
    return {};
  }
}
