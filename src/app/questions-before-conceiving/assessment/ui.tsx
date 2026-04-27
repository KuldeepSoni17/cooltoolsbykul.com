"use client";

import { useMemo, useState } from "react";

type Option = { label: string; score: number };
type DomainId =
  | "emotional"
  | "relationship"
  | "health"
  | "financial"
  | "practical"
  | "support"
  | "values"
  | "childhood";
type Question = {
  domainId: DomainId;
  domain: string;
  prompt: string;
  options: Option[];
};

const QUESTIONS: Question[] = [
  // Domain 1: Mental & Emotional Wellbeing
  {
    domainId: "emotional",
    domain: "Mental & Emotional Wellbeing",
    prompt:
      "How consistently are you able to regulate your emotions during high stress?",
    options: [
      { label: "Very consistently; I recover quickly and communicate clearly.", score: 4 },
      { label: "Usually, though I still have rough patches.", score: 3 },
      { label: "Inconsistent; stress often drives my reactions.", score: 2 },
      { label: "Rarely; I often feel overwhelmed or reactive.", score: 1 },
    ],
  },
  {
    domainId: "emotional",
    domain: "Mental & Emotional Wellbeing",
    prompt:
      "If you are currently struggling mentally, what is your support/treatment status?",
    options: [
      { label: "Proactively treated with stable routines and support.", score: 4 },
      { label: "Aware and working on it, but not fully consistent yet.", score: 3 },
      { label: "Partly acknowledged, limited active support.", score: 2 },
      { label: "Largely unaddressed right now.", score: 1 },
    ],
  },
  {
    domainId: "emotional",
    domain: "Mental & Emotional Wellbeing",
    prompt:
      "How comfortable are you with repair after conflict (saying sorry, reconnecting)?",
    options: [
      { label: "Very comfortable; repair is a regular practice.", score: 4 },
      { label: "I can do it, though sometimes delayed.", score: 3 },
      { label: "Difficult; I often stay defensive.", score: 2 },
      { label: "Very hard; conflict tends to stay unresolved.", score: 1 },
    ],
  },
  {
    domainId: "emotional",
    domain: "Mental & Emotional Wellbeing",
    prompt:
      "How much emotional bandwidth do you currently have for another dependent person?",
    options: [
      { label: "Strong bandwidth with realistic routines in place.", score: 4 },
      { label: "Moderate bandwidth; would need some adjustments.", score: 3 },
      { label: "Low bandwidth; frequent depletion already.", score: 2 },
      { label: "Minimal bandwidth; currently stretched beyond capacity.", score: 1 },
    ],
  },
  // Domain 2: Relationship Stability
  {
    domainId: "relationship",
    domain: "Relationship Stability",
    prompt:
      "How aligned are you and your partner on parenting values and discipline style?",
    options: [
      { label: "Strongly aligned with regular explicit conversations.", score: 4 },
      { label: "Mostly aligned with a few unresolved areas.", score: 3 },
      { label: "Some major differences still open.", score: 2 },
      { label: "Largely unaligned or unclear.", score: 1 },
    ],
  },
  {
    domainId: "relationship",
    domain: "Relationship Stability",
    prompt:
      "How do you two typically handle recurring conflict?",
    options: [
      { label: "Constructive resolution with follow-through.", score: 4 },
      { label: "Usually resolve, though sometimes slowly.", score: 3 },
      { label: "Often cycle through same unresolved fights.", score: 2 },
      { label: "Frequent escalation, avoidance, or shutdown.", score: 1 },
    ],
  },
  {
    domainId: "relationship",
    domain: "Relationship Stability",
    prompt:
      "If conception/fertility/postpartum becomes difficult, how resilient is your partnership?",
    options: [
      { label: "We have plans and healthy coping practices.", score: 4 },
      { label: "Likely resilient but with stress risk.", score: 3 },
      { label: "Could strain us significantly.", score: 2 },
      { label: "Very high risk to relationship stability.", score: 1 },
    ],
  },
  {
    domainId: "relationship",
    domain: "Relationship Stability",
    prompt:
      "How safe is emotional honesty in your relationship today?",
    options: [
      { label: "Very safe; vulnerable conversations happen regularly.", score: 4 },
      { label: "Mostly safe, with occasional defensiveness.", score: 3 },
      { label: "Mixed; many topics feel risky.", score: 2 },
      { label: "Low safety; honesty often leads to conflict.", score: 1 },
    ],
  },
  // Domain 3: Physical Health & Medical Readiness
  {
    domainId: "health",
    domain: "Physical Health & Medical Readiness",
    prompt:
      "How current are your preconception health checks and screenings?",
    options: [
      { label: "Current and reviewed with professionals.", score: 4 },
      { label: "Mostly up to date; one or two pending items.", score: 3 },
      { label: "Partly done; major gaps still open.", score: 2 },
      { label: "Not started yet.", score: 1 },
    ],
  },
  {
    domainId: "health",
    domain: "Physical Health & Medical Readiness",
    prompt:
      "How prepared are you for pregnancy and postpartum medical realities?",
    options: [
      { label: "Well-informed with clear care pathways.", score: 4 },
      { label: "Moderately informed with some uncertainties.", score: 3 },
      { label: "Basic awareness only.", score: 2 },
      { label: "Little to no practical understanding yet.", score: 1 },
    ],
  },
  {
    domainId: "health",
    domain: "Physical Health & Medical Readiness",
    prompt:
      "How strong are your sleep, nutrition, and physical routines right now?",
    options: [
      { label: "Strong and consistent for both partners.", score: 4 },
      { label: "Mostly stable with occasional disruptions.", score: 3 },
      { label: "Inconsistent and frequently stressed.", score: 2 },
      { label: "Poor baseline routines currently.", score: 1 },
    ],
  },
  {
    domainId: "health",
    domain: "Physical Health & Medical Readiness",
    prompt:
      "How prepared are you for the possibility of disability/chronic illness in your child?",
    options: [
      { label: "I have faced this and can adapt with support.", score: 4 },
      { label: "Emotionally hard, but I would step in fully.", score: 3 },
      { label: "I feel underprepared for this scenario.", score: 2 },
      { label: "I avoid this possibility entirely.", score: 1 },
    ],
  },
  // Domain 4: Financial Foundations
  {
    domainId: "financial",
    domain: "Financial Foundations",
    prompt:
      "How stable is your household cash flow over the next 12 months?",
    options: [
      { label: "Stable with clear buffers and planning.", score: 4 },
      { label: "Mostly stable; manageable variability.", score: 3 },
      { label: "Unstable in ways that need work.", score: 2 },
      { label: "Highly uncertain or frequently negative.", score: 1 },
    ],
  },
  {
    domainId: "financial",
    domain: "Financial Foundations",
    prompt:
      "How many months of essential expenses can you cover from savings?",
    options: [
      { label: "6+ months", score: 4 },
      { label: "3-5 months", score: 3 },
      { label: "1-2 months", score: 2 },
      { label: "Less than 1 month", score: 1 },
    ],
  },
  {
    domainId: "financial",
    domain: "Financial Foundations",
    prompt:
      "How ready are you for pregnancy, delivery, and early childcare costs?",
    options: [
      { label: "Detailed budget and funding plan already made.", score: 4 },
      { label: "Rough budget with some unknowns.", score: 3 },
      { label: "Only broad assumptions so far.", score: 2 },
      { label: "No concrete cost planning yet.", score: 1 },
    ],
  },
  {
    domainId: "financial",
    domain: "Financial Foundations",
    prompt:
      "How manageable are your current debt obligations relative to income?",
    options: [
      { label: "Comfortably manageable with clear repayment strategy.", score: 4 },
      { label: "Manageable but needs tighter discipline.", score: 3 },
      { label: "Stressful and constraining choices.", score: 2 },
      { label: "Overwhelming right now.", score: 1 },
    ],
  },
  // Domain 5: Practical & Lifestyle Readiness
  {
    domainId: "practical",
    domain: "Practical & Lifestyle Readiness",
    prompt:
      "How realistic is your plan for childcare in the first two years?",
    options: [
      { label: "Concrete plan with backups.", score: 4 },
      { label: "Primary plan defined, backup pending.", score: 3 },
      { label: "Only rough ideas currently.", score: 2 },
      { label: "No practical childcare plan yet.", score: 1 },
    ],
  },
  {
    domainId: "practical",
    domain: "Practical & Lifestyle Readiness",
    prompt:
      "How prepared is your current home setup for a baby/toddler?",
    options: [
      { label: "Mostly ready with safety and space considered.", score: 4 },
      { label: "Some modifications needed but feasible.", score: 3 },
      { label: "Major adjustments still required.", score: 2 },
      { label: "Current setup is not workable yet.", score: 1 },
    ],
  },
  {
    domainId: "practical",
    domain: "Practical & Lifestyle Readiness",
    prompt:
      "How ready are you to trade personal freedom/time for caregiving routines?",
    options: [
      { label: "Ready and already practicing lifestyle shifts.", score: 4 },
      { label: "Ready in principle; adapting gradually.", score: 3 },
      { label: "Partly ready, with significant resistance.", score: 2 },
      { label: "Not ready for this shift right now.", score: 1 },
    ],
  },
  {
    domainId: "practical",
    domain: "Practical & Lifestyle Readiness",
    prompt:
      "How clear is your division of labor for nights, chores, and caregiving?",
    options: [
      { label: "Clear, explicit, and mutually agreed.", score: 4 },
      { label: "Mostly clear but not stress-tested.", score: 3 },
      { label: "Some expectations mismatch remains.", score: 2 },
      { label: "No clear division discussed.", score: 1 },
    ],
  },
  // Domain 6: Support System
  {
    domainId: "support",
    domain: "Support System & Community",
    prompt:
      "How reliable is your practical support network (family/friends/community)?",
    options: [
      { label: "Reliable and available in real terms.", score: 4 },
      { label: "Some reliable support, but limited capacity.", score: 3 },
      { label: "Uncertain or irregular support.", score: 2 },
      { label: "Very limited support network.", score: 1 },
    ],
  },
  {
    domainId: "support",
    domain: "Support System & Community",
    prompt:
      "How likely are you to ask for help early instead of waiting for burnout?",
    options: [
      { label: "Very likely; asking early is normal for me.", score: 4 },
      { label: "Likely, though sometimes delayed.", score: 3 },
      { label: "Unlikely unless things become severe.", score: 2 },
      { label: "I usually avoid asking for help.", score: 1 },
    ],
  },
  {
    domainId: "support",
    domain: "Support System & Community",
    prompt:
      "How connected are you to parents/mentors with experience you trust?",
    options: [
      { label: "Strong mentor network already in place.", score: 4 },
      { label: "Some trusted people available.", score: 3 },
      { label: "Limited trusted guidance currently.", score: 2 },
      { label: "No trusted guidance network yet.", score: 1 },
    ],
  },
  {
    domainId: "support",
    domain: "Support System & Community",
    prompt:
      "If one parent is unavailable (travel/illness/work), how resilient is your backup plan?",
    options: [
      { label: "Strong backup with clear contingencies.", score: 4 },
      { label: "Moderate backup; would be challenging but manageable.", score: 3 },
      { label: "Weak backup; high disruption likely.", score: 2 },
      { label: "No meaningful backup plan.", score: 1 },
    ],
  },
  // Domain 7: Values, Beliefs & Openness
  {
    domainId: "values",
    domain: "Values, Beliefs & Openness",
    prompt:
      "If your child turns out to be LGBTQ+, how prepared are you to create an affirming home?",
    options: [
      { label: "Fully affirming and emotionally safe from day one.", score: 4 },
      { label: "It may challenge me, but I would get to acceptance.", score: 3 },
      { label: "I would love them, but beliefs would create friction.", score: 2 },
      { label: "I am not sure I could handle that conflict well.", score: 1 },
    ],
  },
  {
    domainId: "values",
    domain: "Values, Beliefs & Openness",
    prompt:
      "Your adult child chooses a partner from a very different faith/culture. What is your likely response?",
    options: [
      { label: "Character matters most; I support their choice.", score: 4 },
      { label: "I would discuss challenges, then support.", score: 3 },
      { label: "Some differences are acceptable, others are not.", score: 2 },
      { label: "I may not be able to give full blessing.", score: 1 },
    ],
  },
  {
    domainId: "values",
    domain: "Values, Beliefs & Openness",
    prompt:
      "At 17, your child rejects your religious beliefs. What happens in your relationship?",
    options: [
      { label: "Love remains unconditional; their path is theirs.", score: 4 },
      { label: "I keep dialogue open and accept their right to choose.", score: 3 },
      { label: "I would keep trying to bring them back.", score: 2 },
      { label: "I see passing faith as my responsibility.", score: 1 },
    ],
  },
  {
    domainId: "values",
    domain: "Values, Beliefs & Openness",
    prompt:
      "Your child develops values opposite to yours. How much can you separate disagreement from love?",
    options: [
      { label: "I can disagree deeply without making it relational.", score: 4 },
      { label: "Difficult, but manageable with effort.", score: 3 },
      { label: "I would push repeatedly and struggle to let go.", score: 2 },
      { label: "Major divergence would feel like parental failure.", score: 1 },
    ],
  },
  // Domain 8: Childhood Patterns & Motivation
  {
    domainId: "childhood",
    domain: "Childhood Patterns & Motivation",
    prompt:
      "How aware are you of your own childhood adversity and its current impact?",
    options: [
      { label: "Low adversity and well-understood background.", score: 4 },
      { label: "Some adversity and mostly processed.", score: 3 },
      { label: "Significant adversity with lasting active effects.", score: 2 },
      { label: "High trauma and not yet addressed enough.", score: 1 },
    ],
  },
  {
    domainId: "childhood",
    domain: "Childhood Patterns & Motivation",
    prompt:
      "How intentionally have you examined what to repeat or not repeat from your upbringing?",
    options: [
      { label: "Very intentional and reflective.", score: 4 },
      { label: "Some thought and conscious choices.", score: 3 },
      { label: "Only partly examined so far.", score: 2 },
      { label: "I have not really sat with this yet.", score: 1 },
    ],
  },
  {
    domainId: "childhood",
    domain: "Childhood Patterns & Motivation",
    prompt:
      "How strong is your emotional vocabulary and comfort naming emotions?",
    options: [
      { label: "Strong and practiced in real conversations.", score: 4 },
      { label: "Decent, but learned partly in adulthood.", score: 3 },
      { label: "Still difficult, though I am aware.", score: 2 },
      { label: "Very limited and mostly unaddressed.", score: 1 },
    ],
  },
  {
    domainId: "childhood",
    domain: "Childhood Patterns & Motivation",
    prompt: "Why do you want a child right now, at your core?",
    options: [
      { label: "Primarily to support their life and growth.", score: 4 },
      { label: "Mostly for them, partly for my own meaning.", score: 3 },
      { label: "Balanced, but with unresolved personal needs.", score: 2 },
      { label: "Mainly to fill a personal emotional gap.", score: 1 },
    ],
  },
];

