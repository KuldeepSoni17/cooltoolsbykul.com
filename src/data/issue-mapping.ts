import { DEPARTMENTS } from "./departments";

const CITY_ALIASES: Record<string, string> = {
  bangalore: "Bengaluru",
  bengaluru: "Bengaluru",
  "bengaluru urban": "Bengaluru",
  ahmedabad: "Ahmedabad",
  ahmadabad: "Ahmedabad",
};

const ISSUE_CITY_TO_DEPARTMENTS: Record<string, Record<string, string[]>> = {
  pothole: {
    Bengaluru: ["bbmp-roads"],
    Ahmedabad: ["ahmedabad-amc-roads"],
  },
  "road-digging": {
    Bengaluru: ["bbmp-roads"],
    Ahmedabad: ["ahmedabad-amc-roads"],
  },
  waterlogging: {
    Bengaluru: ["bbmp-swd", "bwssb"],
    Ahmedabad: ["ahmedabad-amc-roads", "ahmedabad-amc-water"],
  },
  "power-cut": {
    Bengaluru: ["bescom"],
    Ahmedabad: ["ahmedabad-torrent-power"],
  },
  "streetlight-broken": {
    Bengaluru: ["bbmp-electrical", "bescom"],
    Ahmedabad: ["ahmedabad-amc-roads", "ahmedabad-torrent-power"],
  },
  "live-wire": {
    Bengaluru: ["bescom"],
    Ahmedabad: ["ahmedabad-torrent-power"],
  },
  "traffic-signal-broken": {
    Bengaluru: ["bengaluru-traffic-police"],
    Ahmedabad: ["ahmedabad-traffic-police"],
  },
  "illegal-parking": {
    Bengaluru: ["bengaluru-traffic-police"],
    Ahmedabad: ["ahmedabad-traffic-police"],
  },
  "water-no-supply": {
    Bengaluru: ["bwssb"],
    Ahmedabad: ["ahmedabad-amc-water"],
  },
  "water-contaminated": {
    Bengaluru: ["bwssb"],
    Ahmedabad: ["ahmedabad-amc-water"],
  },
  "water-pipe-burst": {
    Bengaluru: ["bwssb"],
    Ahmedabad: ["ahmedabad-amc-water"],
  },
  "sewage-overflow": {
    Bengaluru: ["bwssb", "bbmp-swd"],
    Ahmedabad: ["ahmedabad-amc-water"],
  },
};

function normalizeCity(city: string) {
  const key = city.trim().toLowerCase();
  return CITY_ALIASES[key] ?? city;
}

export function getDepartmentsForIssue(slug: string, city: string) {
  const normalizedCity = normalizeCity(city);
  const ids =
    ISSUE_CITY_TO_DEPARTMENTS[slug]?.[normalizedCity] ??
    ISSUE_CITY_TO_DEPARTMENTS[slug]?.Bengaluru ??
    [];
  return ids.map((id) => DEPARTMENTS[id]).filter(Boolean);
}
