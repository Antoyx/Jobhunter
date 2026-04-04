'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Job, JobStatus, STATUS_LABELS, STATUS_ORDER } from '@/types'
import { updateJob, deleteJob } from '@/lib/queries/jobs'
import { formatSalary } from '@/lib/utils'
import { ExternalLink, X, Trash2, Save } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

interface Props {
  job: Job
  onUpdate: (job: Job) => void
  onDelete: (id: string) => void
  onClose: () => void
}

type FormValues = {
  company: string
  title: string
  location: string
  salary_min: string
  salary_max: string
  url: string
  platform: string
  contact_name: string
  contact_email: string
  notes: string
  description: string
}

export function JobDetail({ job, onUpdate, onDelete, onClose }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      company: job.company,
      title: job.title,
      location: job.location ?? '',
      salary_min: job.salary_min?.toString() ?? '',
      salary_max: job.salary_max?.toString() ?? '',
      url: job.url ?? '',
      platform: job.platform ?? '',
      contact_name: job.contact_name ?? '',
      contact_email: job.contact_email ?? '',
      notes: job.notes ?? '',
      description: job.description ?? '',
    },
  })

  async function onSubmit(values: FormValues) {
    setSaving(true)
    try {
      const updated = await updateJob(job.id, {
        company: values.company,
        title: values.title,
        location: values.location || null,
        salary_min: values.salary_min ? parseInt(values.salary_min) : null,
        salary_max: values.salary_max ? parseInt(values.salary_max) : null,
        url: values.url || null,
        platform: values.platform || null,
        contact_name: values.contact_name || null,
        contact_email: values.contact_email || null,
        notes: values.notes || null,
        description: values.description || null,
      })
      onUpdate(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(status: JobStatus) {
    const updated = await updateJob(job.id, { status })
    onUpdate(updated)
  }

  async function handleDelete() {
    if (!confirm(`Delete ${job.company} — ${job.title}?`)) return
    setDeleting(true)
    await deleteJob(job.id)
    onDelete(job.id)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-slate-200">
        <div>
          <h2 className="font-bold text-slate-900 text-lg leading-tight">{job.company}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{job.title}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Application
          </a>
        )}
        <select
          value={job.status}
          onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
          className="text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700 hover:border-slate-300"
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company">
              <input {...register('company')} className={inputCls} />
            </Field>
            <Field label="Job Title">
              <input {...register('title')} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Location">
              <input {...register('location')} placeholder="e.g. Barcelona / Remote" className={inputCls} />
            </Field>
            <Field label="Platform / Source">
              <input {...register('platform')} placeholder="e.g. LinkedIn" className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Salary Min (€)">
              <input {...register('salary_min')} type="number" className={inputCls} />
            </Field>
            <Field label="Salary Max (€)">
              <input {...register('salary_max')} type="number" className={inputCls} />
            </Field>
          </div>

          <Field label="Job URL">
            <input {...register('url')} type="url" placeholder="https://" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact Name">
              <input {...register('contact_name')} className={inputCls} />
            </Field>
            <Field label="Contact Email">
              <input {...register('contact_email')} type="email" className={inputCls} />
            </Field>
          </div>

          <Field label="Description / Context">
            <textarea {...register('description')} rows={3} className={inputCls} />
          </Field>

          <Field label="Notes">
            <textarea {...register('notes')} rows={4} placeholder="Add notes..." className={inputCls} />
          </Field>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between px-5 py-3 bg-white border-t border-slate-200">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
