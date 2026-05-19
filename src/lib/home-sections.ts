/** Bright palette — one accent per category, reused everywhere in that block. */
export const CATEGORY_THEME = {
  games: {
    label: "Games",
    description: "Playable worlds — arcade, strategy, and chaos.",
    color: "#FF5722",
    bg: "#FFF3EE",
  },
  tools: {
    label: "Tools",
    description: "Utilities that save time and sharpen decisions.",
    color: "#0066FF",
    bg: "#EEF4FF",
  },
  mirrors: {
    label: "Life mirrors",
    description: "Honest readiness checks before big decisions.",
    color: "#FF9800",
    bg: "#FFF8EE",
  },
  creative: {
    label: "Creative",
    description: "Stories, sound, merch, and rabbit holes.",
    color: "#E91E63",
    bg: "#FFF0F5",
  },
  lab: {
    label: "The lab",
    description: "Experiments not ready for prime time.",
    color: "#607D8B",
    bg: "#ECEFF1",
  },
} as const;

export type CategoryId = keyof typeof CATEGORY_THEME;

export type HomeTool = {
  id: string;
  title: string;
  tagline: string;
  href?: string;
  featured?: boolean;
};

export type HomeCategory = {
  id: CategoryId;
  tools: HomeTool[];
};

export const HOME_CATEGORIES: HomeCategory[] = [
  {
    id: "games",
    tools: [
      { id: "tagrush", title: "TagRush", tagline: "Daily tag-chain battles.", href: "/tag-app", featured: true },
      { id: "telepath", title: "Telepath", tagline: "3-player mind game.", href: "/games/telepath", featured: true },
      { id: "attack-defense", title: "Attack-Defense", tagline: "Real-time 3-player strategy.", href: "/games/attack-defense" },
      { id: "wordfall", title: "WordFall", tagline: "Chain-merge words.", href: "/WordFall" },
      { id: "storage-war", title: "Storage War", tagline: "Bid and collect treasures.", href: "/StorageWar" },
      { id: "echo-garden", title: "Echo Garden", tagline: "Grow a living Phaser garden.", href: "/echo-garden" },
      { id: "wandwork", title: "Wandwork", tagline: "Wizarding platformer.", href: "/harrypotter" },
    ],
  },
  {
    id: "tools",
    tools: [
      { id: "unlock", title: "Unlock", tagline: "Perks you already have.", href: "/unlock", featured: true },
      { id: "vacancybible", title: "VacancyBible", tagline: "Live PM job search.", href: "/vacancybible", featured: true },
      { id: "worth-it", title: "WorthIt?", tagline: "Worry less, reflect more.", href: "/worth-it" },
      { id: "whos-responsible", title: "Who's Responsible", tagline: "Civic accountability lookup.", href: "/whos-responsible" },
      { id: "graph-iso", title: "Graph Isomorphism", tagline: "470k+ benchmark explorer.", href: "/graph-isomorphism" },
      { id: "italian-coach", title: "Italian Coach", tagline: "Grammar-first Italian.", href: "/italian-coach" },
      { id: "summary", title: "Summary Engine", tagline: "One truth from many sources.", href: "/summary" },
      { id: "onestopai", title: "OneStopAI", tagline: "Multi-provider AI blueprint.", href: "/onestopai" },
    ],
  },
  {
    id: "mirrors",
    tools: [
      { id: "before-you-decide", title: "Before You Decide", tagline: "Life decision mirrors.", href: "/before-you-decide", featured: true },
      { id: "conceiving", title: "Before Conceiving", tagline: "Parenthood readiness.", href: "/questions-before-conceiving" },
      { id: "pet", title: "Before Adopting a Pet", tagline: "Rescue-first matcher.", href: "/questions-before-adopting-pet" },
      { id: "norm-tionary", title: "Norm-tionary", tagline: "Normalized dysfunctions.", href: "/norm-tionary" },
    ],
  },
  {
    id: "creative",
    tools: [
      { id: "songwriter", title: "AI Songwriting Studio", tagline: "Lyrics to production packs.", href: "/songwriter" },
      { id: "poems", title: "Poems & Stories", tagline: "Words and imagination.", href: "/poems" },
      { id: "timeline", title: "Timeline Racer", tagline: "CSV to cinematic video.", href: "/timeline" },
      { id: "tshirt", title: "The T-Shirt Project", tagline: "Indie apparel shop.", href: "/thetshirtproject" },
      { id: "mysteries", title: "Mysteries", tagline: "Cold cases and rabbit holes.", href: "/mysteries" },
      { id: "divergence", title: "Divergence", tagline: "What-if scenarios.", href: "/divergence" },
    ],
  },
  {
    id: "lab",
    tools: [
      { id: "radical", title: "Radical Ideas", tagline: "Spicy product bets." },
      { id: "nonsense", title: "Non-Sense Stuffs", tagline: "Weird experiments." },
      { id: "area51", title: "Area 51", tagline: "Classified prototypes." },
    ],
  },
];

export const BRAND = {
  primary: "#0066FF",
  primaryHover: "#0052CC",
  pageBg: "#F0F4FF",
  text: "#0F172A",
  textMuted: "#475569",
} as const;

export const ALL_TOOLS = HOME_CATEGORIES.flatMap((c) =>
  c.tools.map((t) => ({ ...t, categoryId: c.id }))
);

export const FEATURED_TOOLS = ALL_TOOLS.filter((t) => t.featured && t.href);
