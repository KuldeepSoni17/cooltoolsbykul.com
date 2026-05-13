import type { AssetKey } from '../types'
import { ASSET_LABELS } from '../data/chips'

export function ProfileChip({
  assetKey,
  selected,
  onToggle,
}: {
  assetKey: AssetKey
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
        selected
          ? 'border-accent-yellow bg-[var(--unlock-glow)] text-accent-yellow'
          : 'border-border bg-bg-card text-text-secondary hover:border-text-secondary hover:text-text-primary'
      }`}
    >
      {ASSET_LABELS[assetKey]}
    </button>
  )
}
