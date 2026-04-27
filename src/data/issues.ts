export const ISSUE_CATEGORIES = [
  {
    category: "Roads & Infrastructure",
    icon: "🛣️",
    issues: [
      { slug: "pothole", label: "Potholes / Road Damage" },
      { slug: "road-digging", label: "Road Dug Up / Not Restored" },
      { slug: "footpath", label: "Broken Footpath" },
    ],
  },
  {
    category: "Drainage & Flooding",
    icon: "🌊",
    issues: [
      { slug: "waterlogging", label: "Waterlogging / Flooding" },
      { slug: "drain-blocked", label: "Blocked Drain" },
      { slug: "open-manhole", label: "Open / Broken Manhole" },
      { slug: "sewage-overflow", label: "Sewage Overflow" },
    ],
  },
  {
    category: "Water Supply",
    icon: "💧",
    issues: [
      { slug: "water-no-supply", label: "No Water Supply" },
      { slug: "water-contaminated", label: "Contaminated Water" },
      { slug: "water-pipe-burst", label: "Burst Pipe / Leakage" },
    ],
  },
  {
    category: "Electricity",
    icon: "⚡",
    issues: [
      { slug: "power-cut", label: "Power Cut / Outage" },
      { slug: "streetlight-broken", label: "Street Light Not Working" },
      { slug: "live-wire", label: "Hanging / Sparking Wire" },
    ],
  },
  {
    category: "Garbage & Sanitation",
    icon: "🗑️",
    issues: [
      { slug: "garbage-not-collected", label: "Garbage Not Collected" },
      { slug: "illegal-dumping", label: "Illegal Garbage Dumping" },
      { slug: "public-toilet", label: "Dirty / Non-functional Public Toilet" },
    ],
  },
  {
    category: "Traffic & Transport",
    icon: "🚦",
    issues: [
      { slug: "traffic-signal-broken", label: "Broken Traffic Signal" },
      { slug: "illegal-parking", label: "Illegal Parking" },
      { slug: "bus-service", label: "City Bus Issue" },
    ],
  },
  {
    category: "Parks & Trees",
    icon: "🌳",
    issues: [
      { slug: "park-unkempt", label: "Park Not Maintained" },
      { slug: "fallen-tree", label: "Fallen / Dangerous Tree" },
    ],
  },
  {
    category: "Building & Planning",
    icon: "🏗️",
    issues: [
      { slug: "illegal-construction", label: "Illegal Construction" },
      { slug: "encroachment", label: "Land Encroachment" },
    ],
  },
  {
    category: "Government Services",
    icon: "📋",
    issues: [
      { slug: "water-board-billing", label: "Water Bill / Meter Issue" },
      { slug: "electricity-billing", label: "Electricity Bill / Meter Issue" },
      { slug: "property-tax", label: "Property Tax Issue" },
    ],
  },
];

export type IssueSlug = string;
