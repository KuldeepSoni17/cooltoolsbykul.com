import type { AssetKey } from '../types'
import { ProfileChip } from './ProfileChip'

export function ChipGroup({
  title,
  keys,
  selected,
  onToggle,
}: {
  title: string
  keys: AssetKey[]
  selected: AssetKey[]
  onToggle: (key: AssetKey) => void
}) {
  return (
    <section className="space-y-3">
      <h3 className="font-display text-sm font-semibold tracking-wide text-text-primary">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {keys.map((k) => (
          <ProfileChip
            key={k}
            assetKey={k}
            selected={selected.includes(k)}
            onToggle={() => onToggle(k)}
          />
        ))}
      </div>
    </section>
  )
}
