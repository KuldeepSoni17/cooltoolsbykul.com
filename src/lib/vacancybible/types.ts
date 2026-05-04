export type Confidence = "WRITTEN" | "ESTIMATED" | "NOT_AVAILABLE";

export type FlexMode = "STRICT" | "FLEXIBLE" | "OPEN";

export interface FieldValue<T = string | number | null> {
  value: T;
  confidence: Confidence;
  source?: string;
}

export interface SearchInput {
  title: string;
  location?: string;
  experienceMin?: number;
  experienceMax?: number;
  packageLpaMin?: number;
  domain?: string;
  flexibility: {
    title: FlexMode;
    location: FlexMode;
    experience: FlexMode;
    package: FlexMode;
    domain: FlexMode;
  };
}

export interface CompanyRecord {
  name: string;
  slug: string;
  careersPageUrl: string;
  atsPlatform:
    | "greenhouse"
    | "lever"
    | "ashby"
    | "workday"
    | "smartrecruiters"
    | "direct";
  atsSlug?: string;
  sector?: string;
  hqCity?: string;
  hqCountry?: string;
  indiaOffices?: string[];
  fundingStatus?: string;
  isPublic?: boolean;
  pmMaturityScore?: number;
  brandValueScore?: number;
  stabilityScore?: number;
  scrapeErrorCount?: number;
}

export interface RawJobRecord {
  companySlug: string;
  companyName: string;
  sourceUrl: string;
  title: string;
  location?: string;
  description?: string;
  postedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface EnrichedJob {
  id: string;
  sourceUrl: string;
  sourceUrlHash: string;
  atsPlatform: CompanyRecord["atsPlatform"];
  companyName: FieldValue<string>;
  exactRoleTitle: FieldValue<string>;
  location: FieldValue<string | null>;
  workMode: FieldValue<string | null>;
  yearsExp: FieldValue<string | null>;
  totalCompLpa: FieldValue<string | null>;
  domain: FieldValue<string | null>;
  ownershipType: FieldValue<string | null>;
  companyStability: FieldValue<number | null>;
  layoffRisk: FieldValue<number | null>;
  wlbScore: FieldValue<number | null>;
  interviewDifficulty: FieldValue<number | null>;
  analysisNotes: string;
  postedDate?: string;
  rawDescription?: string;
}

export interface SearchProgressEvent {
  sessionId: string;
  stage:
    | "queued"
    | "running"
    | "scraping_company"
    | "enriching"
    | "ranking"
    | "completed"
    | "failed";
  message: string;
  processedCompanies: number;
  totalCompanies: number;
  jobsFound: number;
  timestamp: string;
}

export interface SearchSession {
  id: string;
  query: SearchInput;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  companiesHit: number;
  jobsFound: number;
  jobsNew: number;
  durationMs?: number;
}
