import type { FeedCategoryFilter, FeedSort, FeedTierFilter } from '../types'

const TIER_OPTIONS: { id: FeedTierFilter; label: string }[] = [
  { id: 'all', label: 'All tiers' },
  { id: 'quick-win', label: 'Quick Wins' },
  { id: 'unlockable', label: 'Unlockables' },
  { id: 'deep-dive', label: 'Deep Dives' },
]

const CAT_OPTIONS: { id: FeedCategoryFilter; label: string }[] = [
  { id: 'all', label: 'All categories' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'money', label: 'Money' },
  { id: 'health', label: 'Health' },
  { id: 'creative', label: 'Creative' },
  { id: 'learning', label: 'Learning' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'fun', label: 'Fun' },
]

const SORT_OPTIONS: { id: FeedSort; label: string }[] = [
  { id: 'impact', label: 'Impact' },
  { id: 'time', label: 'Time to unlock' },
  { id: 'money', label: 'Money saved' },
]

export function FilterBar({
  tier,
  category,
  sort,
  onTier,
  onCategory,
  onSort,
}: {
  tier: FeedTierFilter
  category: FeedCategoryFilter
  sort: FeedSort
  onTier: (t: FeedTierFilter) => void
  onCategory: (c: FeedCategoryFilter) => void
  onSort: (s: FeedSort) => void
}) {
  return (
    <div className="sticky top-0 z-20 space-y-3 border-b border-border bg-bg-primary/95 py-3 backdrop-blur-md">
      <div className="flex flex-wrap gap-2">
        {TIER_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onTier(o.id as FeedTierFilter)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium ${
              tier === o.id
                ? 'bg-accent-yellow text-bg-primary'
                : 'bg-bg-card text-text-secondary hover:text-text-primary'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {CAT_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onCategory(o.id as FeedCategoryFilter)}
            className={`rounded-full px-3 py-1 text-[11px] ${
              category === o.id
                ? 'border border-accent-teal text-accent-teal'
                : 'border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
        <span>Sort</span>
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onSort(o.id)}
            className={
              sort === o.id ? 'text-accent-yellow' : 'hover:text-text-primary'
            }
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
