import { Platform } from '@/types'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const TAG_STYLES: Record<string, string> = {
  NO_LOGIN: 'bg-green-100 text-green-800 border-green-200',
  LOGIN_REQ: 'bg-amber-100 text-amber-800 border-amber-200',
  EU: 'bg-blue-100 text-blue-800 border-blue-200',
  REMOTE_FOCUS: 'bg-purple-100 text-purple-800 border-purple-200',
  BARCELONA: 'bg-rose-100 text-rose-800 border-rose-200',
  SPANISH: 'bg-orange-100 text-orange-800 border-orange-200',
  ENGLISH: 'bg-sky-100 text-sky-800 border-sky-200',
  GENERAL: 'bg-slate-100 text-slate-600 border-slate-200',
}

export function PlatformCard({ platform }: { platform: Platform }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <a
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
        >
          {platform.name}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        {platform.last_checked_at && (
          <span className="text-xs text-slate-400 whitespace-nowrap">
            Checked {new Date(platform.last_checked_at).toLocaleDateString()}
          </span>
        )}
      </div>
      {platform.notes && (
        <p className="text-xs text-slate-500">{platform.notes}</p>
      )}
      {platform.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {platform.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                'text-xs px-1.5 py-0.5 rounded border font-medium',
                TAG_STYLES[tag] ?? 'bg-slate-100 text-slate-600 border-slate-200'
              )}
            >
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
