import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, Check, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Opportunity } from '../types'
import { ASSET_LABELS } from '../data/chips'
import { useProfileStore } from '../store/profileStore'
import { ImpactBar } from './ImpactBar'
import { TierBadge } from './TierBadge'

function timeLabel(t: Opportunity['time_to_unlock']) {
  switch (t) {
    case '2min':
      return '~2 min'
    case '15min':
      return '~15 min'
    case '1hr':
      return '~1 hr'
    default:
      return 'Ongoing'
  }
}

export function OpportunityCard({ opportunity: o }: { opportunity: Opportunity }) {
  const saved = useProfileStore((s) => s.savedOpportunities.includes(o.id))
  const completed = useProfileStore((s) => s.completedOpportunities.includes(o.id))
  const toggleSave = useProfileStore((s) => s.toggleSave)
  const toggleComplete = useProfileStore((s) => s.toggleComplete)
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.article
      layout
      className="overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
    >
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {o.categories.slice(0, 2).map((c) => (
              <span
                key={c}
                className="rounded-full bg-bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide text-text-secondary"
              >
                {c}
              </span>
            ))}
          </div>
          <TierBadge tier={o.tier} />
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold leading-snug text-text-primary md:text-2xl">
            {o.title}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">{o.one_liner}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] text-text-secondary">
          <span className="text-text-primary/80">Requires:</span>
          {o.requires.map((r) => (
            <span key={r} className="rounded border border-border px-2 py-0.5 text-text-primary">
              {ASSET_LABELS[r]}
            </span>
          ))}
        </div>

        <ImpactBar score={o.impact_score} />

        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-text-secondary">
          <span>⏱ {timeLabel(o.time_to_unlock)} to unlock</span>
          {o.money_saved_monthly != null ? (
            <span className="text-accent-yellow">💰 ~${o.money_saved_monthly}/mo</span>
          ) : (
            <span>💡 Awareness win</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent-yellow px-4 py-2 text-xs font-semibold text-bg-primary min-[420px]:flex-none"
          >
            {expanded ? 'Hide steps' : 'Unlock it'}
            <ChevronDown
              className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
          <Link
            to={`/opportunity/${o.id}`}
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs text-text-primary hover:border-accent-teal hover:text-accent-teal"
          >
            Deep dive →
          </Link>
          <button
            type="button"
            onClick={() => toggleSave(o.id)}
            className={`inline-flex items-center justify-center gap-1 rounded-full border px-3 py-2 text-xs ${
              saved
                ? 'border-accent-teal text-accent-teal'
                : 'border-border text-text-secondary hover:text-text-primary'
            }`}
            aria-pressed={saved}
          >
            <Bookmark className="size-3.5" fill={saved ? 'currentColor' : 'none'} />
            Save
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-border bg-bg-secondary/40"
          >
            <div className="space-y-4 px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-yellow">
                  Why most people miss this
                </p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{o.why_missed}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-teal">
                  Steps
                </p>
                <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm text-text-primary">
                  {o.unlock_steps.map((step, i) => (
                    <li key={i} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <button
                type="button"
                onClick={() => toggleComplete(o.id)}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-medium ${
                  completed
                    ? 'border-accent-teal bg-[rgba(0,229,204,0.08)] text-accent-teal'
                    : 'border-border text-text-primary hover:border-accent-teal'
                }`}
              >
                <Check className="size-3.5" />
                {completed ? 'Marked done' : 'Mark as done ✓'}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  )
}