import { Link, useParams } from 'react-router-dom'
import { getOpportunityById, OPPORTUNITIES } from '../data/opportunities'
import { ASSET_LABELS } from '../data/chips'
import { useProfileStore } from '../store/profileStore'
import { ImpactBar } from '../components/ImpactBar'
import { TierBadge } from '../components/TierBadge'

export function OpportunityDetail() {
  const { id } = useParams()
  const o = id ? getOpportunityById(id) : undefined
  const toggleSave = useProfileStore((s) => s.toggleSave)
  const toggleComplete = useProfileStore((s) => s.toggleComplete)
  const saved = useProfileStore((s) => (o ? s.savedOpportunities.includes(o.id) : false))
  const completed = useProfileStore((s) => (o ? s.completedOpportunities.includes(o.id) : false))

  if (!o) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="font-display text-2xl">Opportunity not found</h1>
        <Link to="/feed" className="text-accent-yellow underline">
          Back to feed
        </Link>
      </div>
    )
  }

  const related = OPPORTUNITIES.filter(
    (x) => x.hub === o.hub && x.id !== o.id,
  ).slice(0, 3)

  return (
    <article className="space-y-10">
      <header className="space-y-4 border-b border-border pb-8">
        <div className="flex flex-wrap gap-2">
          {o.categories.map((c) => (
            <span
              key={c}
              className="rounded-full bg-bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide text-text-secondary"
            >
              {c}
            </span>
          ))}
          <TierBadge tier={o.tier} />
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">{o.title}</h1>
        <p className="text-lg text-text-secondary">{o.one_liner}</p>
        <ImpactBar score={o.impact_score} />
        <div className="flex flex-wrap gap-2">
          {o.requires.map((r) => (
            <span key={r} className="rounded-full border border-border px-3 py-1 text-xs">
              {ASSET_LABELS[r]}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggleSave(o.id)}
            className={`rounded-full border px-4 py-2 text-xs ${
              saved ? 'border-accent-teal text-accent-teal' : 'border-border'
            }`}
          >
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => toggleComplete(o.id)}
            className={`rounded-full border px-4 py-2 text-xs ${
              completed ? 'border-accent-teal text-accent-teal' : 'border-border'
            }`}
          >
            {completed ? 'Done ✓' : 'Mark as done ✓'}
          </button>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl">What it is</h2>
        <p className="text-sm leading-relaxed text-text-secondary">{o.full_description}</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Why most people miss it</h2>
        <p className="text-sm leading-relaxed text-text-secondary">{o.why_missed}</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">How to unlock it</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-text-primary">
          {o.unlock_steps.map((step, i) => (
            <li key={i} className="leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-bg-card p-5 md:grid-cols-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-text-secondary">Impact</p>
          <p className="mt-1 text-2xl font-semibold">{o.impact_score}/10</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-text-secondary">Money</p>
          <p className="mt-1 text-2xl font-semibold">
            {o.money_saved_monthly != null ? `~$${o.money_saved_monthly}/mo` : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-text-secondary">Difficulty</p>
          <p className="mt-1 text-2xl font-semibold capitalize">{o.difficulty}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl">Related opportunities</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {related.map((r) => (
            <Link
              key={r.id}
              to={`/opportunity/${r.id}`}
              className="rounded-2xl border border-border bg-bg-secondary/50 p-4 hover:border-accent-teal"
            >
              <p className="font-display text-base font-semibold leading-snug">{r.title}</p>
              <p className="mt-2 text-xs text-text-secondary">{r.one_liner}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-2 text-xs text-text-secondary">
        <p>Verified {o.verified_date}</p>
        <ul className="space-y-1">
          {o.sources.map((s) => (
            <li key={s}>
              <a href={s} className="text-accent-teal underline" target="_blank" rel="noreferrer">
                {s}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
