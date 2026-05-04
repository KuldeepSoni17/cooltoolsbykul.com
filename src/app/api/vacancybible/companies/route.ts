import { NextResponse } from "next/server";
import { getCompanyRegistry } from "@/lib/vacancybible/companyRegistry";

export async function GET() {
  return NextResponse.json({
    ok: true,
    companies: getCompanyRegistry(false),
  });
}
