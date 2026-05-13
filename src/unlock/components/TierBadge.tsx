import type { Tier } from '../types'

const TIER_META: Record<
  Tier,
  { label: string; dot: string; className: string }
> = {
  'quick-win': {
    label: 'Quick Win',
    dot: 'bg-accent-red',
    className: 'text-accent-red',
  },
  unlockable: {
    label: 'Unlockable',
    dot: 'bg-accent-yellow',
    className: 'text-accent-yellow',
  },
  'deep-dive': {
    label: 'Deep Dive',
    dot: 'bg-accent-teal',
    className: 'text-accent-teal',
  },
}

export function TierBadge({ tier }: { tier: Tier }) {
  const meta = TIER_META[tier]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-secondary px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${meta.className}`}
    >
      <span className={`size-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  )
}
