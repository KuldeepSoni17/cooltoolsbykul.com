export type PricePoint = {
  label: string;
  amount: number;
  unit?: string;
  note?: string;
};

export type BrandSwap = {
  id: string;
  category: string;
  globalBrand: string;
  indianBrand: string;
  whyComparable: string;
  globalPrice: PricePoint;
  indianPrice: PricePoint;
  tags?: string[];
};

export type FlowAwareness = {
  id: string;
  name: string;
  category: "apps" | "payments" | "streaming" | "social" | "cloud" | "devices";
  whatWeUse: string;
  whereValueFlows: string;
  indianAngle: string;
  tone: "gentle";
};

export type IndianBrandSpotlight = {
  id: string;
  name: string;
  tier: "established" | "startup";
  sector: string;
  blurb: string;
  knownFor: string;
  website?: string;
};

export const BRAND_CATEGORIES = [
  "All",
  "Oral care",
  "Skin & hair",
  "Food & snacks",
  "Beverages",
  "Home care",
  "Fashion",
  "Footwear",
  "Audio",
  "Personal devices",
  "Stationery",
  "Grooming",
] as const;

export const BRAND_SWAPS: BrandSwap[] = [
  {
    id: "colgate-perfora",
    category: "Oral care",
    globalBrand: "Colgate",
    indianBrand: "Perfora",
    whyComparable:
      "Both sell fluoride toothpastes, mouthwashes, and electric brushes aimed at everyday oral care — not luxury niche.",
    globalPrice: { label: "Colgate MaxFresh (150g)", amount: 110 },
    indianPrice: { label: "Perfora Dream White (100g)", amount: 149, note: "Often on bundle offers ~₹120" },
    tags: ["daily", "bathroom"],
  },
  {
    id: "dove-mamaearth",
    category: "Skin & hair",
    globalBrand: "Dove",
    indianBrand: "Mamaearth",
    whyComparable:
      "Moisturising body wash and sulphate-free hair care for mass urban households — similar shelf positioning.",
    globalPrice: { label: "Dove Cream Beauty Bar (125g × 3)", amount: 249 },
    indianPrice: { label: "Mamaearth Ubtan Body Wash (300ml)", amount: 349, note: "Frequent ~₹280 on sale" },
    tags: ["daily", "bathroom"],
  },
  {
    id: "headshoulders-mamaearth",
    category: "Skin & hair",
    globalBrand: "Head & Shoulders",
    indianBrand: "Mamaearth / Bare Anatomy",
    whyComparable:
      "Anti-dandruff and scalp-focused shampoos with dermatologist-style claims for regular use.",
    globalPrice: { label: "H&S Cool Menthol (340ml)", amount: 399 },
    indianPrice: { label: "Bare Anatomy Anti-Dandruff (250ml)", amount: 449, note: "Mamaearth Tea Tree ~₹349" },
  },
  {
    id: "nivea-dot-key",
    category: "Skin & hair",
    globalBrand: "Nivea",
    indianBrand: "Dot & Key",
    whyComparable:
      "Face moisturisers and sunscreens for Indian climate — comparable SPF bands and texture (gel-cream).",
    globalPrice: { label: "Nivea Soft Moisturising Cream (100ml)", amount: 299 },
    indianPrice: { label: "Dot & Key CICA Calming Gel (50ml)", amount: 395, note: "SPF variants ~₹450" },
  },
  {
    id: "lays-bikaji",
    category: "Food & snacks",
    globalBrand: "Lay's",
    indianBrand: "Bikaji / Haldiram's",
    whyComparable:
      "Thin-cut potato chips and namkeen snack packs for the same evening-tea occasion.",
    globalPrice: { label: "Lay's Classic Salted (52g)", amount: 20 },
    indianPrice: { label: "Bikaji All Time Chips (60g)", amount: 20 },
  },
  {
    id: "maggi-yippee",
    category: "Food & snacks",
    globalBrand: "Maggi",
    indianBrand: "Sunfeast Yippee",
    whyComparable:
      "Instant 2-minute noodles with masala tastemaker — same cook time and pack size norms.",
    globalPrice: { label: "Maggi Masala (70g)", amount: 14 },
    indianPrice: { label: "Yippee Mood Masala (65g)", amount: 14 },
  },
  {
    id: "kelloggs-chocos-millet",
    category: "Food & snacks",
    globalBrand: "Kellogg's Chocos",
    indianBrand: "Slurrp Farm / Soulfull",
    whyComparable:
      "Kids' breakfast cereals — chocolate balls vs millet/ragi options with similar bowl serving.",
    globalPrice: { label: "Chocos (375g)", amount: 199 },
    indianPrice: { label: "Slurrp Farm Mighty Munch (400g)", amount: 349, note: "Millet-forward; often ~₹299" },
  },
  {
    id: "coca-pepsi-bisleri-local",
    category: "Beverages",
    globalBrand: "Coca-Cola / Pepsi",
    indianBrand: "Bisleri Vedica / Paper Boat",
    whyComparable:
      "Ready-to-drink hydration and flavoured drinks — not identical cola, but same fridge impulse buy.",
    globalPrice: { label: "Coke/Pepsi PET (750ml)", amount: 40 },
    indianPrice: { label: "Paper Boat Aamras (250ml)", amount: 35, note: "Bisleri Vedica 1L ~₹60" },
  },
  {
    id: "nescafe-bru",
    category: "Beverages",
    globalBrand: "Nescafé",
    indianBrand: "BRU / Continental",
    whyComparable:
      "Instant coffee granules and chicory blends for South Indian filter-style home brewing.",
    globalPrice: { label: "Nescafé Classic (50g)", amount: 185 },
    indianPrice: { label: "BRU Instant (50g)", amount: 165 },
  },
  {
    id: "tide-ariel-ghari",
    category: "Home care",
    globalBrand: "Tide / Ariel",
    indianBrand: "Ghari / Surf Excel (India)",
    whyComparable:
      "Matic and top-load detergents formulated for Indian water hardness — same wash-load economics.",
    globalPrice: { label: "Ariel Matic Top Load (2kg)", amount: 399 },
    indianPrice: { label: "Ghari Detergent (2kg)", amount: 140, note: "Surf Excel Matic ~₹380" },
  },
  {
    id: "harpic-lizol-hindustan",
    category: "Home care",
    globalBrand: "Harpic / Lizol",
    indianBrand: "Hindustan Unilever Domex / ITC Nimyle",
    whyComparable:
      "Toilet and floor disinfectants with similar dilution ratios — household hygiene tier.",
    globalPrice: { label: "Lizol Citrus (500ml)", amount: 99 },
    indianPrice: { label: "Nimyle Herbal Floor Cleaner (1L)", amount: 175, note: "Domex ~₹90/500ml" },
  },
  {
    id: "vim-pril-indian",
    category: "Home care",
    globalBrand: "Vim / Pril",
    indianBrand: "Pril (Jyothy) / Exo",
    whyComparable:
      "Dishwash liquids and bars — grease-cutting for Indian cooking oils.",
    globalPrice: { label: "Pril Kraft (750ml)", amount: 175 },
    indianPrice: { label: "Exo Dishwash Bar (5×120g)", amount: 55, note: "Jyothy Labs owns Pril — Indian HQ" },
  },
  {
    id: "levis-denim-indian",
    category: "Fashion",
    globalBrand: "Levi's",
    indianBrand: "Mufti / Indian Terrain",
    whyComparable:
      "Mid-range denim and casual shirts for office-casual — similar fit lines and durability expectations.",
    globalPrice: { label: "Levi's 511 (entry)", amount: 2999 },
    indianPrice: { label: "Mufti slim jeans", amount: 1999, note: "Indian Terrain ~₹2.2k" },
  },
  {
    id: "zara-fabindia",
    category: "Fashion",
    globalBrand: "Zara / H&M",
    indianBrand: "Fabindia / W for Woman",
    whyComparable:
      "Seasonal fast-fashion vs Indian cotton/ethnic fusion for work and festivals — comparable price tier.",
    globalPrice: { label: "Zara cotton shirt", amount: 2990 },
    indianPrice: { label: "Fabindia kurta", amount: 2490, note: "W cotton tops ~₹1.5k" },
  },
  {
    id: "nike-campus",
    category: "Footwear",
    globalBrand: "Nike / Adidas",
    indianBrand: "Campus / Asian",
    whyComparable:
      "Everyday running and walking shoes — not pro-athlete tier, but similar EVA sole comfort segment.",
    globalPrice: { label: "Nike Revolution (entry)", amount: 3995 },
    indianPrice: { label: "Campus North Plus", amount: 1299, note: "Asian Wonder-13 ~₹999" },
  },
  {
    id: "sony-boat",
    category: "Audio",
    globalBrand: "Sony / JBL",
    indianBrand: "boAt / Noise",
    whyComparable:
      "TWS earbuds and neckbands with ANC-ish features at mass-market price — same commute use case.",
    globalPrice: { label: "Sony WF-C500", amount: 4990 },
    indianPrice: { label: "boAt Airdopes 131", amount: 999, note: "Noise Buds VS104 ~₹1.2k" },
  },
  {
    id: "samsung-oneplus",
    category: "Personal devices",
    globalBrand: "Samsung Galaxy A",
    indianBrand: "OnePlus Nord / Lava Blaze",
    whyComparable:
      "₹15k–25k smartphones with 5G and 120Hz — same buyer comparing specs sheets, not flagships.",
    globalPrice: { label: "Galaxy A15 5G", amount: 15999 },
    indianPrice: { label: "Lava Blaze 2 5G", amount: 9999, note: "Nord CE ~₹14k" },
  },
  {
    id: "parker-reynolds",
    category: "Stationery",
    globalBrand: "Parker",
    indianBrand: "Reynolds / Cello",
    whyComparable:
      "Daily writing — gel pens and ballpoints for students and offices, not luxury fountain pens.",
    globalPrice: { label: "Parker Vector (roller)", amount: 350 },
    indianPrice: { label: "Reynolds Trimax (pack of 5)", amount: 100 },
  },
  {
    id: "gillette-bombay",
    category: "Grooming",
    globalBrand: "Gillette",
    indianBrand: "Bombay Shaving Company",
    whyComparable:
      "Cartridge razors and grooming kits for men — subscription-style refills in same aisle.",
    globalPrice: { label: "Gillette Fusion (2 cartridges)", amount: 450 },
    indianPrice: { label: "Bombay Shaving Co. cartridges (2)", amount: 299 },
    tags: ["grooming"],
  },
  {
    id: "pampers-supriya",
    category: "Home care",
    globalBrand: "Pampers",
    indianBrand: "Supples / Teddy Baby (Indian mfg)",
    whyComparable:
      "Tape-style newborn diapers — absorbency and size bands matched for Indian baby weights.",
    globalPrice: { label: "Pampers Active Baby (44 pcs, M)", amount: 899 },
    indianPrice: { label: "Supples Premium (44 pcs, M)", amount: 649 },
  },
];

