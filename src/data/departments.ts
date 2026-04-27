export interface Department {
  id: string;
  name: string;
  level: "municipal" | "state" | "central";
  city?: string;
  helpline: string;
  complaintUrl: string;
  websiteUrl: string;
  description: string;
  officers: Officer[];
}

export interface Officer {
  name: string;
  designation: string;
  zone?: string;
  phone?: string;
  email?: string;
  note?: string;
}

export const DEPARTMENTS: Record<string, Department> = {
  "bbmp-roads": {
    id: "bbmp-roads",
    name: "BBMP Roads & Infrastructure",
    level: "municipal",
    city: "Bengaluru",
    helpline: "080-22221188",
    complaintUrl: "https://bbmp.sahaaya.in",
    websiteUrl: "https://bbmp.gov.in",
    description:
      "Responsible for road maintenance, potholes, footpaths, and street-level infrastructure within BBMP limits.",
    officers: [
      {
        designation: "Chief Engineer (Roads)",
        name: "Contact BBMP helpline",
        phone: "080-22221188",
        note: "Officer details: bbmp.gov.in/zonewiseofficers",
      },
    ],
  },
  "bbmp-swd": {
    id: "bbmp-swd",
    name: "BBMP Stormwater Drain (SWD) Department",
    level: "municipal",
    city: "Bengaluru",
    helpline: "080-22221188",
    complaintUrl: "https://bbmp.sahaaya.in",
    websiteUrl: "https://bbmp.gov.in",
    description:
      "Responsible for stormwater drainage, drain maintenance, waterlogging, and manhole safety.",
    officers: [
      {
        designation: "Chief Engineer (SWD)",
        name: "Contact BBMP helpline",
        phone: "080-22221188",
      },
    ],
  },
  bwssb: {
    id: "bwssb",
    name: "BWSSB - Bangalore Water Supply & Sewerage Board",
    level: "state",
    city: "Bengaluru",
    helpline: "1916",
    complaintUrl: "https://bwssb.gov.in/complaint",
    websiteUrl: "https://bwssb.gov.in",
    description:
      "Responsible for drinking water supply, sewerage, and sanitation across Bengaluru.",
    officers: [
      {
        designation: "Executive Engineer (your zone)",
        name: "Call helpline 1916 for zone-specific contact",
        phone: "1916",
      },
    ],
  },
  bescom: {
    id: "bescom",
    name: "BESCOM - Bangalore Electricity Supply Company",
    level: "state",
    city: "Bengaluru",
    helpline: "1912",
    complaintUrl: "https://bescom.karnataka.gov.in/consumer-corner",
    websiteUrl: "https://bescom.karnataka.gov.in",
    description:
      "Responsible for electricity supply, power outages, transformer faults, and billing in Bengaluru.",
    officers: [
      {
        designation: "Assistant Executive Engineer (your subdivision)",
        name: "Call helpline 1912",
        phone: "1912",
      },
    ],
  },
  "bbmp-swm": {
    id: "bbmp-swm",
    name: "BBMP Solid Waste Management",
    level: "municipal",
    city: "Bengaluru",
    helpline: "080-22221188",
    complaintUrl: "https://bbmp.sahaaya.in",
    websiteUrl: "https://bbmp.gov.in",
    description:
      "Responsible for garbage collection, waste segregation, and cleanliness of public spaces.",
    officers: [
      {
        designation: "Health Officer (Ward)",
        name: "Contact via BBMP Sahaaya app",
        phone: "080-22221188",
      },
    ],
  },
  "bbmp-electrical": {
    id: "bbmp-electrical",
    name: "BBMP Electrical Department",
    level: "municipal",
    city: "Bengaluru",
    helpline: "080-22221188",
    complaintUrl: "https://bbmp.sahaaya.in",
    websiteUrl: "https://bbmp.gov.in",
    description:
      "Responsible for street lights within BBMP jurisdiction. Note: power supply is BESCOM's domain.",
    officers: [
      {
        designation: "Executive Engineer (Electrical)",
        name: "Contact via BBMP helpline",
        phone: "080-22221188",
      },
    ],
  },
  "bengaluru-traffic-police": {
    id: "bengaluru-traffic-police",
    name: "Bengaluru City Traffic Police",
    level: "state",
    city: "Bengaluru",
    helpline: "103",
    complaintUrl: "https://www.bangaloretrafficpolice.gov.in/",
    websiteUrl: "https://www.bangaloretrafficpolice.gov.in",
    description:
      "Responsible for traffic signal maintenance, traffic management, and illegal parking enforcement.",
    officers: [
      {
        designation: "Joint Commissioner of Police (Traffic)",
        name: "Contact: 103 / Traffic control room",
        phone: "103",
      },
    ],
  },
  "bbmp-town-planning": {
    id: "bbmp-town-planning",
    name: "BBMP Town Planning & Enforcement",
    level: "municipal",
    city: "Bengaluru",
    helpline: "080-22221188",
    complaintUrl: "https://bbmp.sahaaya.in",
    websiteUrl: "https://bbmp.gov.in",
    description:
      "Responsible for building plan approvals, illegal construction enforcement, and encroachment removal.",
    officers: [
      {
        designation: "Chief Town Planner",
        name: "Contact via BBMP helpline",
        phone: "080-22221188",
      },
    ],
  },
  "bbmp-parks": {
    id: "bbmp-parks",
    name: "BBMP Parks & Horticulture",
    level: "municipal",
    city: "Bengaluru",
    helpline: "080-22221188",
    complaintUrl: "https://bbmp.sahaaya.in",
    websiteUrl: "https://bbmp.gov.in",
    description:
      "Responsible for maintenance of parks, open spaces, trees, and horticulture within BBMP limits.",
    officers: [
      {
        designation: "Executive Director (Horticulture)",
        name: "Contact via BBMP helpline",
        phone: "080-22221188",
      },
    ],
  },
};
