import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
    ],
  },
  async rewrites() {
    return [
      // Tag App static web (Expo export in public/tag-app-play)
      {
        source: "/tag-app-play",
        destination: "/tag-app-play/index.html",
      },
      // Wordfall — static word game in public/WordFall
      {
        source: "/WordFall",
        destination: "/WordFall/index.html",
      },
      // Bare /echo with no trailing slash
      {
        source: "/echo",
        destination: "https://client-omega-six-31.vercel.app/echo",
      },
      // Everything under /echo/ — assets, SPA routes, PWA files
      {
        source: "/echo/:path*",
        destination: "https://client-omega-six-31.vercel.app/echo/:path*",
      },
    ];
  },
};

export default nextConfig;
