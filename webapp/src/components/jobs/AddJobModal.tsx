'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Job, JobStatus } from '@/types'
import { createJob } from '@/lib/queries/jobs'
import { X } from 'lucide-react'

interface Props {
  onCreated: (job: Job) => void
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
  notes: string
  status: JobStatus
}

export function AddJobModal({ onCreated, onClose }: Props) {
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { status: 'prospect' },
  })

  async function onSubmit(values: FormValues) {
    setSaving(true)
    try {
      const job = await createJob({
        company: values.company,
        title: values.title,
        location: values.location || null,
        salary_min: values.salary_min ? parseInt(values.salary_min) : null,
        salary_max: values.salary_max ? parseInt(values.salary_max) : null,
        url: values.url || null,
        platform: values.platform || null,
        notes: values.notes || null,
        status: values.status,
        salary_currency: 'EUR',
        description: null,
        contact_name: null,
        contact_email: null,
        applied_at: null,
        source: 'manual',
      })
      onCreated(job)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Add Job</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Company *</label>
              <input {...register('company', { required: true })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Job Title *</label>
              <input {...register('title', { required: true })} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Location</label>
              <input {...register('location')} placeholder="e.g. Barcelona / Remote" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Platform</label>
              <input {...register('platform')} placeholder="e.g. LinkedIn" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Salary Min (€)</label>
              <input {...register('salary_min')} type="number" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Salary Max (€)</label>
              <input {...register('salary_max')} type="number" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Job URL</label>
            <input {...register('url')} type="url" placeholder="https://" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select {...register('status')} className={inputCls}>
              <option value="prospect">Prospect</option>
              <option value="needs_apply">Needs Apply</option>
              <option value="ai_apply_failed">AI Apply Failed</option>
              <option value="applied">Applied</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea {...register('notes')} rows={2} className={inputCls} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const labelCls = 'block text-xs font-medium text-slate-500 mb-1'
const inputCls =
  'w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
