import { NextResponse } from "next/server";
import { generateDivergenceScenario } from "@/features/divergence/generate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      mode,
      region,
      divergenceDate,
      description,
      changeDetails,
      variablesToTrack,
    } = body as Record<string, unknown>;

    if (mode === "foresight") {
      return NextResponse.json(
        {
          error:
            "Foresight mode is coming in Phase 2. Try hindsight or open a curated example.",
        },
        { status: 400 }
      );
    }

    if (
      typeof region !== "string" ||
      typeof divergenceDate !== "string" ||
      typeof description !== "string" ||
      typeof changeDetails !== "string" ||
      description.length < 10 ||
      changeDetails.length < 10
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const scenario = await generateDivergenceScenario({
      mode: "hindsight",
      region,
      divergenceDate,
      description,
      changeDetails,
      variablesToTrack: Array.isArray(variablesToTrack)
        ? (variablesToTrack as string[])
        : undefined,
    });

    return NextResponse.json(scenario);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Scenario generation failed";
    const status = message.includes("ANTHROPIC_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
