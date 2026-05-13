import type { HubKey } from '../types'
import { opportunitiesForHub } from '../data/opportunities'

const HUB_COPY: Partial<Record<HubKey, { kicker: string }>> = {
  macbook: { kicker: 'macOS power you already paid for' },
  iphone: { kicker: 'iOS features hiding in plain sight' },
  student: { kicker: 'campus perks and edu bundles' },
}

export function HubHeader({
  hub,
  title,
}: {
  hub: HubKey
  title: string
}) {
  const count = opportunitiesForHub(hub).length
  const kicker = HUB_COPY[hub]?.kicker ?? 'curated unlocks'
  return (
    <header className="space-y-4 border-b border-border pb-8">
      <p className="text-xs uppercase tracking-[0.2em] text-accent-teal">{kicker}</p>
      <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
        {title}
      </h1>
      <p className="max-w-2xl text-sm text-text-secondary">
        {count} opportunit{count === 1 ? 'y' : 'ies'} in this hub — filtered from your wider catalog.
      </p>
    </header>
  )
}
