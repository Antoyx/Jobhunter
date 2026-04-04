'use client'

import { cn, formatSalary } from '@/lib/utils'
import { Job } from '@/types'
import { StatusBadge } from './StatusBadge'
import { MapPin } from 'lucide-react'

interface Props {
  job: Job
  isSelected: boolean
  onSelect: (id: string) => void
}

export function JobCard({ job, isSelected, onSelect }: Props) {
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency)

  return (
    <button
      onClick={() => onSelect(job.id)}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors',
        isSelected && 'bg-blue-50 border-l-2 border-l-blue-500'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 truncate">{job.company}</span>
            {salary && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                {salary}
              </span>
            )}
          </div>
          <div className="text-sm text-slate-600 mt-0.5 truncate">{job.title}</div>
          {job.location && (
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              {job.location}
            </div>
          )}
        </div>
        <div className="shrink-0">
          <StatusBadge status={job.status} />
        </div>
      </div>
    </button>
  )
}
