import { buildAssessment, DEFAULT_PROFILES } from "@/features/mirror-engine/buildAssessment";

type DomainQ = {
  id: string;
  name: string;
  framing: string;
  questions: { prompt: string; options: [string, string, string, string] }[];
};

function make(
  id: string,
  title: string,
  storageKey: string,
  accent: string,
  domains: DomainQ[],
) {
  return buildAssessment({
    id,
    title,
    storageKey,
    accent,
    domains,
    profiles: DEFAULT_PROFILES,
    research: domains.slice(0, 2).map((d) => ({
      domainId: d.id,
      title: `Why ${d.name} matters`,
      paragraphs: [d.framing],
      action: `Discuss ${d.name.toLowerCase()} explicitly before you decide.`,
    })),
  });
}

const four = (
  prompts: [string, string, string, string],
  opts: [string, string, string, string][] ,
) =>
  prompts.map((prompt, i) => ({
    prompt,
    options: opts[i] as [string, string, string, string],
  }));

export const MOVING_IN_ASSESSMENT = make(
  "moving-in",
  "Questions Before Moving In Together",
  "mirror-moving-in",
  "#8a9fbf",
  [
    {
      id: "logistics",
      name: "Daily Logistics",
      framing: "Cohabitation is mostly dishes, sleep, and who buys toilet paper.",
      questions: four(
        [
          "How aligned are you on cleanliness standards?",
          "Who handles groceries, cooking, and cleanup by default?",
          "How do you handle different sleep schedules?",
          "What happens when one of you is sick or overwhelmed?",
        ],
        [
          ["Same standards; we have discussed it.", "Close enough with agreed rules.", "Different; we avoid the topic.", "Very different; recurring friction."],
          ["Written or practiced split.", "Verbal agreement that mostly works.", "Assumptions differ.", "No plan; resentment building."],
          ["Compatible with a plan.", "Manageable with earplugs/space.", "Regular conflict.", "Incompatible without change."],
          ["We care for each other reliably.", "Usually show up.", "Uneven effort.", "One person carries most load."],
        ],
      ),
    },
    {
      id: "money",
      name: "Money & Fairness",
      framing: "Rent is never just rent when incomes differ.",
      questions: four(
        [
          "How will you split housing costs?",
          "How transparent are debts and spending habits?",
          "How do you handle unequal income fairly?",
          "What is your plan for joint vs separate accounts?",
        ],
        [
          ["Agreed model we have tested.", "Principle agreed; details pending.", "Different assumptions.", "Not discussed."],
          ["Fully transparent.", "Mostly transparent.", "Significant gaps.", "Avoidance or secrecy."],
          ["Equitable model we both endorse.", "Talked about; feelings mixed.", "Resentment likely.", "We have not addressed it."],
          ["Clear plan.", "Leaning toward a model.", "Conflict when money comes up.", "No plan."],
        ],
      ),
    },
    {
      id: "space",
      name: "Space & Privacy",
      framing: "Alone time is not rejection — it is maintenance.",
      questions: four(
        [
          "How much alone time does each of you need weekly?",
          "How do you handle guests and hosting?",
          "Can you both work from home without friction?",
          "How do you negotiate décor and shared spaces?",
        ],
        [
          ["Named and respected.", "Mostly respected.", "One person’s needs dominate.", "Unspoken tension."],
          ["Aligned expectations.", "Mostly fine.", "Frequent mismatch.", "Major source of fights."],
          ["Tested or planned.", "Probably workable.", "Untested; worried.", "Known conflict."],
          ["Collaborative.", "Give and take.", "One person yields always.", "Avoided; resentment."],
        ],
      ),
    },
    {
      id: "conflict",
      name: "Conflict & Repair",
      framing: "You will fight in a smaller apartment — can you repair?",
      questions: four(
        [
          "After a hard argument, what usually happens?",
          "How do you handle criticism?",
          "Are there topics you avoid because they escalate?",
          "Have you lived together before (even short-term)?",
        ],
        [
          ["Repair within hours with accountability.", "Repair within a day or two.", "Cold war or avoidance.", "Escalation or contempt."],
          ["Curious, not defensive.", "Sting but recover.", "Defensive patterns.", "Contempt or shutdown."],
          ["Few; we navigate them.", "Some; we are learning.", "Several important ones.", "Many; fear of explosion."],
          ["Yes — learned useful lessons.", "Briefly — mixed.", "No — only overnights.", "No — only idealised visits."],
        ],
      ),
    },
    {
      id: "expectations",
      name: "Expectations & Roles",
      framing: "Unspoken scripts break leases and relationships.",
      questions: four(
        [
          "What does ‘home’ mean to each of you?",
          "How do you divide emotional labour?",
          "What are your non-negotiables about pets, kids, or substances?",
          "How aligned are you on social life at home?",
        ],
        [
          ["We have compared definitions.", "Mostly aligned.", "Assumed alignment.", "We have not compared."],
          ["Explicit and fair enough.", "Imbalanced but discussed.", "One person carries invisible load.", "Not discussed."],
          ["Spoken and compatible.", "Mostly compatible.", "Partially spoken.", "Known conflicts unaddressed."],
          ["Aligned.", "Negotiable differences.", "Frequent tension.", "Major mismatch."],
        ],
      ),
    },
    {
      id: "exit",
      name: "Exit & Safety",
      framing: "Hope is not a lease strategy.",
      questions: four(
        [
          "If you split, what is the practical plan?",
          "How safe do you feel raising hard truths?",
          "Are you moving in to fix the relationship?",
          "How reversible is this decision financially?",
        ],
        [
          ["Discussed including lease and belongings.", "Rough plan.", "Avoided.", "Would be chaotic."],
          ["Very safe.", "Mostly safe.", "Sometimes unsafe emotionally.", "I hold back to keep peace."],
          ["No — relationship is solid.", "Partly — we hope proximity helps.", "Mostly to test.", "Yes — hoping living together fixes us."],
          ["Savings and backup options exist.", "Some buffer.", "Thin margin.", "Would be financially trapped."],
        ],
      ),
    },
  ],
);