function labelFromScore(percent: number) {
  if (percent >= 80) return "Strong";
  if (percent >= 65) return "Growing";
  if (percent >= 45) return "Developing";
  return "Needs attention";
}

export function AssessmentClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(QUESTIONS.length).fill(-1));
  const current = QUESTIONS[step];
  const progress = Math.round((step / QUESTIONS.length) * 100);
  const selected = answers[step];
  const isLast = step === QUESTIONS.length - 1;
  const allDone = answers.every((v) => v >= 0);

  const results = useMemo(() => {
    const byDomain = new Map<DomainId, { domain: string; total: number; max: number }>();
    QUESTIONS.forEach((q, idx) => {
      const picked = answers[idx];
      if (picked < 0) return;
      const score = q.options[picked].score;
      const existing = byDomain.get(q.domainId) ?? { domain: q.domain, total: 0, max: 0 };
      byDomain.set(q.domainId, {
        domain: q.domain,
        total: existing.total + score,
        max: existing.max + 4,
      });
    });
    return Array.from(byDomain.values())
      .map(({ domain, total, max }) => {
      const percent = Math.round((total / max) * 100);
      return { domain, percent, label: labelFromScore(percent) };
      })
      .sort((a, b) => b.percent - a.percent);
  }, [answers]);

  if (allDone && step >= QUESTIONS.length) {
    return (
      <section className="rounded-3xl border border-[#2a2a2a] bg-[#161616] p-8 sm:p-10">
        <h1 className="text-3xl sm:text-4xl">Your readiness profile</h1>
        <p className="mt-3 text-[#8a8680]">
          This is not a diagnosis. It is a mirror to guide deliberate preparation.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {results.map((r) => (
            <article key={r.domain} className="rounded-2xl border border-[#2a2a2a] bg-[#0e0e0e] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[#8a8680]">{r.domain}</p>
              <p className="mt-2 text-3xl text-[#f2f0eb]">{r.percent}%</p>
              <p className="mt-1 text-[#c8a97e]">{r.label}</p>
            </article>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setAnswers(Array(QUESTIONS.length).fill(-1));
            setStep(0);
          }}
          className="mt-8 rounded-full bg-[#c8a97e] px-6 py-3 text-sm font-semibold text-[#0e0e0e] transition-colors hover:bg-[#d4b896]"
        >
          Retake assessment
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[#2a2a2a] bg-[#161616] p-6 sm:p-8">
      <div className="mb-6 h-1.5 w-full rounded bg-[#2a2a2a]">
        <div
          className="h-1.5 rounded bg-[#c8a97e] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs uppercase tracking-[0.24em] text-[#c8a97e]">
        {current.domain} - Question {step + 1} of {QUESTIONS.length}
      </p>
      <h1 className="mt-4 text-2xl leading-tight sm:text-3xl">{current.prompt}</h1>

      <div className="mt-7 grid gap-3">
        {current.options.map((option, index) => {
          const active = selected === index;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                const next = [...answers];
                next[step] = index;
                setAnswers(next);
              }}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                active
                  ? "border-[#c8a97e] bg-[#3d3026] text-[#f2f0eb]"
                  : "border-[#2a2a2a] bg-[#0e0e0e] text-[#8a8680] hover:border-[#c8a97e]/60"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="text-sm text-[#8a8680] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep((s) => (isLast ? QUESTIONS.length : s + 1))}
          disabled={selected < 0}
          className="rounded-full bg-[#c8a97e] px-5 py-2.5 text-sm font-semibold text-[#0e0e0e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLast ? "See results" : "Continue ->"}
        </button>
      </div>
    </section>
  );
}
