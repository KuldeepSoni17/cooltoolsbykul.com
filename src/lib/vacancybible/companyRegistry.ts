import { REGISTRY_COMPANIES } from "./registryData";
import type { CompanyRecord } from "./types";

export const COMPANY_REGISTRY: CompanyRecord[] = REGISTRY_COMPANIES;

export function getCompanyRegistry(activeOnly = true): CompanyRecord[] {
  if (!activeOnly) return COMPANY_REGISTRY;
  return COMPANY_REGISTRY.filter((company) => (company.scrapeErrorCount ?? 0) <= 5);
}