export const BUYING_HOME_ASSESSMENT = make(
  "buying-home",
  "Questions Before Buying a Home",
  "mirror-buying-home",
  "#a38b6e",
  [
    {
      id: "financial",
      name: "Financial Readiness",
      framing: "A house payment is a decade-long commitment, not a mood.",
      questions: four(
        [
          "How many months of expenses do you have after closing costs?",
          "How stable is your income for the next 3–5 years?",
          "Have you stress-tested rates rising 2%+?",
          "How does this purchase affect other goals (retirement, kids, care)?",
        ],
        [
          ["12+ months runway.", "6–12 months.", "3–6 months.", "Under 3 months."],
          ["Very stable.", "Mostly stable.", "Uncertain.", "Volatile or changing soon."],
          ["Yes — still comfortable.", "Borderline.", "Not really.", "Would strain us."],
          ["Still on track.", "Trade-offs discussed.", "Pushes goals back.", "Would derail goals."],
        ],
      ),
    },
    {
      id: "market",
      name: "Market & Timing",
      framing: "You cannot time the market — but you can time your life.",
      questions: four(
        [
          "Are you buying because you must, or because you fear prices?",
          "How long will you realistically stay in this location?",
          "Have you compared rent vs buy with maintenance included?",
          "What happens if you need to sell in 2 years?",
        ],
        [
          ["Life-fit decision.", "Mostly fit; some FOMO.", "Heavy FOMO pressure.", "Panic or external pressure."],
          ["5+ years likely.", "3–5 years.", "1–3 years.", "Under a year possible."],
          ["Yes — buy still makes sense.", "Roughly equal.", "Rent may be smarter.", "Have not modeled it."],
          ["Fine — equity and flexibility.", "Manageable loss risk.", "Could be painful.", "Could be financially harmful."],
        ],
      ),
    },
    {
      id: "lifestyle",
      name: "Lifestyle Fit",
      framing: "Commute and maintenance are daily taxes.",
      questions: four(
        [
          "Does the commute match your energy and family plans?",
          "Can you afford maintenance (1–2% of value yearly)?",
          "Does the neighbourhood fit your actual life stage?",
          "Are you ready for ownership chores (yard, repairs, HOA)?",
        ],
        [
          ["Yes — tested.", "Probably.", "Stretch.", "No — would harm quality of life."],
          ["Budgeted and realistic.", "Tight but planned.", "Hope to defer repairs.", "No buffer for upkeep."],
          ["Strong fit.", "Acceptable.", "Compromise.", "Mismatch."],
          ["Ready.", "Willing to learn.", "Resentful already.", "Avoiding reality."],
        ],
      ),
    },
    {
      id: "partnership",
      name: "Partnership Alignment",
      framing: "Two signatures, one roof.",
      questions: four(
        [
          "Do all buyers agree on budget ceiling?",
          "How do you handle one partner wanting more house than the other?",
          "Are you aligned on fixer-upper vs move-in ready?",
          "What if one of you loses a job after purchase?",
        ],
        [
          ["Yes — explicit.", "Mostly.", "Frequent tension.", "Not aligned."],
          ["Repairable process.", "One person usually wins.", "Chronic resentment.", "Unspoken power struggle."],
          ["Aligned.", "Negotiated.", "Split preferences.", "Major conflict."],
          ["Plan discussed.", "Vague plan.", "Hope only.", "No plan."],
        ],
      ),
    },
    {
      id: "risk",
      name: "Risk Tolerance",
      framing: "Leverage magnifies mistakes.",
      questions: four(
        [
          "How would a 20% value drop feel in year 2?",
          "Are you relying on appreciation to make the math work?",
          "How diversified are you outside this property?",
          "What insurance and emergency gaps remain?",
        ],
        [
          ["Uncomfortable but survivable.", "Stressful.", "Would threaten stability.", "Would be catastrophic."],
          ["No — cash-flow positive regardless.", "Somewhat.", "Heavily.", "Entirely."],
          ["Well diversified.", "Moderate.", "Most wealth in house.", "All eggs here."],
          ["Reviewed.", "Mostly.", "Gaps known.", "Not reviewed."],
        ],
      ),
    },
    {
      id: "commitment",
      name: "Long-Term Commitment",
      framing: "Roots are wonderful when chosen, heavy when accidental.",
      questions: four(
        [
          "Does buying reduce options you still want?",
          "Are you buying to please family or status?",
          "Have you lived in this area long enough to know seasons/tradeoffs?",
          "What would ‘success’ look like 10 years after buying?",
        ],
        [
          ["No — expands options.", "Minor trade-offs.", "Significant lock-in worry.", "Would trap us."],
          ["No — our decision.", "Some external voice.", "Heavy external pressure.", "Mostly status."],
          ["Yes — informed.", "Somewhat.", "New area.", "Fantasy image only."],
          ["Clear shared picture.", "Rough picture.", "Different pictures.", "No picture."],
        ],
      ),
    },
  ],
);

