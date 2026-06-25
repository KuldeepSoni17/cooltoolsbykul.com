export type PolicyKind = "new" | "modify";

export type PolicyStatus =
  | "proposed"
  | "under_review"
  | "adopted"
  | "rejected";

export type Policy = {
  id: string;
  kind: PolicyKind;
  title: string;
  domain: string | null;
  proposal: string;
  rationale: string;
  incidents: string | null;
  impact_estimate: string | null;
  details: string | null;
  existing_policy: string | null;
  proposed_change: string | null;
  author_name: string | null;
  status: PolicyStatus;
  upvotes: number;
  downvotes: number;
  created_at: string;
};

export type NewPolicyInput = {
  kind: PolicyKind;
  title: string;
  domain?: string;
  proposal: string;
  rationale: string;
  incidents?: string;
  impact_estimate?: string;
  details?: string;
  existing_policy?: string;
  proposed_change?: string;
  author_name?: string;
};

export type VoteValue = 1 | -1;
