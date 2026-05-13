import { useMemo, useState } from 'react'
import type { FeedCategoryFilter, FeedSort, FeedTierFilter, Opportunity } from '../types'
import { OPPORTUNITIES } from '../data/opportunities'
import { FilterBar } from '../components/FilterBar'
import { OpportunityCard } from '../components/OpportunityCard'
import { useProfileStore } from '../store/profileStore'

function timeRank(t: Opportunity['time_to_unlock']) {
  switch (t) {
    case '2min':
      return 1
    case '15min':
      return 2
    case '1hr':
      return 3
    default:
      return 4
  }
}

function matchesProfile(o: Opportunity, selected: string[]) {
  if (selected.length === 0) return true
  return o.requires.every((r) => selected.includes(r))
}

export function Feed() {
  const selected = useProfileStore((s) => s.selectedAssets)
  const [tier, setTier] = useState<FeedTierFilter>('all')
  const [category, setCategory] = useState<FeedCategoryFilter>('all')
  const [sort, setSort] = useState<FeedSort>('impact')

  const list = useMemo(() => {
    let rows = OPPORTUNITIES.filter((o) => matchesProfile(o, selected))
    if (tier !== 'all') rows = rows.filter((o) => o.tier === tier)
    if (category !== 'all') rows = rows.filter((o) => o.categories.includes(category))

    const sorted = [...rows]
    sorted.sort((a, b) => {
      if (sort === 'impact') return b.impact_score - a.impact_score
      if (sort === 'time') return timeRank(a.time_to_unlock) - timeRank(b.time_to_unlock)
      const ma = a.money_saved_monthly ?? 0
      const mb = b.money_saved_monthly ?? 0
      return mb - ma
    })
    return sorted
  }, [selected, tier, category, sort])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Your opportunity feed</h1>
        <p className="text-sm text-text-secondary">
          {selected.length === 0
            ? 'Showing the full catalog — select chips on the home page to personalize matches.'
            : 'Filtered to opportunities that fit everything you said you already have.'}
        </p>
      </header>

      <FilterBar
        tier={tier}
        category={category}
        sort={sort}
        onTier={setTier}
        onCategory={setCategory}
        onSort={setSort}
      />

      <div className="grid gap-5">
        {list.map((o) => (
          <OpportunityCard key={o.id} opportunity={o} />
        ))}
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-text-secondary">
          Nothing matches these filters with your current profile. Loosen a filter or add assets on
          the home page.
        </p>
      ) : null}
    </div>
  )
}
