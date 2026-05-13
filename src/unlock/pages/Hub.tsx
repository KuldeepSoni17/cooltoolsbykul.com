import { Link, useParams } from 'react-router-dom'
import { HubHeader } from '../components/HubHeader'
import { OpportunityCard } from '../components/OpportunityCard'
import { MVP_HUBS, opportunitiesForHub } from '../data/opportunities'
import type { HubKey } from '../types'

const TITLES: Record<HubKey, string> = {
  macbook: 'MacBook',
  iphone: 'iPhone',
  spotify: 'Spotify',
  'amazon-prime': 'Amazon Prime',
  'credit-card': 'Credit Cards',
  student: 'Student',
  library: 'Library Card',
  microsoft365: 'Microsoft 365',
  google: 'Google',
}

export function Hub() {
  const { category } = useParams()
  const slug = category as HubKey | undefined
  const valid = slug && MVP_HUBS.some((h) => h.slug === slug)

  if (!slug || !valid) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="font-display text-2xl">Hub not available in MVP</h1>
        <p className="text-sm text-text-secondary">
          Try MacBook, iPhone, or Student — or return to the feed.
        </p>
        <Link to="/feed" className="text-accent-yellow underline">
          Go to feed
        </Link>
      </div>
    )
  }

  const items = opportunitiesForHub(slug)

  return (
    <div className="space-y-10">
      <HubHeader hub={slug} title={TITLES[slug]} />
      <div className="grid gap-5">
        {items.map((o) => (
          <OpportunityCard key={o.id} opportunity={o} />
        ))}
      </div>
    </div>
  )
}
