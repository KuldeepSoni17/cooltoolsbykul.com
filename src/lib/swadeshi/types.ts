export type Ownership =
  | "indian-founded"
  | "indian-listed"
  | "cooperative"
  | "mnc-global";

export type MatchLevel = "strong" | "good" | "situational";

export type ShopCategory = {
  id: string;
  label: string;
  hint: string;
  emoji: string;
};

export type ProductAlternative = {
  id: string;
  categoryId: string;
  occasion: string;
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
  whyMatch: string;
  notSameAs?: string;
  price?: {
    basis: string;
    commonRange: [number, number];
    altRange: [number, number];
    note: string;
  };
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
