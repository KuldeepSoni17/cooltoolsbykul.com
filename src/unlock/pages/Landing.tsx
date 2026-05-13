import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CHIP_SECTIONS } from '../data/chips'
import { OPPORTUNITIES } from '../data/opportunities'
import { ChipGroup } from '../components/ChipGroup'
import { useProfileStore } from '../store/profileStore'

const teaser = OPPORTUNITIES.slice(0, 3)

export function Landing() {
  const selected = useProfileStore((s) => s.selectedAssets)
  const toggleAsset = useProfileStore((s) => s.toggleAsset)

  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs uppercase tracking-[0.25em] text-accent-teal"
        >
          Missed opportunity discovery
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl"
        >
          You already have more than you think.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl text-base text-text-secondary md:text-lg"
        >
          Unlock surfaces the features, benefits, and tools you are already paying for — but never
          knew existed. Tap what you own; we will show what you are leaving on the table.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 rounded-full bg-accent-yellow px-6 py-3 text-sm font-semibold text-bg-primary"
          >
            Show my opportunities →
          </Link>
        </motion.div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-text-primary">A few things hiding in plain sight</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {teaser.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-bg-card p-4"
            >
              <p className="text-[10px] uppercase tracking-wide text-text-secondary">
                {o.categories[0]}
              </p>
              <p className="mt-2 font-display text-lg font-semibold leading-snug">{o.title}</p>
              <p className="mt-2 text-xs text-text-secondary">{o.one_liner}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-8 rounded-3xl border border-border bg-bg-secondary/40 p-6 md:p-10">
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold">Build your profile</h2>
          <p className="text-sm text-text-secondary">
            Chip-select what you already have — no account, no typing required.
          </p>
        </div>
        <div className="space-y-8">
          {CHIP_SECTIONS.map((section) => (
            <ChipGroup
              key={section.title}
              title={section.title}
              keys={section.keys}
              selected={selected}
              onToggle={toggleAsset}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 rounded-full bg-accent-yellow px-6 py-3 text-sm font-semibold text-bg-primary"
          >
            Show my opportunities →
          </Link>
          {selected.length > 0 ? (
            <p className="self-center text-xs text-text-secondary">
              {selected.length} assets selected — feed will prioritize matches.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
