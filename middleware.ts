import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only handle /thetshirtproject routes
  if (!pathname.startsWith("/thetshirtproject")) return NextResponse.next();

  // Let static assets through (they're served from public/)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return NextResponse.next();

  // SPA fallback — serve the Vite app's index.html for all non-asset routes
  const url = req.nextUrl.clone();
  url.pathname = "/thetshirtproject/index.html";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/thetshirtproject", "/thetshirtproject/:path*"],
};
