export type MirrorStatus = "live" | "beta" | "coming_soon";

export type MirrorEntry = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  accent: string;
  storageKey: string;
  status: MirrorStatus;
  href?: string;
  estDuration?: string;
};

export const MIRROR_FAMILY: MirrorEntry[] = [
  {
    id: "conceiving",
    slug: "questions-before-conceiving",
    title: "Questions Before Conceiving",
    tagline: "A readiness mirror before you bring a child into the world.",
    accent: "#c8a97e",
    storageKey: "mirror-conceiving",
    status: "live",
    href: "/questions-before-conceiving",
    estDuration: "10–15 min",
  },
  {
    id: "pet",
    slug: "questions-before-adopting-pet",
    title: "Questions Before Adopting a Pet",
    tagline: "Readiness assessment plus an honest breed matcher. Rescue-first.",
    accent: "#9caf88",
    storageKey: "mirror-pet",
    status: "live",
    href: "/questions-before-adopting-pet",
    estDuration: "15–20 min",
  },
  {
    id: "marriage",
    slug: "questions-before-marriage",
    title: "Questions Before Getting Married",
    tagline: "Couple mode is the product — where do you actually align?",
    accent: "#b07b6c",
    storageKey: "mirror-marriage",
    status: "live",
    href: "/questions-before-marriage",
    estDuration: "12–18 min",
  },
  {
    id: "moving-in",
    slug: "questions-before-moving-in",
    title: "Questions Before Moving In Together",
    tagline: "Daily logistics, money, space, and exit — before you sign the lease.",
    accent: "#8a9fbf",
    storageKey: "mirror-moving-in",
    status: "live",
    href: "/questions-before-moving-in",
    estDuration: "10–15 min",
  },
  {
    id: "buying-home",
    slug: "questions-before-buying-a-home",
    title: "Questions Before Buying a Home",
    tagline: "The largest financial decision — with the non-financial dimensions too.",
    accent: "#a38b6e",
    storageKey: "mirror-buying-home",
    status: "live",
    href: "/questions-before-buying-a-home",
    estDuration: "12–18 min",
  },
  {
    id: "quitting-job",
    slug: "questions-before-quitting-your-job",
    title: "Questions Before Quitting Your Job",
    tagline: "Push vs pull, runway, identity, and reversibility.",
    accent: "#7c8c7e",
    storageKey: "mirror-quitting-job",
    status: "live",
    href: "/questions-before-quitting-your-job",
    estDuration: "10–15 min",
  },
  {
    id: "emigrating",
    slug: "questions-before-emigrating",
    title: "Questions Before Emigrating",
    tagline: "Money, visa, roots, language, and what happens if it does not work.",
    accent: "#7e8da6",
    storageKey: "mirror-emigrating",
    status: "coming_soon",
    estDuration: "15–20 min",
  },
  {
    id: "second-child",
    slug: "questions-before-a-second-child",
    title: "Questions Before a Second Child",
    tagline: "Honest capacity when you are already parenting.",
    accent: "#c8a97e",
    storageKey: "mirror-second-child",
    status: "coming_soon",
    estDuration: "12–18 min",
  },
  {
    id: "caregiver",
    slug: "questions-before-becoming-a-caregiver",
    title: "Questions Before Becoming a Caregiver",
    tagline: "Capacity, siblings, finance, and end-of-life — for aging parents.",
    accent: "#a89a78",
    storageKey: "mirror-caregiver",
    status: "coming_soon",
    estDuration: "12–18 min",
  },
];

export function liveMirrors() {
  return MIRROR_FAMILY.filter((m) => m.status === "live");
}
