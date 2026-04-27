import { NextRequest, NextResponse } from "next/server";
import { DEPARTMENTS } from "@/data/departments";
import { fetchLiveOfficersForDepartment } from "@/lib/live-officers";

export async function GET(req: NextRequest) {
  const departmentIds = req.nextUrl.searchParams.getAll("departmentId");
  if (departmentIds.length === 0) {
    return NextResponse.json(
      { error: "At least one departmentId is required." },
      { status: 400 }
    );
  }

  const uniqueIds = Array.from(new Set(departmentIds)).filter(
    (id) => !!DEPARTMENTS[id]
  );

  const data = await Promise.all(
    uniqueIds.map(async (departmentId) => {
      const { officers, sourceUrl } =
        await fetchLiveOfficersForDepartment(departmentId);
      return {
        departmentId,
        officers,
        sourceUrl,
        fetchedAt: new Date().toISOString(),
      };
    })
  );

  return NextResponse.json({ data });
}
