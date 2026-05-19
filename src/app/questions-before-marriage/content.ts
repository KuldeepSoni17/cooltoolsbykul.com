import { buildAssessment, DEFAULT_PROFILES } from "@/features/mirror-engine/buildAssessment";

export const MARRIAGE_ASSESSMENT = buildAssessment({
  id: "marriage",
  title: "Questions Before Getting Married",
  storageKey: "mirror-marriage",
  accent: "#b07b6c",
  domains: [
    {
      id: "values",
      name: "Values & Worldview",
      framing: "What you build a life on must be nameable before you sign it.",
      questions: [
        {
          prompt: "How aligned are you on what a good life looks like in 20 years?",
          options: [
            "We have talked about it explicitly and agree on the shape.",
            "Mostly aligned with a few open questions.",
            "We assume alignment but have not tested it.",
            "We avoid this conversation or know we differ.",
          ],
        },
        {
          prompt: "How do you handle fundamental disagreements about morality or faith?",
          options: [
            "We respect difference without making love conditional.",
            "We debate but stay in relationship.",
            "One of us usually concedes to keep peace.",
            "These topics reliably damage us.",
          ],
        },
        {
          prompt: "How honest are you about deal-breakers you have not said aloud?",
          options: [
            "Fully spoken and mutually understood.",
            "Mostly spoken; one or two held back.",
            "Several important things unspoken.",
            "We have not had this conversation.",
          ],
        },
        {
          prompt: "How do you imagine making decisions when you disagree on something major?",
          options: [
            "A clear process we have used before.",
            "We would figure it out but have no process yet.",
            "Whoever feels stronger usually wins.",
            "We do not know and fear it.",
          ],
        },
      ],
    },
    {
      id: "money",
      name: "Money & Class",
      framing: "Money is never just money in a marriage.",
      questions: [
        {
          prompt: "How transparent are you about income, debt, and spending?",
          options: [
            "Fully transparent with shared visibility.",
            "Mostly transparent with minor private spending.",
            "Significant areas we do not discuss.",
            "Financial secrecy or avoidance.",
          ],
        },
        {
          prompt: "What is your default model for joint finances?",
          options: [
            "Agreed model we have operated under.",
            "Principle agreed; details to work out.",
            "Different assumptions we have not reconciled.",
            "We have not discussed it.",
          ],
        },
        {
          prompt: "How do you react when the other spends in a way you disagree with?",
          options: [
            "Curious conversation without contempt.",
            "Tension but repairable.",
            "Chronic resentment or control.",
            "Explosive or silent punishment.",
          ],
        },
        {
          prompt: "How aligned are you on financial risk (investing, career bets, family help)?",
          options: [
            "Clear shared risk tolerance.",
            "Mostly aligned.",
            "Meaningful difference we have not resolved.",
            "Opposite risk profiles, unspoken.",
          ],
        },
      ],
    },
    {
      id: "intimacy",
      name: "Sex & Intimacy",
      framing: "Intimacy problems do not disappear at the altar.",
      questions: [
        {
          prompt: "How satisfied are you with your physical intimacy today?",
          options: [
            "Satisfied and we can talk about change.",
            "Mostly satisfied with room to grow.",
            "Significant gap we have not resolved.",
            "Avoidance or distress around the topic.",
          ],
        },
        {
          prompt: "How safe is it to say no or ask for something different sexually?",
          options: [
            "Very safe both directions.",
            "Mostly safe.",
            "One of us struggles to speak up.",
            "Coercion, pressure, or shutdown.",
          ],
        },
        {
          prompt: "How do you handle desire differences over time?",
          options: [
            "We expect change and have a plan to communicate.",
            "We know it happens but have not planned.",
            "We would take it personally.",
            "We have not thought about it.",
          ],
        },
        {
          prompt: "How aligned are you on exclusivity, boundaries, and trust?",
          options: [
            "Explicit agreement we both uphold.",
            "Implicit agreement that mostly works.",
            "Gray areas that cause anxiety.",
            "Known breaches or fundamental mistrust.",
          ],
        },
      ],
    },
    {
      id: "family",
      name: "Family of Origin",
      framing: "You are also marrying each other's families — emotionally if not legally.",
      questions: [
        {
          prompt: "How will you handle holidays and family obligations?",
          options: [
            "Plan we have tested and adjusted.",
            "Principles agreed; details pending.",
            "Recurrent conflict already.",
            "We avoid the topic.",
          ],
        },
        {
          prompt: "How do in-laws or extended family affect your relationship?",
          options: [
            "Healthy boundaries both agree on.",
            "Manageable with occasional strain.",
            "One partner's family dominates.",
            "Active triangulation or hostility.",
          ],
        },
        {
          prompt: "What patterns from your upbringing do you see repeating?",
          options: [
            "Named and actively worked on.",
            "Aware but work incomplete.",
            "Unaware or in denial.",
            "We trigger each other's family wounds often.",
          ],
        },
        {
          prompt: "How aligned are you on children — whether, when, and how many?",
          options: [
            "Explicit agreement.",
            "Mostly aligned with timeline open.",
            "Meaningful disagreement.",
            "We have not discussed honestly.",
          ],
        },
      ],
    },
    {
      id: "conflict",
      name: "Conflict & Repair",
      framing: "Marriage is mostly repair.",
      questions: [
        {
          prompt: "After a fight, how do you typically reconnect?",
          options: [
            "Repair is reliable and mutual.",
            "Slow but we get there.",
            "Often unresolved.",
            "Stonewalling, contempt, or escalation.",
          ],
        },
        {
          prompt: "How do you handle criticism from each other?",
          options: [
            "Curiosity first; defensiveness rare.",
            "Defensive sometimes but recoverable.",
            "Chronic defensiveness or counter-attack.",
            "Contempt or shutdown.",
          ],
        },
        {
          prompt: "Have you seen each other under significant stress?",
          options: [
            "Yes — and we managed it reasonably.",
            "Some stress; mixed results.",
            "Little real stress tested yet.",
            "Stress reveals patterns that worry me.",
          ],
        },
        {
          prompt: "Would you seek couples therapy before marriage if stuck?",
          options: [
            "Yes — already have or would without shame.",
            "Probably yes if needed.",
            "Reluctant but possible.",
            "No — not something we would do.",
          ],
        },
      ],
    },
    {
      id: "future",
      name: "Future Architecture",
      framing: "Where you will live, work, and grow old together.",
      questions: [
        {
          prompt: "How aligned are you on where to live long-term?",
          options: [
            "Clear shared vision.",
            "Flexible with conversation.",
            "Different visions, unresolved.",
            "We have not discussed.",
          ],
        },
        {
          prompt: "How do career ambitions fit together?",
          options: [
            "We support each other's paths explicitly.",
            "Mostly supportive with trade-offs.",
            "One career dominates by default.",
            "Competition or resentment about work.",
          ],
        },
        {
          prompt: "What happens if one of you needs to relocate for work?",
          options: [
            "Principles agreed for negotiation.",
            "Would work it out case by case.",
            "Would expect the other to follow.",
            "We have not thought about it.",
          ],
        },
        {
          prompt: "If the marriage struggled, would you both fight for it?",
          options: [
            "Yes — with outside help if needed.",
            "Yes — though unsure how.",
            "One of us would; unsure about the other.",
            "I am not sure I would.",
          ],
        },
      ],
    },
  ],
  profiles: [
    ...DEFAULT_PROFILES,
    {
      id: "aligned",
      name: "The Aligned",
      oneLiner: "Strong agreement where it matters most.",
      guidance: "Focus on maintaining honest conversation as life adds complexity.",
    },
  ],
  research: [
    {
      domainId: "conflict",
      title: "Why conflict skills matter",
      paragraphs: [
        "Research on marriage longevity consistently points to how couples handle conflict and repair — not absence of conflict.",
      ],
      action: "Agree on one repair ritual before the wedding: time-out, return time, and reconnection words.",
    },
  ],
});
