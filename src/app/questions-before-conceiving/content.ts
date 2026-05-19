import type { AssessmentConfig, AssessmentStep } from "@/features/mirror-engine/types";

const TOTAL = 8;

function interstitial(
  domainId: string,
  domainName: string,
  domainNumber: number,
  framing: string,
): AssessmentStep {
  return {
    kind: "interstitial",
    domainId,
    domainName,
    domainNumber,
    totalDomains: TOTAL,
    framing,
  };
}

function likert(
  id: string,
  domainId: string,
  domainName: string,
  domainNumber: number,
  prompt: string,
  options: { label: string; score: 1 | 2 | 3 | 4; flag?: string }[],
  subtext?: string,
): AssessmentStep {
  return {
    kind: "question",
    id,
    type: "likert",
    domainId,
    domainName,
    domainNumber,
    prompt,
    subtext,
    options,
  };
}

function scenario(
  id: string,
  domainId: string,
  domainName: string,
  domainNumber: number,
  prompt: string,
  vignettes: { label: string; score: 1 | 2 | 3 | 4 }[],
  subtext?: string,
): AssessmentStep {
  return {
    kind: "question",
    id,
    type: "scenario",
    domainId,
    domainName,
    domainNumber,
    prompt,
    subtext,
    vignettes,
  };
}

