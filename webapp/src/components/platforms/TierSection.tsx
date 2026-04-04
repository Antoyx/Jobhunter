import { Platform, TIER_LABELS } from '@/types'
import { PlatformCard } from './PlatformCard'

interface Props {
  tier: 1 | 2 | 3
  platforms: Platform[]
}

export function TierSection({ tier, platforms }: Props) {
  if (platforms.length === 0) return null

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">
          Tier {tier}
        </span>
        <span className="text-sm font-medium text-slate-700">{TIER_LABELS[tier]}</span>
        <span className="text-xs text-slate-400">{platforms.length} sources</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {platforms.map((p) => (
          <PlatformCard key={p.id} platform={p} />
        ))}
      </div>
    </section>
  )
}
