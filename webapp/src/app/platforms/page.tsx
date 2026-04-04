import { createClient } from '@/lib/supabase/server'
import { Platform, TIER_LABELS } from '@/types'
import { TierSection } from '@/components/platforms/TierSection'
import { Globe } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PlatformsRoute() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .eq('is_active', true)
    .order('tier')
    .order('name')

  const platforms: Platform[] = error ? [] : (data as Platform[])

  const tier1 = platforms.filter((p) => p.tier === 1)
  const tier2 = platforms.filter((p) => p.tier === 2)
  const tier3 = platforms.filter((p) => p.tier === 3)

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-slate-400" />
            <h1 className="text-xl font-semibold text-slate-900">Job Platforms</h1>
          </div>
          <p className="text-sm text-slate-500">
            All sources monitored for job opportunities · {platforms.length} total
          </p>
        </div>

        {platforms.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No platforms added yet.</p>
            <p className="text-xs mt-1">Add them via the Supabase dashboard or ask Claude Code to populate them.</p>
          </div>
        ) : (
          <>
            <TierSection tier={1} platforms={tier1} />
            <TierSection tier={2} platforms={tier2} />
            <TierSection tier={3} platforms={tier3} />
          </>
        )}
      </div>
    </div>
  )
}