export const QUITTING_JOB_ASSESSMENT = make(
  "quitting-job",
  "Questions Before Quitting Your Job",
  "mirror-quitting-job",
  "#7c8c7e",
  [
    {
      id: "runway",
      name: "Financial Runway",
      framing: "Freedom needs a number, not a vibe.",
      questions: four(
        [
          "How many months of essential expenses can you cover without income?",
          "Do you have healthcare covered during the gap?",
          "Are there upcoming large expenses in the next 12 months?",
          "Could you take a lower-paying bridge role if needed?",
        ],
        [
          ["9+ months.", "6–9 months.", "3–6 months.", "Under 3 months."],
          ["Fully planned.", "Mostly.", "Uncertain.", "No plan."],
          ["Budgeted.", "Manageable.", "Would strain savings.", "Would break budget."],
          ["Yes — open to it.", "Maybe.", "Pride would block it.", "No — need same band."],
        ],
      ),
    },
    {
      id: "push-pull",
      name: "Push vs Pull",
      framing: "Running from pain is different from running toward work.",
      questions: four(
        [
          "Is your main driver escape or opportunity?",
          "Have you tried to fix what is fixable in-role?",
          "Will the same pattern follow you?",
          "Do you have a concrete next step (offer, plan, sabbatical)?",
        ],
        [
          ["Clear pull toward something.", "Mostly pull.", "Mostly push/escape.", "Pure escape."],
          ["Yes — documented attempts.", "Some attempts.", "Skipped.", "Role is untenable."],
          ["Unlikely — environment-specific.", "Maybe.", "Likely — pattern is mine.", "Definitely repeats."],
          ["Signed or funded plan.", "Credible plan.", "Vague intention.", "No plan."],
        ],
      ),
    },
    {
      id: "identity",
      name: "Identity & Meaning",
      framing: "Who are you when the title is gone?",
      questions: four(
        [
          "How much of your self-worth is tied to this job?",
          "Who will you tell first — and what do you fear they will think?",
          "What structure will your days have after quitting?",
          "What will you miss that you are not naming?",
        ],
        [
          ["Healthy separation.", "Some entanglement.", "Heavy entanglement.", "Identity crisis likely."],
          ["Told trusted people; calm.", "Anxious about judgment.", "Hiding it.", "Ashamed."],
          ["Planned routine.", "Rough plan.", "Empty calendar scare.", "No structure."],
          ["Named losses.", "Some named.", "Idealising exit.", "Not reflected."],
        ],
      ),
    },
    {
      id: "reversibility",
      name: "Reversibility",
      framing: "Bridges burn at different speeds.",
      questions: four(
        [
          "Can you return to this employer or industry easily?",
          "How will you leave (relationship capital)?",
          "Are you quitting during a volatile market in your field?",
          "What references will you have in 6 months?",
        ],
        [
          ["Likely yes.", "Possible.", "Hard.", "Would burn bridges."],
          ["Professional and grateful exit.", "Adequate.", "Bitter exit risk.", "Already damaged."],
          ["Stable hiring.", "Normal.", "Cooling.", "Very risky timing."],
          ["Strong.", "Adequate.", "Thin.", "Damaged."],
        ],
      ),
    },
    {
      id: "support",
      name: "Support Network",
      framing: "Decisions made alone feel brave; supported ones last.",
      questions: four(
        [
          "Who has counselled you beyond venting friends?",
          "Does your household support the timing?",
          "Do you have peers in the path you are entering?",
          "Who will check your thinking when optimism spikes?",
        ],
        [
          ["Mentor/coach/therapist involved.", "Trusted advisor.", "Only friends.", "No one."],
          ["Fully aligned.", "Mostly.", "Tension.", "Opposed or uninformed."],
          ["Yes — active network.", "Some.", "Building.", "None."],
          ["Yes — named person.", "Informal.", "Would not ask.", "No one."],
        ],
      ),
    },
    {
      id: "timing",
      name: "Timing & Ethics",
      framing: "The last two weeks matter as much as the next two years.",
      questions: four(
        [
          "Are you leaving mid-critical project without handover?",
          "Is burnout distorting this decision?",
          "Have you slept on this for at least two weeks?",
          "What would you advise your best friend in this seat?",
        ],
        [
          ["Responsible handover planned.", "Adequate notice.", "Abrupt.", "Would harm team badly."],
          ["Clear-headed.", "Some burnout.", "Burned out.", "Crisis mode."],
          ["Yes — stable conviction.", "Mostly.", "Impulsive week.", "Decided today."],
          ["Leave with plan.", "Leave soon with plan.", "Wait.", "Do not quit yet."],
        ],
      ),
    },
  ],
);
