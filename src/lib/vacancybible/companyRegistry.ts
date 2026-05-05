import { REGISTRY_COMPANIES } from "./registryData";
import type { CompanyRecord } from "./types";

export const COMPANY_REGISTRY: CompanyRecord[] = [...REGISTRY_COMPANIES];
const discoveredCompanySlugs = new Set<string>(COMPANY_REGISTRY.map((c) => c.slug));

export function getCompanyRegistry(activeOnly = true): CompanyRecord[] {
  if (!activeOnly) return COMPANY_REGISTRY;
  return COMPANY_REGISTRY.filter((company) => (company.scrapeErrorCount ?? 0) <= 5);
}

export function addDiscoveredCompanies(companies: CompanyRecord[]): number {
  let added = 0;
  for (const company of companies) {
    if (!company.slug || discoveredCompanySlugs.has(company.slug)) continue;
    discoveredCompanySlugs.add(company.slug);
    COMPANY_REGISTRY.push(company);
    added += 1;
  }
  return added;
}

export function getRegistryCounts() {
  const active = COMPANY_REGISTRY.filter((company) => company.scrapeErrorCount !== undefined ? company.scrapeErrorCount <= 5 : true);
  const byPlatform: Record<string, number> = {
    greenhouse: 0,
    lever: 0,
    ashby: 0,
    workday: 0,
    smartrecruiters: 0,
    direct: 0,
  };
  for (const company of COMPANY_REGISTRY) {
    byPlatform[company.atsPlatform] = (byPlatform[company.atsPlatform] ?? 0) + 1;
  }
  return {
    total: COMPANY_REGISTRY.length,
    active: active.length,
    byPlatform,
  };
}