const steps: AssessmentStep[] = [
  interstitial(
    "emotional",
    "Mental & Emotional Wellbeing",
    1,
    "Your inner stability is the foundation everything else rests on.",
  ),
  likert("e1", "emotional", "Mental & Emotional Wellbeing", 1, "How consistently can you regulate emotions during high stress?", [
    { label: "Very consistently; I recover quickly and communicate clearly.", score: 4 },
    { label: "Usually, though I still have rough patches.", score: 3 },
    { label: "Inconsistent; stress often drives my reactions.", score: 2 },
    { label: "Rarely; I often feel overwhelmed or reactive.", score: 1 },
  ]),
  likert("e2", "emotional", "Mental & Emotional Wellbeing", 1, "If you are struggling mentally right now, what is your support status?", [
    { label: "Proactively treated with stable routines and support.", score: 4 },
    { label: "Aware and working on it, not fully consistent yet.", score: 3 },
    { label: "Partly acknowledged, limited active support.", score: 2 },
    { label: "Largely unaddressed right now.", score: 1 },
  ]),
  likert("e3", "emotional", "Mental & Emotional Wellbeing", 1, "How comfortable are you with repair after conflict?", [
    { label: "Very comfortable; repair is a regular practice.", score: 4 },
    { label: "I can do it, though sometimes delayed.", score: 3 },
    { label: "Difficult; I often stay defensive.", score: 2 },
    { label: "Very hard; conflict tends to stay unresolved.", score: 1 },
  ]),
  likert("e4", "emotional", "Mental & Emotional Wellbeing", 1, "How much emotional bandwidth do you have for another dependent person?", [
    { label: "Strong bandwidth with realistic routines in place.", score: 4 },
    { label: "Moderate bandwidth; would need adjustments.", score: 3 },
    { label: "Low bandwidth; frequent depletion already.", score: 2 },
    { label: "Minimal bandwidth; stretched beyond capacity.", score: 1 },
  ]),

  interstitial(
    "relationship",
    "Relationship Stability",
    2,
    "A child does not arrive into one person — they arrive into a relational field.",
  ),
  likert("r1", "relationship", "Relationship Stability", 2, "How aligned are you and your partner on parenting values and discipline?", [
    { label: "Strongly aligned with regular explicit conversations.", score: 4 },
    { label: "Mostly aligned with a few unresolved areas.", score: 3 },
    { label: "Some major differences still open.", score: 2 },
    { label: "Largely unaligned or unclear.", score: 1 },
  ]),
  likert("r2", "relationship", "Relationship Stability", 2, "How do you typically handle recurring conflict?", [
    { label: "Constructive resolution with follow-through.", score: 4 },
    { label: "Usually resolve, though sometimes slowly.", score: 3 },
    { label: "Often cycle through the same unresolved fights.", score: 2 },
    { label: "Frequent escalation, avoidance, or shutdown.", score: 1 },
  ]),
  likert("r3", "relationship", "Relationship Stability", 2, "If conception or postpartum becomes difficult, how resilient is your partnership?", [
    { label: "We have plans and healthy coping practices.", score: 4 },
    { label: "Likely resilient but with stress risk.", score: 3 },
    { label: "Could strain us significantly.", score: 2 },
    { label: "Very high risk to relationship stability.", score: 1 },
  ]),
  likert("r4", "relationship", "Relationship Stability", 2, "How safe is emotional honesty in your relationship today?", [
    { label: "Very safe; vulnerable conversations happen regularly.", score: 4 },
    { label: "Mostly safe, with occasional defensiveness.", score: 3 },
    { label: "Mixed; many topics feel risky.", score: 2 },
    { label: "Low safety; honesty often leads to conflict.", score: 1 },
  ]),

  interstitial(
    "health",
    "Physical Health & Medical Readiness",
    3,
    "Your body and medical preparation are part of the child's first environment.",
  ),
  likert("h1", "health", "Physical Health & Medical Readiness", 3, "How current are your preconception health checks?", [
    { label: "Current and reviewed with professionals.", score: 4 },
    { label: "Mostly up to date; one or two pending.", score: 3 },
    { label: "Partly done; major gaps remain.", score: 2 },
    { label: "Not started yet.", score: 1 },
  ]),
  likert("h2", "health", "Physical Health & Medical Readiness", 3, "How prepared are you for pregnancy and postpartum medical realities?", [
    { label: "Well-informed with clear care pathways.", score: 4 },
    { label: "Moderately informed with some uncertainties.", score: 3 },
    { label: "Basic awareness only.", score: 2 },
    { label: "Little practical understanding yet.", score: 1 },
  ]),
  likert("h3", "health", "Physical Health & Medical Readiness", 3, "How strong are sleep, nutrition, and physical routines?", [
    { label: "Strong and consistent for both partners.", score: 4 },
    { label: "Mostly stable with occasional disruptions.", score: 3 },
    { label: "Inconsistent and frequently stressed.", score: 2 },
    { label: "Poor baseline routines currently.", score: 1 },
  ]),
  scenario(
    "h4",
    "health",
    "Physical Health & Medical Readiness",
    3,
    "Your child needs significant long-term medical or educational support. What is your honest reaction?",
    [
      {
        label:
          "I have faced this and arrived at genuine acceptance. My love is not conditional on who my child turns out to be.",
        score: 4,
      },
      {
        label:
          "I would grieve — I will not pretend otherwise — but I believe I would come to acceptance and fight for them completely.",
        score: 3,
      },
      {
        label:
          "I am honestly scared. I know the right thing to feel, but I am not certain I have faced what it would demand.",
        score: 2,
      },
      {
        label:
          "I have avoided this seriously. I assume my child will be healthy and typical.",
        score: 1,
      },
    ],
  ),

  interstitial(
    "financial",
    "Financial Foundations",
    4,
    "Money does not buy readiness — but financial shock breaks it.",
  ),
  likert("f1", "financial", "Financial Foundations", 4, "How stable is household cash flow over the next 12 months?", [
    { label: "Stable with clear buffers and planning.", score: 4 },
    { label: "Mostly stable; manageable variability.", score: 3 },
    { label: "Unstable in ways that need work.", score: 2 },
    { label: "Highly uncertain or frequently negative.", score: 1 },
  ]),
  likert("f2", "financial", "Financial Foundations", 4, "How many months of essential expenses can you cover from savings?", [
    { label: "6+ months", score: 4 },
    { label: "3–5 months", score: 3 },
    { label: "1–2 months", score: 2 },
    { label: "Less than 1 month", score: 1 },
  ]),
  {
    kind: "question",
    id: "f3",
    type: "multiselect",
    domainId: "financial",
    domainName: "Financial Foundations",
    domainNumber: 4,
    prompt: "Which of these costs have you realistically planned for?",
    subtext: "Select everything that applies.",
    options: [
      { label: "Prenatal and delivery costs", weight: 0 },
      { label: "Childcare in year one", weight: 1 },
      { label: "Emergency fund for family", weight: 0 },
      { label: "Insurance gaps or parental leave income drop", weight: 2 },
      { label: "None of these are priced yet", weight: 3 },
    ],
  },
  likert("f4", "financial", "Financial Foundations", 4, "How manageable are current debt obligations relative to income?", [
    { label: "Comfortably manageable with clear strategy.", score: 4 },
    { label: "Manageable but needs tighter discipline.", score: 3 },
    { label: "Stressful and constraining choices.", score: 2 },
    { label: "Overwhelming right now.", score: 1 },
  ]),

  interstitial(
    "practical",
    "Practical & Lifestyle Readiness",
    5,
    "Daily life is where parenting actually happens.",
  ),
  likert("p1", "practical", "Practical & Lifestyle Readiness", 5, "How realistic is your childcare plan for the first two years?", [
    { label: "Concrete plan with backups.", score: 4 },
    { label: "Primary plan defined; backup pending.", score: 3 },
    { label: "Only rough ideas currently.", score: 2 },
    { label: "No practical childcare plan yet.", score: 1 },
  ]),
  likert("p2", "practical", "Practical & Lifestyle Readiness", 5, "How prepared is your home for a baby or toddler?", [
    { label: "Mostly ready with safety and space considered.", score: 4 },
    { label: "Some modifications needed but feasible.", score: 3 },
    { label: "Major adjustments still required.", score: 2 },
    { label: "Current setup is not workable yet.", score: 1 },
  ]),
  likert("p3", "practical", "Practical & Lifestyle Readiness", 5, "How ready are you to trade personal freedom for caregiving routines?", [
    { label: "Ready and already practicing lifestyle shifts.", score: 4 },
    { label: "Ready in principle; adapting gradually.", score: 3 },
    { label: "Partly ready, with significant resistance.", score: 2 },
    { label: "Not ready for this shift right now.", score: 1 },
  ]),
  likert("p4", "practical", "Practical & Lifestyle Readiness", 5, "How clear is your division of labor for nights, chores, and caregiving?", [
    { label: "Clear, explicit, and mutually agreed.", score: 4 },
    { label: "Mostly clear but not stress-tested.", score: 3 },
    { label: "Some expectations mismatch remains.", score: 2 },
    { label: "No clear division discussed.", score: 1 },
  ]),

  interstitial(
    "support",
    "Support System & Community",
    6,
    "No one parents well in isolation for long.",
  ),
  likert("s1", "support", "Support System & Community", 6, "How reliable is your practical support network?", [
    { label: "Reliable and available in real terms.", score: 4 },
    { label: "Some reliable support, limited capacity.", score: 3 },
    { label: "Uncertain or irregular support.", score: 2 },
    { label: "Very limited support network.", score: 1 },
  ]),
  likert("s2", "support", "Support System & Community", 6, "How likely are you to ask for help before burnout?", [
    { label: "Very likely; asking early is normal for me.", score: 4 },
    { label: "Likely, though sometimes delayed.", score: 3 },
    { label: "Unlikely unless things become severe.", score: 2 },
    { label: "I usually avoid asking for help.", score: 1 },
  ]),
  likert("s3", "support", "Support System & Community", 6, "How connected are you to experienced parents or mentors you trust?", [
    { label: "Strong mentor network already in place.", score: 4 },
    { label: "Some trusted people available.", score: 3 },
    { label: "Limited trusted guidance currently.", score: 2 },
    { label: "No trusted guidance network yet.", score: 1 },
  ]),
  likert("s4", "support", "Support System & Community", 6, "If one parent is unavailable, how resilient is your backup plan?", [
    { label: "Strong backup with clear contingencies.", score: 4 },
    { label: "Moderate backup; challenging but manageable.", score: 3 },
    { label: "Weak backup; high disruption likely.", score: 2 },
    { label: "No meaningful backup plan.", score: 1 },
  ]),

  interstitial(
    "values",
    "Values, Beliefs & Openness",
    7,
    "The child you raise may not be the child you imagined. These questions test readiness for who they might actually become.",
  ),
  scenario(
    "v1",
    "values",
    "Values, Beliefs & Openness",
    7,
    "Your child might be gay, bisexual, trans, or non-binary. What is your honest picture of how you would respond?",
    [
      {
        label:
          "I would be fully affirming from the beginning. Whatever they are, whoever they love — our home would be unconditionally safe.",
        score: 4,
      },
      {
        label:
          "It would challenge me personally, but I believe I would find acceptance because my child's wellbeing matters more than my discomfort.",
        score: 3,
      },
      {
        label:
          "I would love my child, but I would be honest about my beliefs and hope we could coexist in our difference.",
        score: 2,
      },
      {
        label:
          "I have not been fully honest with myself about this, or it would genuinely put me in conflict I am unsure I could handle.",
        score: 1,
      },
    ],
    "This is not about what you believe is morally right. It is about what your child would experience.",
  ),
  scenario(
    "v2",
    "values",
    "Values, Beliefs & Openness",
    7,
    "Your adult child wants to marry someone from a significantly different religion or culture. How do you respond?",
    [
      {
        label:
          "I would want to know who this person is as a human being. Character and how they treat my child matter most.",
        score: 4,
      },
      {
        label:
          "I would have genuine concerns about compatibility, but if my child wants this, I would ultimately support them.",
        score: 3,
      },
      {
        label:
          "It would depend on the religion or culture. Some differences I could accept; others would create real conflict.",
        score: 2,
      },
      {
        label:
          "My faith or tradition is central. I might not be able to give my full blessing.",
        score: 1,
      },
    ],
  ),
  likert(
    "v3",
    "values",
    "Values, Beliefs & Openness",
    7,
    "At 17, your child rejects your faith or believes something entirely different. What actually happens?",
    [
      {
        label:
          "I would be sad, but their spiritual journey belongs to them. Faith would not be a condition of love.",
        score: 4,
      },
      {
        label:
          "I would keep conversation open, share what faith means to me, and accept their right to their own beliefs.",
        score: 3,
      },
      {
        label:
          "I would feel I had failed and would keep trying to bring them back.",
        score: 2,
      },
      {
        label:
          "Passing on faith is my responsibility. Rejection would be a serious conflict.",
        score: 1,
      },
    ],
  ),
  likert(
    "v4",
    "values",
    "Values, Beliefs & Openness",
    7,
    "If at 30 your child chose no contact with you, what would that tell you?",
    [
      {
        label:
          "Something serious happened — my first response would be to understand what I did or failed to do.",
        score: 4,
      },
      {
        label:
          "Something went wrong — I would take responsibility where I contributed, knowing both played a part.",
        score: 3,
      },
      {
        label:
          "My child made a choice I would disagree with and I would feel wronged.",
        score: 2,
      },
      {
        label:
          "If I were a good parent, they would not do this — they would be unreasonable.",
        score: 1,
      },
    ],
    "Deliberately uncomfortable. Designed to surface accountability.",
  ),

  interstitial(
    "childhood",
    "Childhood Patterns & Motivation",
    8,
    "Before you parent, you were parented. This domain is about what you are carrying.",
  ),
  {
    kind: "explainer",
    id: "ace-explainer",
    title: "A brief note on what follows",
    body: `The ACE Study — one of the largest investigations of childhood experience and health outcomes — found that adults with 4+ adverse childhood experiences are:

· 12× more likely to attempt suicide
· 7× more likely to develop alcohol dependency
· 20 years shorter life expectancy on average

The 10 ACEs include physical, emotional, and sexual abuse; neglect; witnessing domestic violence; substance abuse, mental illness, or incarceration in the household; and parental separation.

This question is not a clinical screening. It is an invitation to know yourself.`,
  },
  likert("c1", "childhood", "Childhood Patterns & Motivation", 8, "Roughly where does your childhood fall on the ACE spectrum?", [
    { label: "0–1 ACEs: largely stable and free of these experiences", score: 4 },
    { label: "2–3 ACEs: some difficult things, mostly worked through", score: 3 },
    { label: "4–6 ACEs: significant adversities with lasting effects I am aware of", score: 2 },
    { label: "7+ ACEs: genuinely traumatic; still working through or not fully addressed", score: 1 },
  ]),
  scenario(
    "c2",
    "childhood",
    "Childhood Patterns & Motivation",
    8,
    "When you imagine the parent you want to be — how much is modelled on your own parents?",
    [
      {
        label:
          "Mostly modelled — my parents did a genuinely good job and I hope to pass that on with intentional updates.",
        score: 4,
      },
      {
        label:
          "A mix — things I want to repeat and things I have consciously decided to do differently.",
        score: 3,
      },
      {
        label:
          "Largely a departure — I have done real work to build something different.",
        score: 3,
      },
      {
        label:
          "I am not entirely sure. I have not sat with this closely enough.",
        score: 1,
      },
    ],
  ),
  likert(
    "c3",
    "childhood",
    "Childhood Patterns & Motivation",
    8,
    "Do you see the harmful pattern from your upbringing showing up in yourself today?",
    [
      {
        label: "I have identified it and done real work to interrupt it.",
        score: 4,
      },
      { label: "I can see it sometimes; work is incomplete.", score: 3 },
      { label: "I am not sure I have looked closely enough.", score: 2 },
      {
        label:
          "I do not think this applies — good childhood or I do not see problematic patterns.",
        score: 2,
      },
    ],
  ),
  {
    kind: "question",
    id: "c4",
    type: "spectrum",
    domainId: "childhood",
    domainName: "Childhood Patterns & Motivation",
    domainNumber: 8,
    prompt:
      "Where does your motivation to have a child actually sit?",
    subtext:
      "Some want children to shepherd a new person; others to fill a gap. Honesty matters here.",
    leftLabel: "Primarily for me — what a child will give or fill in my life",
    rightLabel:
      "Primarily for them — excitement about who they will become, independent of me",
    flagBelow: 40,
  },

  {
    kind: "question",
    id: "ref1",
    type: "reflection",
    domainId: "childhood",
    domainName: "Reflection",
    domainNumber: 8,
    prompt:
      "In your own words — why do you want to have a child? Not the expected answer. Yours.",
    placeholder: "Write honestly. This is not scored.",
  },
  {
    kind: "question",
    id: "ref2",
    type: "reflection",
    domainId: "childhood",
    domainName: "Reflection",
    domainNumber: 8,
    prompt:
      "What kind of parent did you have? What kind do you want to be? What is the distance between those two?",
    placeholder: "Write honestly. This is not scored.",
  },
];