export const FLOW_AWARENESS: FlowAwareness[] = [
  {
    id: "youtube",
    name: "YouTube",
    category: "streaming",
    whatWeUse: "Free videos, creators, learning, and background music.",
    whereValueFlows:
      "Ad revenue and Premium subscriptions largely accrue to Alphabet (US). Creator payouts are a slice; platform economics sit abroad.",
    indianAngle:
      "Indian creators still earn here — and alternatives like Josh, Roposo, or ShareChat exist for short-form. Many educators also host on Kuku FM or own websites.",
    tone: "gentle",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    category: "social",
    whatWeUse: "Family groups, business updates, and everyday coordination.",
    whereValueFlows:
      "Meta (US) monetises through Business API and future ads; your attention is the product even when the app is free.",
    indianAngle:
      "For communities that want Indian infra: Sandes (gov), or sector apps like Telegram with Indian businesses on UPI. No need to leave overnight — just knowing helps.",
    tone: "gentle",
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "social",
    whatWeUse: "Reels, brands, and personal expression.",
    whereValueFlows: "Ad spend from Indian brands often flows to Meta's global ad stack.",
    indianAngle:
      "Many Indian D2C brands also sell direct via their own sites + UPI — following them off-platform keeps more margin in India.",
    tone: "gentle",
  },
  {
    id: "google-search",
    name: "Google Search & Maps",
    category: "apps",
    whatWeUse: "Directions, reviews, and the default answer machine.",
    whereValueFlows: "Search ads and Play billing feed Google's global revenue.",
    indianAngle:
      "MapmyIndia (Mappls), DuckDuckGo, and Koo for search/news are Indian or privacy-first options for specific needs.",
    tone: "gentle",
  },
  {
    id: "netflix-prime",
    name: "Netflix / Prime Video",
    category: "streaming",
    whatWeUse: "Weekend series and films.",
    whereValueFlows: "Subscription rupees support global content libraries; royalty outflows on foreign productions.",
    indianAngle:
      "SonyLIV, Zee5, Hoichoi, and regional OTTs invest heavily in Indian writers and crews — worth a rotate when mood matches.",
    tone: "gentle",
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "streaming",
    whatWeUse: "Playlists on commutes and workouts.",
    whereValueFlows: "Licensing fees often leave India for rights holders abroad; per-stream payouts are tiny for most artists.",
    indianAngle:
      "JioSaavn, Gaana, and Hungama license and promote a lot of Indian indie music — same phone, different app icon.",
    tone: "gentle",
  },
  {
    id: "visa-mastercard",
    name: "Visa / Mastercard",
    category: "payments",
    whatWeUse: "Cards for travel and online checkout.",
    whereValueFlows: "Network fees and FX margins flow to global card networks.",
    indianAngle:
      "UPI (NPCI), RuPay, and BHIM keep retail payment rails on Indian infrastructure — already how most of us pay locally.",
    tone: "gentle",
  },
  {
    id: "aws-azure",
    name: "AWS / Azure / GCP",
    category: "cloud",
    whatWeUse: "Every app and startup runs on someone else's servers.",
    whereValueFlows: "Cloud bills are a major invisible import for Indian tech companies.",
    indianAngle:
      "Yotta, E2E Networks, and government MeghRaj push local data centres — awareness matters for founders more than consumers.",
    tone: "gentle",
  },
  {
    id: "iphone-samsung",
    name: "Premium phones (import-heavy)",
    category: "devices",
    whatWeUse: "Status, camera, and longevity.",
    whereValueFlows: "High import content on components; profit pools often offshore.",
    indianAngle:
      "Made-in-India assembly has grown (Apple, Samsung). Mid-range Indian-designed brands compete on service networks.",
    tone: "gentle",
  },
];

