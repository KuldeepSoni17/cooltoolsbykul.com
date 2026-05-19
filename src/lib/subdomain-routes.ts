/** Subdomain → path on cooltoolsbykul.com (leading slash, no trailing slash). */
export const SUBDOMAIN_ROUTES: Record<string, string> = {
  storagewar: "/StorageWar",
  harrypotter: "/harrypotter",
  wordfall: "/WordFall",
  tshirt: "/thetshirtproject",
  thetshirtproject: "/thetshirtproject",
  "echo-garden": "/echo-garden",
  echogarden: "/echo-garden",
  timeline: "/timeline",
  tag: "/tag-app",
  tagrush: "/tag-app",
  unlock: "/unlock",
  vacancy: "/vacancybible",
  vacancybible: "/vacancybible",
  mysteries: "/mysteries",
  graph: "/graph-isomorphism",
  onestopai: "/onestopai",
  songwriter: "/songwriter",
  "italian-coach": "/italian-coach",
  italian: "/italian-coach",
  "worth-it": "/worth-it",
  worthit: "/worth-it",
  "norm-tionary": "/norm-tionary",
  "whos-responsible": "/whos-responsible",
  "before-you-decide": "/before-you-decide",
  "questions-before-conceiving": "/questions-before-conceiving",
  "questions-before-adopting-pet": "/questions-before-adopting-pet",
  telepath: "/games/telepath",
  "attack-defense": "/games/attack-defense",
  poems: "/poems",
  summary: "/summary",
  watchlist: "/watchlist",
  echo: "/echo",
  divergence: "/divergence",
};

/** Static SPA folders under public/ that need index.html fallback. */
export const SPA_PATH_PREFIXES = [
  "/StorageWar",
  "/WordFall",
  "/thetshirtproject",
  "/echo-garden",
  "/harrypotter",
  "/timeline",
  "/tag-app-play",
];

export function getSubdomain(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();
  if (
    hostname === "cooltoolsbykul.com" ||
    hostname === "localhost" ||
    hostname.endsWith(".vercel.app")
  ) {
    return null;
  }
  if (hostname.endsWith(".cooltoolsbykul.com")) {
    const sub = hostname.replace(/\.cooltoolsbykul\.com$/, "");
    return sub === "www" ? null : sub;
  }
  return null;
}
