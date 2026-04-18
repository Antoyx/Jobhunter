'use client'

import { cn } from '@/lib/utils'
import { Job, JobStatus, STATUS_LABELS, STATUS_ORDER } from '@/types'

type FilterStatus = JobStatus | 'all'

const TAB_STYLES: Record<FilterStatus, string> = {
  all: 'text-slate-600 border-slate-300 hover:border-slate-400',
  prospect: 'text-purple-700 border-purple-300 hover:border-purple-500',
  needs_apply: 'text-amber-700 border-amber-300 hover:border-amber-500',
  ai_apply_failed: 'text-rose-700 border-rose-300 hover:border-rose-500',
  applied: 'text-blue-700 border-blue-300 hover:border-blue-500',
  replied: 'text-yellow-700 border-yellow-300 hover:border-yellow-500',
  interview: 'text-orange-700 border-orange-300 hover:border-orange-500',
  offer: 'text-green-700 border-green-300 hover:border-green-500',
  rejected: 'text-red-700 border-red-300 hover:border-red-500',
  closed: 'text-slate-500 border-slate-200 hover:border-slate-400',
}

const ACTIVE_TAB_STYLES: Record<FilterStatus, string> = {
  all: 'bg-slate-800 text-white border-slate-800',
  prospect: 'bg-purple-600 text-white border-purple-600',
  needs_apply: 'bg-amber-500 text-white border-amber-500',
  ai_apply_failed: 'bg-rose-500 text-white border-rose-500',
  applied: 'bg-blue-600 text-white border-blue-600',
  replied: 'bg-yellow-500 text-white border-yellow-500',
  interview: 'bg-orange-500 text-white border-orange-500',
  offer: 'bg-green-600 text-white border-green-600',
  rejected: 'bg-red-500 text-white border-red-500',
  closed: 'bg-slate-500 text-white border-slate-500',
}

interface Props {
  jobs: Job[]
  active: FilterStatus
  onChange: (status: FilterStatus) => void
}

export function StatusTabs({ jobs, active, onChange }: Props) {
  const counts = STATUS_ORDER.reduce<Record<string, number>>(
    (acc, s) => {
      acc[s] = jobs.filter((j) => j.status === s).length
      return acc
    },
    {}
  )
  const tabs: FilterStatus[] = ['prospect', 'needs_apply', 'ai_apply_failed', 'applied', 'replied', 'interview', 'offer', 'rejected', 'closed', 'all']

  return (
    <div className="flex flex-wrap gap-1.5 px-4 py-3 border-b border-slate-200 bg-white">
      {tabs.map((tab) => {
        const isActive = active === tab
        const count = tab === 'all' ? jobs.length : counts[tab] ?? 0
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-all',
              isActive ? ACTIVE_TAB_STYLES[tab] : TAB_STYLES[tab]
            )}
          >
            {tab === 'all' ? 'All' : STATUS_LABELS[tab]}
            <span
              className={cn(
                'inline-flex items-center justify-center rounded-full text-xs w-5 h-5',
                isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
