import { DEPARTMENTS } from "./departments";

export const ISSUE_TO_DEPARTMENTS: Record<string, string[]> = {
  pothole: ["bbmp-roads"],
  "road-digging": ["bbmp-roads"],
  footpath: ["bbmp-roads"],
  waterlogging: ["bbmp-swd", "bwssb"],
  "drain-blocked": ["bbmp-swd"],
  "open-manhole": ["bbmp-swd"],
  "sewage-overflow": ["bwssb", "bbmp-swd"],
  "water-no-supply": ["bwssb"],
  "water-contaminated": ["bwssb"],
  "water-pipe-burst": ["bwssb"],
  "power-cut": ["bescom"],
  "streetlight-broken": ["bbmp-electrical", "bescom"],
  "live-wire": ["bescom"],
  "garbage-not-collected": ["bbmp-swm"],
  "illegal-dumping": ["bbmp-swm"],
  "public-toilet": ["bbmp-swm"],
  "traffic-signal-broken": ["bengaluru-traffic-police"],
  "illegal-parking": ["bengaluru-traffic-police"],
  "bus-service": [],
  "park-unkempt": ["bbmp-parks"],
  "fallen-tree": ["bbmp-parks"],
  "illegal-construction": ["bbmp-town-planning"],
  encroachment: ["bbmp-town-planning"],
  "water-board-billing": ["bwssb"],
  "electricity-billing": ["bescom"],
  "property-tax": ["bbmp-roads"],
};

export function getDepartmentsForIssue(slug: string) {
  const ids = ISSUE_TO_DEPARTMENTS[slug] ?? [];
  return ids.map((id) => DEPARTMENTS[id]).filter(Boolean);
}