export const INDIAN_SPOTLIGHT: IndianBrandSpotlight[] = [
  {
    id: "tata",
    name: "Tata Group",
    tier: "established",
    sector: "Conglomerate",
    blurb: "Salt to steel to software — one of India's most trusted umbrellas.",
    knownFor: "Tata Salt, Tanishq, TCS, Taj Hotels",
    website: "https://www.tata.com",
  },
  {
    id: "amul",
    name: "Amul",
    tier: "established",
    sector: "Dairy",
    blurb: "Cooperative model that returns value to Gujarat's milk producers.",
    knownFor: "Butter, cheese, ice cream",
    website: "https://amul.com",
  },
  {
    id: "haldiram",
    name: "Haldiram's",
    tier: "established",
    sector: "Food",
    blurb: "Nagpur-born snacks now synonymous with festivals and travel.",
    knownFor: "Bhujia, sweets, ready meals",
  },
  {
    id: "bajaj",
    name: "Bajaj Auto",
    tier: "established",
    sector: "Mobility",
    blurb: "Two-wheelers engineered for Indian roads and fuel economics.",
    knownFor: "Pulsar, Chetak EV",
    website: "https://www.bajajauto.com",
  },
  {
    id: "perfora",
    name: "Perfora",
    tier: "startup",
    sector: "Oral care",
    blurb: "D2C oral care built for Indian tastes — direct answer to global toothpaste giants.",
    knownFor: "Toothpaste, mouthwash, electric brushes",
    website: "https://www.perforacare.com",
  },
  {
    id: "slurrp-farm",
    name: "Slurrp Farm",
    tier: "startup",
    sector: "Kids food",
    blurb: "Millet-first snacks without the guilt trip — honest ingredients list.",
    knownFor: "Cereals, dosa mixes, cookies",
    website: "https://slurrpfarm.com",
  },
  {
    id: "bombay-shaving",
    name: "Bombay Shaving Company",
    tier: "startup",
    sector: "Grooming",
    blurb: "Subscription razors and skincare that undercut imported cartridge pricing.",
    knownFor: "Razors, trimmers, perfumes",
  },
  {
    id: "boat",
    name: "boAt",
    tier: "established",
    sector: "Audio",
    blurb: "Made India listen louder — mass TWS before global brands lowered prices.",
    knownFor: "Earbuds, speakers, wearables",
    website: "https://www.boat-lifestyle.com",
  },
  {
    id: "lenskart",
    name: "Lenskart",
    tier: "established",
    sector: "Eyewear",
    blurb: "Vertical eyewear with home try-on — disrupted spec retail in tier-2 cities.",
    knownFor: "Glasses, contacts, stores",
    website: "https://www.lenskart.com",
  },
  {
    id: "zerodha",
    name: "Zerodha",
    tier: "established",
    sector: "Fintech",
    blurb: "Bootstrap broker that proved Indian retail investing doesn't need foreign bells.",
    knownFor: "Kite, Coin, Varsity",
    website: "https://zerodha.com",
  },
  {
    id: "prai",
    name: "Praan",
    tier: "startup",
    sector: "Climate tech",
    blurb: "Hardware startups tackling air pollution — ambitious, engineering-first.",
    knownFor: "Air purification innovation",
  },
  {
    id: "sleepyowl",
    name: "Sleepy Owl",
    tier: "startup",
    sector: "Beverages",
    blurb: "Cold brew and RTD coffee roasted in India — cafe taste without the chain markup.",
    knownFor: "Cold brew, ground coffee",
    website: "https://sleepyowl.co",
  },
];

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function priceDelta(global: number, indian: number): {
  diff: number;
  cheaper: "global" | "indian" | "same";
} {
  const diff = indian - global;
  if (Math.abs(diff) < 5) return { diff: 0, cheaper: "same" };
  return { diff, cheaper: diff < 0 ? "indian" : "global" };
}
