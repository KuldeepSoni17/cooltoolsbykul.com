export type BreedEntry = {
  id: string;
  species: "dog" | "cat";
  name: string;
  energy: number;
  noviceFriendly: number;
  toleratesAlone: number;
  goodWithKids: number;
  goodWithDogs: number;
  goodWithCats: number;
  shedding: number;
  size: "small" | "medium" | "large";
  rescueAvailability: number;
  bestFor: string[];
  worstFor: string[];
  notes: string;
};

export const BREEDS: BreedEntry[] = [
  {
    id: "lab-mix",
    species: "dog",
    name: "Labrador / Lab mix",
    energy: 4,
    noviceFriendly: 5,
    toleratesAlone: 3,
    goodWithKids: 5,
    goodWithDogs: 4,
    goodWithCats: 3,
    shedding: 4,
    size: "large",
    rescueAvailability: 5,
    bestFor: ["Active families", "First-time owners with time"],
    worstFor: ["Tiny flats", "10+ hours alone daily"],
    notes: "Friendly and trainable; needs exercise and company.",
  },
  {
    id: "greyhound",
    species: "dog",
    name: "Greyhound",
    energy: 2,
    noviceFriendly: 4,
    toleratesAlone: 4,
    goodWithKids: 3,
    goodWithDogs: 3,
    goodWithCats: 2,
    shedding: 2,
    size: "large",
    rescueAvailability: 5,
    bestFor: ["Quiet homes", "Surprisingly low indoor energy"],
    worstFor: ["Off-leash only areas", "Homes with cats (often)"],
    notes: "Often excellent rescue dogs; sprinters, not marathoners.",
  },
  {
    id: "border-collie",
    species: "dog",
    name: "Border Collie",
    energy: 5,
    noviceFriendly: 2,
    toleratesAlone: 2,
    goodWithKids: 3,
    goodWithDogs: 3,
    goodWithCats: 2,
    shedding: 4,
    size: "medium",
    rescueAvailability: 3,
    bestFor: ["Very active experienced owners"],
    worstFor: ["Sedentary life", "Long workdays alone"],
    notes: "Brilliant and intense — understimulation becomes behaviour problems.",
  },
  {
    id: "french-bulldog",
    species: "dog",
    name: "French Bulldog",
    energy: 2,
    noviceFriendly: 4,
    toleratesAlone: 3,
    goodWithKids: 4,
    goodWithDogs: 3,
    goodWithCats: 3,
    shedding: 2,
    size: "small",
    rescueAvailability: 2,
    bestFor: ["Urban flats with AC", "Moderate exercise"],
    worstFor: ["Hot climates without cooling", "Very tight budgets (vet costs)"],
    notes: "Brachycephalic — heat and breathing need care.",
  },
  {
    id: "dsh-cat",
    species: "cat",
    name: "Domestic Shorthair (mix)",
    energy: 3,
    noviceFriendly: 5,
    toleratesAlone: 4,
    goodWithKids: 4,
    goodWithDogs: 3,
    goodWithCats: 4,
    shedding: 3,
    size: "small",
    rescueAvailability: 5,
    bestFor: ["Most homes", "Rescue-first"],
    worstFor: ["Zero enrichment", "Unmanaged dog chase"],
    notes: "The most common shelter cat — individual personality varies.",
  },
  {
    id: "ragdoll",
    species: "cat",
    name: "Ragdoll",
    energy: 2,
    noviceFriendly: 5,
    toleratesAlone: 3,
    goodWithKids: 4,
    goodWithDogs: 3,
    goodWithCats: 4,
    shedding: 4,
    size: "medium",
    rescueAvailability: 2,
    bestFor: ["Calm indoor homes", "Companionship"],
    worstFor: ["Outdoor roaming", "Long isolation"],
    notes: "Affectionate; prefers company.",
  },
  {
    id: "bengal",
    species: "cat",
    name: "Bengal",
    energy: 5,
    noviceFriendly: 2,
    toleratesAlone: 2,
    goodWithKids: 3,
    goodWithDogs: 2,
    goodWithCats: 2,
    shedding: 2,
    size: "medium",
    rescueAvailability: 2,
    bestFor: ["High-enrichment homes"],
    worstFor: ["Quiet sedentary homes", "First-time owners"],
    notes: "High activity and stimulation needs.",
  },
  {
    id: "jack-russell",
    species: "dog",
    name: "Jack Russell Terrier",
    energy: 5,
    noviceFriendly: 3,
    toleratesAlone: 2,
    goodWithKids: 3,
    goodWithDogs: 2,
    goodWithCats: 1,
    shedding: 3,
    size: "small",
    rescueAvailability: 4,
    bestFor: ["Very active owners", "Training commitment"],
    worstFor: ["Cats in home", "Low activity"],
    notes: "Small but not low-energy.",
  },
  {
    id: "cavalier",
    species: "dog",
    name: "Cavalier King Charles Spaniel",
    energy: 2,
    noviceFriendly: 5,
    toleratesAlone: 2,
    goodWithKids: 5,
    goodWithDogs: 4,
    goodWithCats: 4,
    shedding: 3,
    size: "small",
    rescueAvailability: 3,
    bestFor: ["Gentle families", "Companion-focused"],
    worstFor: ["Long hours alone", "Ignoring health screening"],
    notes: "Sweet companion; research heart health in lines.",
  },
  {
    id: "husky",
    species: "dog",
    name: "Siberian Husky",
    energy: 5,
    noviceFriendly: 2,
    toleratesAlone: 1,
    goodWithKids: 3,
    goodWithDogs: 3,
    goodWithCats: 1,
    shedding: 5,
    size: "large",
    rescueAvailability: 4,
    bestFor: ["Cold climates", "Very active experienced owners"],
    worstFor: ["Hot climates", "Flats", "First-time owners"],
    notes: "Often surrendered when owners underestimate needs.",
  },
];

export type MatchPrefs = {
  species: "dog" | "cat" | "any";
  size: "any" | "small" | "medium" | "large";
  energyMax: number;
};

export type BreedMatch = {
  breed: BreedEntry;
  fitLabel: "strong" | "moderate" | "weak";
  reasons: string[];
  watchOuts: string[];
};

export function matchBreeds(prefs: MatchPrefs, userEnergy: number): BreedMatch[] {
  const pool = BREEDS.filter(
    (b) => prefs.species === "any" || b.species === prefs.species,
  ).filter((b) => prefs.size === "any" || b.size === prefs.size);

  const scored = pool.map((breed) => {
    let score = 0;
    const reasons: string[] = [];
    const watchOuts: string[] = [];

    const energyDiff = Math.abs(breed.energy - userEnergy);
    if (energyDiff <= 1) {
      score += 3;
      reasons.push("Energy level aligns with your lifestyle answers.");
    } else if (energyDiff >= 3) {
      score -= 2;
      watchOuts.push("Energy mismatch — may be under-stimulated or overwhelmed.");
    }

    if (breed.noviceFriendly >= 4) reasons.push("Generally manageable for newer owners.");
    if (breed.rescueAvailability >= 4) reasons.push("Often available through rescues.");

    if (breed.toleratesAlone <= 2 && userEnergy <= 2) {
      watchOuts.push("May not tolerate long hours alone.");
    }

    let fitLabel: BreedMatch["fitLabel"] = "moderate";
    if (score >= 3) fitLabel = "strong";
    if (score <= 0 || watchOuts.length >= 2) fitLabel = "weak";

    return { breed, fitLabel, reasons, watchOuts, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ breed, fitLabel, reasons, watchOuts }) => ({
      breed,
      fitLabel,
      reasons,
      watchOuts,
    }));
}
