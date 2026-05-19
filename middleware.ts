import { NextRequest, NextResponse } from "next/server";
import {
  getSubdomain,
  SPA_PATH_PREFIXES,
  SUBDOMAIN_ROUTES,
} from "@/lib/subdomain-routes";

function spaFallback(pathname: string): string | null {
  for (const prefix of SPA_PATH_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (/\.[a-zA-Z0-9]+$/.test(pathname)) return null;
      return `${prefix}/index.html`;
    }
  }
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? "";

  const spaIndex = spaFallback(pathname);
  if (spaIndex) {
    const url = req.nextUrl.clone();
    url.pathname = spaIndex;
    return NextResponse.rewrite(url);
  }

  const subdomain = getSubdomain(host);
  if (!subdomain) return NextResponse.next();

  const basePath = SUBDOMAIN_ROUTES[subdomain];
  if (!basePath) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? basePath : `${basePath}${pathname}`;

  const rewrittenSpa = spaFallback(url.pathname);
  if (rewrittenSpa) url.pathname = rewrittenSpa;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/StorageWar",
    "/StorageWar/:path*",
    "/WordFall",
    "/WordFall/:path*",
    "/thetshirtproject",
    "/thetshirtproject/:path*",
    "/echo-garden",
    "/echo-garden/:path*",
    "/harrypotter",
    "/harrypotter/:path*",
    "/timeline",
    "/timeline/:path*",
    "/tag-app-play",
    "/tag-app-play/:path*",
  ],
};
