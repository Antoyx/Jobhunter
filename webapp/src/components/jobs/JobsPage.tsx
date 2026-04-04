'use client'

import { useState } from 'react'
import { Job, JobStatus } from '@/types'
import { StatusTabs } from './StatusTabs'
import { JobList } from './JobList'
import { JobDetail } from './JobDetail'
import { AddJobModal } from './AddJobModal'
import { Plus } from 'lucide-react'

type FilterStatus = JobStatus | 'all'

interface Props {
  initialJobs: Job[]
}

export function JobsPage({ initialJobs }: Props) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [activeStatus, setActiveStatus] = useState<FilterStatus>('needs_apply')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const filtered =
    activeStatus === 'all' ? jobs : jobs.filter((j) => j.status === activeStatus)

  const selectedJob = selectedId ? jobs.find((j) => j.id === selectedId) ?? null : null

  function handleUpdate(updated: Job) {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)))
  }

  function handleDelete(id: string) {
    setJobs((prev) => prev.filter((j) => j.id !== id))
    setSelectedId(null)
  }

  function handleCreated(job: Job) {
    setJobs((prev) => [job, ...prev])
    setSelectedId(job.id)
    setActiveStatus('needs_apply')
    setShowAdd(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Status tabs */}
      <StatusTabs jobs={jobs} active={activeStatus} onChange={setActiveStatus} />

      {/* Counts bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
        <span className="text-xs text-slate-500">
          {filtered.length} {filtered.length === 1 ? 'job' : 'jobs'}
          {activeStatus !== 'all' ? ` · ${filtered.filter(j => j.status === 'needs_apply' || j.status === 'applied').length} active` : ''}
        </span>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Job
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Job list */}
        <div
          className={`flex flex-col border-r border-slate-200 overflow-hidden transition-all ${
            selectedJob ? 'w-1/2' : 'w-full'
          }`}
        >
          <JobList
            jobs={filtered}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
          />
        </div>

        {/* Job detail panel */}
        {selectedJob && (
          <div className="w-1/2 overflow-hidden flex flex-col">
            <JobDetail
              key={selectedJob.id}
              job={selectedJob}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>

      {showAdd && (
        <AddJobModal onCreated={handleCreated} onClose={() => setShowAdd(false)} />
      )}
    </div>
  )
}
