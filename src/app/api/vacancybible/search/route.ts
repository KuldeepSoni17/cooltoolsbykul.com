import { NextResponse } from "next/server";
import { createSession, runSearch } from "@/lib/vacancybible/engine";
import type { SearchInput } from "@/lib/vacancybible/types";

function normalizeSearchInput(payload: Partial<SearchInput>): SearchInput {
  return {
    title: payload.title?.trim() || "Product Manager",
    location: payload.location?.trim() || "India",
    experienceMin: payload.experienceMin ?? 0,
    experienceMax: payload.experienceMax ?? 30,
    packageLpaMin: payload.packageLpaMin ?? 0,
    domain: payload.domain?.trim(),
    flexibility: {
      title: payload.flexibility?.title ?? "FLEXIBLE",
      location: payload.flexibility?.location ?? "FLEXIBLE",
      experience: payload.flexibility?.experience ?? "FLEXIBLE",
      package: payload.flexibility?.package ?? "FLEXIBLE",
      domain: payload.flexibility?.domain ?? "FLEXIBLE",
    },
  };
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<SearchInput>;
  const input = normalizeSearchInput(body);
  const session = createSession(input);
  void runSearch(session.id);

  return NextResponse.json({
    ok: true,
    sessionId: session.id,
    status: session.status,
    startedAt: session.startedAt,
  });
}
