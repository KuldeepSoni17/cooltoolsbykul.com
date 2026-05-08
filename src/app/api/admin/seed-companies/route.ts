import { NextRequest, NextResponse } from "next/server";
import { seedCompanies } from "@/lib/seed-companies";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await seedCompanies();
    return NextResponse.json({
      success: true,
      ...result,
      message: `Seeded ${result.total} new companies from jobExtractors CSVs`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to seed companies";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
