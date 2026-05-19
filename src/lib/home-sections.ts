export type HomeTool = {
  id: string;
  title: string;
  tagline: string;
  href?: string;
  featured?: boolean;
  emoji: string;
};

export type HomeCategory = {
  id: string;
  label: string;
  description: string;
  accent: string;
  tools: HomeTool[];
};

export const HOME_CATEGORIES: HomeCategory[] = [
  {
    id: "games",
    label: "Games",
    description: "Playable worlds — arcade, strategy, and chaos.",
    accent: "from-lime-400/20 to-emerald-600/5",
    tools: [
      {
        id: "tagrush",
        title: "TagRush",
        tagline: "Daily tag-chain battles with neon arcade energy.",
        href: "/tag-app",
        featured: true,
        emoji: "⚡",
      },
      {
        id: "telepath",
        title: "Telepath",
        tagline: "3-player mind game — secret transfers & powers.",
        href: "/games/telepath",
        featured: true,
        emoji: "🧠",
      },
      {
        id: "attack-defense",
        title: "Attack-Defense",
        tagline: "Real-time 3-player strategy arena.",
        href: "/games/attack-defense",
        emoji: "🛡️",
      },
      {
        id: "wordfall",
        title: "WordFall",
        tagline: "Chain-merge words, chase high scores.",
        href: "/WordFall",
        emoji: "📝",
      },
      {
        id: "storage-war",
        title: "Storage War",
        tagline: "Bid, extract treasures, complete collections.",
        href: "/StorageWar",
        emoji: "📦",
      },
      {
        id: "echo-garden",
        title: "Echo Garden",
        tagline: "Grow and explore a living Phaser garden.",
        href: "/echo-garden",
        emoji: "🌱",
      },
      {
        id: "wandwork",
        title: "Wandwork",
        tagline: "Wizarding platformer — spells & bosses.",
        href: "/harrypotter",
        emoji: "🪄",
      },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    description: "Utilities that save time and sharpen decisions.",
    accent: "from-cyan-400/20 to-blue-600/5",
    tools: [
      {
        id: "unlock",
        title: "Unlock",
        tagline: "Surface perks and features you already pay for.",
        href: "/unlock",
        featured: true,
        emoji: "🔓",
      },
      {
        id: "vacancybible",
        title: "VacancyBible",
        tagline: "PM jobs scraped live from company career pages.",
        href: "/vacancybible",
        featured: true,
        emoji: "💼",
      },
      {
        id: "worth-it",
        title: "WorthIt?",
        tagline: "Does this worry deserve your mental energy?",
        href: "/worth-it",
        emoji: "🌿",
      },
      {
        id: "whos-responsible",
        title: "Who's Responsible",
        tagline: "Find the right department for civic issues.",
        href: "/whos-responsible",
        emoji: "🏛️",
      },
      {
        id: "graph-iso",
        title: "Graph Isomorphism",
        tagline: "470k+ benchmark runs & small-graph checker.",
        href: "/graph-isomorphism",
        emoji: "◇",
      },
      {
        id: "italian-coach",
        title: "Italian Coach",
        tagline: "Grammar-first Italian with mastery tracking.",
        href: "/italian-coach",
        emoji: "🇮🇹",
      },
      {
        id: "summary",
        title: "Summary Engine",
        tagline: "One evidence-weighted truth from many sources.",
        href: "/summary",
        emoji: "📡",
      },
      {
        id: "onestopai",
        title: "OneStopAI",
        tagline: "Multi-provider AI chat — spec & blueprint.",
        href: "/onestopai",
        emoji: "🤖",
      },
    ],
  },
  {
    id: "mirrors",
    label: "Life mirrors",
    description: "Honest readiness checks before big decisions.",
    accent: "from-amber-400/20 to-orange-600/5",
    tools: [
      {
        id: "before-you-decide",
        title: "Before You Decide",
        tagline: "Hub for marriage, home, job & life mirrors.",
        href: "/before-you-decide",
        featured: true,
        emoji: "🪞",
      },
      {
        id: "conceiving",
        title: "Before Conceiving",
        tagline: "Deep readiness mirror for parenthood.",
        href: "/questions-before-conceiving",
        emoji: "🌅",
      },
      {
        id: "pet",
        title: "Before Adopting a Pet",
        tagline: "Readiness + rescue-first breed matcher.",
        href: "/questions-before-adopting-pet",
        emoji: "🐾",
      },
      {
        id: "norm-tionary",
        title: "Norm-tionary",
        tagline: "Dysfunctions we normalized — swipeable truths.",
        href: "/norm-tionary",
        emoji: "📖",
      },
    ],
  },
  {
    id: "creative",
    label: "Creative",
    description: "Stories, sound, merch, and rabbit holes.",
    accent: "from-fuchsia-400/20 to-purple-600/5",
    tools: [
      {
        id: "songwriter",
        title: "AI Songwriting Studio",
        tagline: "Lyrics & humming → chords & production packs.",
        href: "/songwriter",
        emoji: "🎵",
      },
      {
        id: "poems",
        title: "Poems & Stories",
        tagline: "Raw words, rhythm, and imagination.",
        href: "/poems",
        emoji: "✒️",
      },
      {
        id: "timeline",
        title: "Timeline Racer",
        tagline: "CSV timelines → cinematic video.",
        href: "/timeline",
        emoji: "🎬",
      },
      {
        id: "tshirt",
        title: "The T-Shirt Project",
        tagline: "Indie apparel collections & cart.",
        href: "/thetshirtproject",
        emoji: "👕",
      },
      {
        id: "mysteries",
        title: "Mysteries",
        tagline: "Cold cases, serial files & rabbit holes.",
        href: "/mysteries",
        emoji: "🔍",
      },
      {
        id: "divergence",
        title: "Divergence",
        tagline: "What-if scenario exploration.",
        href: "/divergence",
        emoji: "⑂",
      },
    ],
  },
  {
    id: "lab",
    label: "The lab",
    description: "Experiments not ready for prime time.",
    accent: "from-zinc-400/10 to-zinc-600/5",
    tools: [
      {
        id: "radical",
        title: "Radical Ideas",
        tagline: "Spicy product bets & thought experiments.",
        emoji: "💡",
      },
      {
        id: "nonsense",
        title: "Non-Sense Stuffs",
        tagline: "Weird builds that shouldn't work — sometimes do.",
        emoji: "🎪",
      },
      {
        id: "area51",
        title: "Area 51",
        tagline: "Classified prototypes & moonshots.",
        emoji: "👽",
      },
    ],
  },
];

export const ALL_TOOLS = HOME_CATEGORIES.flatMap((c) =>
  c.tools.map((t) => ({ ...t, category: c.label, categoryId: c.id }))
);

export const FEATURED_TOOLS = ALL_TOOLS.filter((t) => t.featured && t.href);
