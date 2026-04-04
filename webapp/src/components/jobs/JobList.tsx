'use client'

import { Job } from '@/types'
import { JobCard } from './JobCard'

interface Props {
  jobs: Job[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function JobList({ jobs, selectedId, onSelect }: Props) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <p className="text-sm">No jobs in this category</p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto flex-1">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSelected={selectedId === job.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
