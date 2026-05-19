import { buildAssessment, DEFAULT_PROFILES } from "@/features/mirror-engine/buildAssessment";

export const PET_READINESS_ASSESSMENT = buildAssessment({
  id: "pet",
  title: "Questions Before Adopting a Pet",
  storageKey: "mirror-pet",
  accent: "#9caf88",
  domains: [
    {
      id: "time",
      name: "Time & Lifestyle",
      framing: "The single biggest reason adoptions fail is time alone and energy mismatch.",
      questions: [
        {
          prompt: "On a typical weekday, how many hours will the animal be alone?",
          options: [
            "Under 4 hours with reliable check-ins.",
            "4–6 hours with a plan for breaks.",
            "8–10 hours regularly.",
            "Over 10 hours or unpredictable.",
          ],
        },
        {
          prompt: "How does your weekly movement / energy level match a high-energy animal?",
          options: [
            "High — daily active time is realistic.",
            "Moderate — regular walks or play.",
            "Low — mostly home and sedentary.",
            "Very low — limited mobility or stamina.",
          ],
        },
        {
          prompt: "How often are you away overnight or for multi-day trips?",
          options: [
            "Rarely with reliable pet care lined up.",
            "Occasionally with backup care.",
            "Monthly or more without a fixed plan.",
            "Frequent travel; care is uncertain.",
          ],
        },
        {
          prompt: "Honestly, how much energy do you have at the end of a workday for training and play?",
          options: [
            "Consistent energy for daily care.",
            "Most days I can show up.",
            "Often depleted; care would slip.",
            "I would struggle most days.",
          ],
        },
      ],
    },
    {
      id: "space",
      name: "Space & Environment",
      framing: "Your home is the animal's whole world.",
      questions: [
        {
          prompt: "What best describes your home?",
          options: [
            "House with private outdoor access.",
            "Flat with good space; some outdoor access.",
            "Small flat; limited space.",
            "Housing not suitable for animals.",
          ],
        },
        {
          prompt: "Are there building rules, deposits, or breed restrictions?",
          options: [
            "Cleared — pets allowed in writing.",
            "Likely fine; not fully confirmed.",
            "Restrictions that limit species/size.",
            "Pets not allowed or unknown.",
          ],
        },
        {
          prompt: "How pet-safe is your space (balconies, toxins, escape routes)?",
          options: [
            "Reviewed and mitigated.",
            "Mostly safe; minor fixes needed.",
            "Several hazards not addressed.",
            "Not considered yet.",
          ],
        },
        {
          prompt: "Climate control for heat/cold sensitivity?",
          options: [
            "Reliable heating and cooling.",
            "Adequate for most breeds.",
            "Extremes without mitigation.",
            "Not suitable for sensitive breeds.",
          ],
        },
      ],
    },
    {
      id: "horizon",
      name: "Time Horizon",
      framing: "A pet is a 10–18 year commitment.",
      questions: [
        {
          prompt: "Where do you realistically see yourself living in 5–10 years?",
          options: [
            "Stable location and housing.",
            "Likely stable with some uncertainty.",
            "Major moves or changes likely.",
            "Very uncertain or unstable.",
          ],
        },
        {
          prompt: "Children — present or planned during the animal's life?",
          options: [
            "Stable plan; pet-friendly approach.",
            "Possible; thought through.",
            "Likely soon without pet plan.",
            "High conflict risk with a pet.",
          ],
        },
        {
          prompt: "If the animal needed years of senior intensive care, could you commit?",
          options: [
            "Yes — emotionally and financially.",
            "Probably, with difficulty.",
            "Unsure I could sustain it.",
            "I have not faced this honestly.",
          ],
        },
        {
          prompt: "If you had to rehome, what would trigger that?",
          options: [
            "Only true welfare emergency.",
            "Behaviour or cost beyond coping.",
            "Convenience factors might apply.",
            "I see rehoming as likely option.",
          ],
        },
      ],
    },
    {
      id: "finance",
      name: "Financial Readiness",
      framing: "The true cost is always higher than the adoption fee.",
      questions: [
        {
          prompt: "Could you cover an unexpected £3–5k vet bill?",
          options: [
            "Yes without destabilising us.",
            "With strain but possible.",
            "Would need debt or help.",
            "No realistic capacity.",
          ],
        },
        {
          prompt: "Have you budgeted annual food, vet, insurance, grooming?",
          options: [
            "Detailed budget done.",
            "Rough estimate only.",
            "Not really priced.",
            "No budget at all.",
          ],
        },
        {
          prompt: "Pet insurance — researched for your species?",
          options: [
            "Priced and plan to insure.",
            "Aware; not purchased yet.",
            "Unlikely to insure.",
            "Not looked into.",
          ],
        },
        {
          prompt: "Travel / boarding costs when you are away?",
          options: [
            "Reliable affordable options identified.",
            "Some options; cost acceptable.",
            "Limited options or expensive.",
            "No plan for care when away.",
          ],
        },
      ],
    },
    {
      id: "experience",
      name: "Experience & Training",
      framing: "Behaviour problems are normal; response determines outcomes.",
      questions: [
        {
          prompt: "Adult experience owning this species?",
          options: [
            "Years of successful ownership.",
            "Some experience.",
            "First-time as responsible adult.",
            "Never owned as adult.",
          ],
        },
        {
          prompt: "If the animal destroyed furniture for 6 months, you would…",
          options: [
            "Train consistently; get professional help.",
            "Try hard; might fray.",
            "Frustration would build quickly.",
            "Consider rehoming.",
          ],
        },
        {
          prompt: "Capacity for separation anxiety / reactivity work?",
          options: [
            "Would hire behaviourist and commit.",
            "Would try; learning curve.",
            "Limited patience for behaviour work.",
            "Would not engage deeply.",
          ],
        },
        {
          prompt: "Comfort using positive reinforcement training?",
          options: [
            "Practiced and committed.",
            "Willing to learn.",
            "Prefer quick fixes.",
            "Punitive approaches likely.",
          ],
        },
      ],
    },
    {
      id: "household",
      name: "Household Composition",
      framing: "Everyone in the home lives with the consequences.",
      questions: [
        {
          prompt: "Are all household members on board with adoption?",
          options: [
            "Fully on board and involved.",
            "Mostly; one person leading.",
            "Significant disagreement.",
            "I am deciding alone.",
          ],
        },
        {
          prompt: "Other pets in the home?",
          options: [
            "None, or harmonious multi-pet plan.",
            "Pets with introduction plan.",
            "Pets with known conflict risk.",
            "Unmanaged multi-pet risk.",
          ],
        },
        {
          prompt: "Children under 5 in the home?",
          options: [
            "No young children.",
            "Older children with supervision plan.",
            "Young children; plan unclear.",
            "Young children; high risk setup.",
          ],
        },
        {
          prompt: "Allergies in the household?",
          options: [
            "None known.",
            "Mild; manageable.",
            "Suspected not tested.",
            "Known significant allergy.",
          ],
        },
      ],
    },
    {
      id: "values",
      name: "Values & Welfare",
      framing: "Rescue-first does not mean rescue-only — it means honesty.",
      questions: [
        {
          prompt: "Rescue vs breeder — where do you honestly sit?",
          options: [
            "Rescue first; open if welfare-justified.",
            "Prefer rescue; flexible.",
            "Prefer breeder for predictability.",
            "Breeder only.",
          ],
        },
        {
          prompt: "If the animal was anxious, aloof, or not what you imagined?",
          options: [
            "Would adapt with support; never rehome lightly.",
            "Would work hard before any major decision.",
            "Might rehome if mismatch large.",
            "Would expect a 'perfect' pet.",
          ],
        },
        {
          prompt: "End-of-life decisions including euthanasia?",
          options: [
            "Thought through; can act in pet's interest.",
            "Difficult but could do it.",
            "Would avoid thinking about it.",
            "Cannot face this responsibility.",
          ],
        },
        {
          prompt: "Why adopt now — honest motivation?",
          options: [
            "Stable life ready to expand for them.",
            "Mostly ready; some personal filling.",
            "Mixed motives; gaps unexamined.",
            "Primarily to fill a personal gap.",
          ],
        },
      ],
    },
    {
      id: "motivation",
      name: "Honest Motivation",
      framing: "The Tuesday test: can you describe a normal day six months in?",
      questions: [
        {
          prompt: "Is this primarily your decision or someone else's wish?",
          options: [
            "Fully mine with partner aligned.",
            "Mine with family buy-in.",
            "Mostly partner/child driven.",
            "External pressure dominates.",
          ],
        },
        {
          prompt: "Drawn to look/story vs daily care reality?",
          options: [
            "Care reality is what excites me.",
            "Both; care thought through.",
            "More aesthetic than practical.",
            "Mostly image or fantasy.",
          ],
        },
        {
          prompt: "Can you describe a specific Tuesday six months after adoption?",
          options: [
            "Yes — in concrete detail.",
            "Rough picture with gaps.",
            "Only idealised scenes.",
            "Not really.",
          ],
        },
        {
          prompt: "18-year commitment including hard senior years?",
          options: [
            "Yes — I understand and accept.",
            "Probably with reservations.",
            "Have not thought that far.",
            "I am thinking short-term.",
          ],
        },
      ],
    },
  ],
  profiles: [
    {
      id: "steward",
      name: "The Steward",
      oneLiner: "Ready to steward another life well.",
      guidance: "Proceed with species and breed matching that fits your real constraints.",
    },
    {
      id: "almost",
      name: "The Almost",
      oneLiner: "Real intent; targeted gaps to close first.",
      guidance: "Address the lowest domains before adoption — especially time and finance.",
    },
    {
      id: "romantic",
      name: "The Romantic",
      oneLiner: "High values; practical domains need work.",
      guidance: "The matcher will run, but readiness suggests preparation before bringing an animal home.",
    },
    {
      id: "unprepared",
      name: "The Unprepared",
      oneLiner: "Not a moral verdict — a timing signal.",
      guidance: "Use growth areas as a checklist. Waiting may be the kindest choice.",
    },
    ...DEFAULT_PROFILES.filter((p) => p.id === "unfinished"),
  ],
  research: [
    {
      domainId: "time",
      title: "Why time alone matters",
      paragraphs: [
        "Dogs left alone beyond their tolerance develop separation distress. Cats need environmental enrichment even when independent.",
      ],
      action: "Log actual alone hours for two weeks before adopting.",
    },
  ],
});
