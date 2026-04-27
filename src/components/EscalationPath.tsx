const ESCALATION_STEPS = [
  {
    step: 1,
    title: "File complaint with the department directly",
    detail:
      "Use the complaint link on each card above. Note the complaint/reference number.",
  },
  {
    step: 2,
    title: "Escalate to Zonal Commissioner or Department Head",
    detail:
      "If unresolved in 7 days, call or email the department head directly.",
  },
  {
    step: 3,
    title: "Write to your MLA or MP",
    detail:
      "Elected representatives can flag issues with departments. Use contact info above.",
  },
  {
    step: 4,
    title: "File on Karnataka IPGRS (State Grievance Portal)",
    link: { label: "ipgrs.karnataka.gov.in", url: "https://ipgrs.karnataka.gov.in" },
    detail: "For state-level issues in Karnataka.",
  },
  {
    step: 5,
    title: "File on CPGRAMS (Central Grievance Portal)",
    link: { label: "pgportal.gov.in", url: "https://pgportal.gov.in" },
    detail: "For central government departments (Railways, Postal, Passport, etc.)",
  },
  {
    step: 6,
    title: "File an RTI",
    link: { label: "rtionline.gov.in", url: "https://rtionline.gov.in" },
    detail:
      "If you suspect negligence, file a Right to Information request to get official records.",
  },
];

export default function EscalationPath() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <h3 className="mb-4 font-semibold text-amber-900">
        🔺 How to Escalate If Unresolved
      </h3>
      <ol className="space-y-3">
        {ESCALATION_STEPS.map((s) => (
          <li key={s.step} className="flex gap-3 text-sm">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
              {s.step}
            </span>
            <div>
              <p className="font-medium text-amber-900">{s.title}</p>
              <p className="mt-0.5 text-xs text-amber-700">{s.detail}</p>
              {s.link && (
                <a
                  href={s.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  -&gt; {s.link.label}
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
