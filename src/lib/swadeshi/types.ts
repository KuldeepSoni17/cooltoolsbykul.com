export type Ownership =
  | "indian-founded"
  | "indian-listed"
  | "cooperative"
  | "mnc-global";

export type MatchLevel = "strong" | "good" | "situational";

export type QualityVerdict =
  | "comparable"
  | "indian-better-value"
  | "indian-weaker"
  | "different-tier";

export type PriceVerdict = "cheaper" | "similar" | "pricier";

export type TrustLevel = "verified" | "research-assisted";

export type ShopCategory = {
  id: string;
  label: string;
  hint: string;
  emoji: string;
};

export type ProductAlternative = {
  id: string;
  categoryId: string;
  subcategory: string;
  occasion: string;
  tags?: string[];
  trustLevel?: TrustLevel;
  common: {
    brand: string;
    product: string;
    ownership: Ownership;
    ownershipNote: string;
  };
  alternative: {
    brand: string;
    product: string;
    ownership: Ownership;
    ownershipNote: string;
    website?: string;
  };
  match: MatchLevel;
  qualityVerdict?: QualityVerdict;
  priceVerdict?: PriceVerdict;
  whyMatch: string;
  notSameAs?: string;
  summary?: string;
  price?: {
    basis: string;
    commonRange: [number, number];
    altRange: [number, number];
    note: string;
  };
};

export type ProductIndexEntry = {
  id: string;
  categoryId: string;
  subcategory: string;
  occasion: string;
  commonBrand: string;
  altBrand: string;
  match: MatchLevel;
  trustLevel?: TrustLevel;
};

export type DigitalAwareness = {
  id: string;
  name: string;
  icon: string;
  dailyUse: string;
  economics: string;
  nuance: string;
  indianNotes?: string;
};

export type BrandSpotlight = {
  id: string;
  name: string;
  type: "established" | "startup";
  sector: string;
  whyListed: string;
  highlights: string;
  hq: string;
  website?: string;
};

export type ImportOutflowBrand = {
  id: string;
  category: string;
  outflowType: "electronics" | "energy" | "luxury" | "digital-services" | "consumer-goods";
  commonSpendUse: string;
  importDependency: "very-high" | "high" | "medium";
  brandExamples: string[];
  whyMoneyGoesOut: string;
  indiaOptions: string;
  honestyNote: string;
};

export type CatalogManifest = {
  version: string;
  generatedAt: string;
  totalProducts: number;
  categories: (ShopCategory & { count: number })[];
};
