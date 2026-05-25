const ESCALATION_STEPS = [
  {
    step: 1,
    title: "File complaint with the department directly",
    detail:
      "Use the complaint link on each card above. Note the complaint or reference number.",
  },
  {
    step: 2,
    title: "Escalate to zonal commissioner or department head",
    detail:
      "If unresolved in about 7 days, call or email the department head directly.",
  },
  {
    step: 3,
    title: "Write to your MLA or MP",
    detail:
      "Elected representatives can flag issues with departments. Use the contact info above.",
  },
  {
    step: 4,
    title: "File on your state grievance portal",
    link: { label: "State IPGRS (example: Karnataka)", url: "https://ipgrs.karnataka.gov.in" },
    detail: "For state-level issues — search for your state's public grievance portal.",
  },
  {
    step: 5,
    title: "File on CPGRAMS (central grievance portal)",
    link: { label: "pgportal.gov.in", url: "https://pgportal.gov.in" },
    detail:
      "For central government departments (Railways, Postal, Passport, etc.).",
  },
  {
    step: 6,
    title: "File an RTI",
    link: { label: "rtionline.gov.in", url: "https://rtionline.gov.in" },
    detail:
      "If you suspect negligence, file a Right to Information request for official records.",
  },
];

export default function EscalationPath() {
  return (
    <section
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: "var(--wr-amber-bg)",
        borderColor: "var(--wr-amber-border)",
      }}
    >
      <h3
        className="mb-4 font-semibold"
        style={{ color: "var(--wr-amber-text)" }}
      >
        How to escalate if unresolved
      </h3>
      <ol className="space-y-3">
        {ESCALATION_STEPS.map((s) => (
          <li key={s.step} className="flex gap-3 text-sm">
            <span
              className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{
                backgroundColor: "var(--wr-amber-border)",
                color: "var(--wr-amber-text)",
              }}
            >
              {s.step}
            </span>
            <div>
              <p className="font-medium" style={{ color: "var(--wr-amber-text)" }}>
                {s.title}
              </p>
              <p className="mt-0.5 text-xs text-stone-700">{s.detail}</p>
              {s.link && (
                <a
                  href={s.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-block text-xs font-medium text-sky-700 hover:text-sky-800 hover:underline"
                >
                  {s.link.label} →
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
