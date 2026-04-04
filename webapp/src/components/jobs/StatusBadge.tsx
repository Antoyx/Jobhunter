import { cn } from '@/lib/utils'
import { JobStatus, STATUS_LABELS } from '@/types'

const STATUS_STYLES: Record<JobStatus, string> = {
  needs_apply: 'bg-amber-100 text-amber-800 border-amber-200',
  applied: 'bg-blue-100 text-blue-800 border-blue-200',
  replied: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  interview: 'bg-orange-100 text-orange-800 border-orange-200',
  offer: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  skipped: 'bg-slate-100 text-slate-600 border-slate-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
}

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
