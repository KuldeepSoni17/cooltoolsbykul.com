import { NextResponse } from "next/server";
import { resetCompanyCircuitBreaker } from "@/lib/vacancybible/engine";

function isAuthorized(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) return true;
  const incoming = req.headers.get("x-admin-secret");
  return incoming === secret;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await context.params;
  const reset = resetCompanyCircuitBreaker(slug);
  return NextResponse.json({ ok: true, slug, reset });
}
