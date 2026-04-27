"use client";

import { useMemo, useState } from "react";

type Option = { label: string; score: number };
type Question = {
  domain: "Values & Beliefs" | "Childhood & Inheritance";
  prompt: string;
  options: Option[];
};

const QUESTIONS: Question[] = [
  {
    domain: "Values & Beliefs",
    prompt:
      "If your child turns out to be LGBTQ+, how honestly prepared are you to create an affirming home?",
    options: [
      { label: "Fully affirming and emotionally safe from day one.", score: 4 },
      { label: "It may challenge me, but I would get to acceptance.", score: 3 },
      { label: "I would love them, but my beliefs would create friction.", score: 2 },
      { label: "I am not sure I could handle that conflict well.", score: 1 },
    ],
  },
  {
    domain: "Values & Beliefs",
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
    domain: "Values & Beliefs",
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
    domain: "Values & Beliefs",
    prompt:
      "Your child develops values opposite to yours. How much can you separate disagreement from love?",
    options: [
      { label: "I can disagree deeply without making it relational.", score: 4 },
      { label: "Difficult, but manageable with effort.", score: 3 },
      { label: "I would push repeatedly and struggle to let go.", score: 2 },
      { label: "Major divergence would feel like parental failure.", score: 1 },
    ],
  },
  {
    domain: "Values & Beliefs",
    prompt:
      "If your child needs significant long-term support (disability/chronic condition), what is your honest baseline?",
    options: [
      { label: "I have accepted that possibility and would adapt.", score: 4 },
      { label: "I would grieve, then commit fully.", score: 3 },
      { label: "I am scared and unsure I have faced this deeply.", score: 2 },
      { label: "I avoid thinking about this reality at all.", score: 1 },
    ],
  },
  {
    domain: "Values & Beliefs",
    prompt:
      "If your teen is diagnosed with serious mental illness, how engaged would you realistically be?",
    options: [
      { label: "Fully engaged: learn, advocate, and reprioritize life.", score: 4 },
      { label: "Committed, though initially out of depth.", score: 3 },
      { label: "I would try, but may struggle to sustain it.", score: 2 },
      { label: "This is an area I still stigmatize.", score: 1 },
    ],
  },
  {
    domain: "Childhood & Inheritance",
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
    domain: "Childhood & Inheritance",
    prompt:
      "How intentionally have you examined what to repeat or not repeat from your own upbringing?",
    options: [
      { label: "Very intentional and reflective.", score: 4 },
      { label: "Some thought and conscious choices.", score: 3 },
      { label: "Only partly examined so far.", score: 2 },
      { label: "I have not really sat with this yet.", score: 1 },
    ],
  },
  {
    domain: "Childhood & Inheritance",
    prompt:
      "Can you identify a harmful intergenerational pattern in yourself and actively interrupt it?",
    options: [
      { label: "Yes, clearly identified and worked on.", score: 4 },
      { label: "I notice it, but work is incomplete.", score: 3 },
      { label: "I am unsure what pattern I carry.", score: 2 },
      { label: "I do not think this applies to me.", score: 2 },
    ],
  },
  {
    domain: "Childhood & Inheritance",
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
    domain: "Childhood & Inheritance",
    prompt:
      "Why do you want a child right now, at your core?",
    options: [
      { label: "Primarily to support their life and growth.", score: 4 },
      { label: "Mostly for them, partly for my own meaning.", score: 3 },
      { label: "Balanced, but with unresolved personal needs.", score: 2 },
      { label: "Mainly to fill a personal emotional gap.", score: 1 },
    ],
  },
  {
    domain: "Childhood & Inheritance",
    prompt:
      "If your adult child later distances from you, what would your first stance be?",
    options: [
      { label: "Self-inquiry first: what did I miss?", score: 4 },
      { label: "Shared responsibility, with my part examined.", score: 3 },
      { label: "I would mostly feel wronged by their choice.", score: 2 },
      { label: "I would assume they are being unreasonable.", score: 1 },
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
    const byDomain = new Map<string, { total: number; max: number }>();
    QUESTIONS.forEach((q, idx) => {
      const picked = answers[idx];
      if (picked < 0) return;
      const score = q.options[picked].score;
      const existing = byDomain.get(q.domain) ?? { total: 0, max: 0 };
      byDomain.set(q.domain, { total: existing.total + score, max: existing.max + 4 });
    });
    return Array.from(byDomain.entries()).map(([domain, { total, max }]) => {
      const percent = Math.round((total / max) * 100);
      return { domain, percent, label: labelFromScore(percent) };
    });
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
