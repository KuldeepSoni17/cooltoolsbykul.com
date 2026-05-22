import { NextRequest, NextResponse } from "next/server";
import { SPA_PATH_PREFIXES } from "@/lib/spa-routes";

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
  const spaIndex = spaFallback(pathname);
  if (!spaIndex) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = spaIndex;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
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
    "/LegoDigital",
    "/LegoDigital/:path*",
  ],
};
