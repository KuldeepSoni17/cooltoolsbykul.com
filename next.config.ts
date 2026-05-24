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
      // Storage War — storage auction game in public/StorageWar
      {
        source: "/StorageWar",
        destination: "/StorageWar/index.html",
      },
      // Echo Garden — Phaser game in public/echo-garden
      {
        source: "/echo-garden",
        destination: "/echo-garden/index.html",
      },
      // Harry Potter platformer in public/harrypotter
      {
        source: "/harrypotter",
        destination: "/harrypotter/index.html",
      },
      // Timeline Racer landing in public/timeline
      {
        source: "/timeline",
        destination: "/timeline/index.html",
      },
      // LegoDigital — iso brick builder in public/LegoDigital
      {
        source: "/LegoDigital",
        destination: "/LegoDigital/index.html",
      },
      // Divergence — scenario analytics (separate Vercel project)
      {
        source: "/divergence",
        destination: "https://divergence-navy.vercel.app/divergence",
      },
      {
        source: "/divergence/:path*",
        destination: "https://divergence-navy.vercel.app/divergence/:path*",
      },
      // Bhakti — spiritual companion (separate Vercel project, basePath /bhakti)
      {
        source: "/bhakti",
        destination: "https://bhakti-app.vercel.app/bhakti",
      },
      {
        source: "/bhakti/:path*",
        destination: "https://bhakti-app.vercel.app/bhakti/:path*",
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