export const CONCEIVING_ASSESSMENT: AssessmentConfig = {
  id: "conceiving",
  title: "Questions Before Conceiving",
  storageKey: "mirror-conceiving",
  totalDomains: TOTAL,
  steps,
  profiles: [
    {
      id: "builder",
      name: "The Builder",
      oneLiner: "Strong foundation — most of the work is sequencing.",
      guidance:
        "You have done substantial preparation across domains. The next phase is not more anxiety — it is choosing timing and building the support structures that let you show up consistently.",
    },
    {
      id: "examined",
      name: "The Examined",
      oneLiner: "The hard inner work is already underway.",
      guidance:
        "Your awareness of your own inheritance is a protective factor. Keep that work active as you move forward — it is one of the most direct investments you can make in your future child.",
    },
    {
      id: "almost",
      name: "The Almost",
      oneLiner: "Real readiness with one or two specific gaps.",
      guidance:
        "You are closer than you might feel. Focus on the domains flagged below — not everything at once. One deliberate next step in the next 90 days can shift the picture meaningfully.",
    },
    {
      id: "unfinished",
      name: "The Unfinished",
      oneLiner: "A starting point, not a verdict.",
      guidance:
        "Several domains suggest preparation work remains. That is information, not condemnation. Use the growth areas below as a practical roadmap rather than a reason to rush or to retreat.",
    },
    {
      id: "avoider",
      name: "The Rushed Mirror",
      oneLiner: "High variance — worth slowing down.",
      guidance:
        "Your answers suggest uneven reflection or motivation tension. Before timing decisions, consider a therapist or trusted counsellor to examine what you are hoping a child will solve or prove.",
    },
  ],
  research: [
    {
      domainId: "emotional",
      title: "Why mental wellbeing matters",
      paragraphs: [
        "A parent's own mental health is among the strongest predictors of a child's emotional climate — not because illness is contagious, but because regulation, repair, and consistency depend on a reasonably stable internal state.",
        "Unmanaged anxiety or depression during pregnancy and postpartum is associated with specific developmental outcomes. This is addressable with proactive work.",
      ],
      action:
        "Find a therapist with perinatal experience before conception — not because something is wrong, but because the investment pays forward for decades.",
    },
    {
      domainId: "relationship",
      title: "Why relationship stability matters",
      paragraphs: [
        "Children do not experience parenting in isolation — they experience the relational field between caregivers. Chronic unresolved conflict becomes part of their nervous system's template.",
        "Alignment on values, repair after rupture, and shared load-bearing are learnable — but they require conversation before crisis.",
      ],
      action:
        "Schedule three explicit conversations with your partner: discipline, division of labor, and what happens if conception is harder than expected.",
    },
    {
      domainId: "values",
      title: "Why values openness matters",
      paragraphs: [
        "LGBTQ+ youth in highly rejecting families face dramatically worse mental health outcomes. Family acceptance is among the strongest protective factors.",
        "Your child will become their own person. Readiness here is not moral performance — it is capacity for unconditional relationship when beliefs diverge.",
      ],
      action:
        "Read one resource from the Family Acceptance Project and discuss with your partner what 'affirming' would look like in practice in your home.",
    },
    {
      domainId: "childhood",
      title: "Why childhood inheritance matters",
      paragraphs: [
        "Adverse childhood experiences shape stress response, attachment, and parenting reflexes — often without conscious awareness. Awareness plus therapeutic work are the protective factors.",
        "Motivation audits matter: children asked to fill adult emotional gaps carry a burden that was never theirs.",
      ],
      action:
        "If your motivation slider sat low, book one session with a therapist to name the unmet need before you name a due date.",
    },
  ],
};
