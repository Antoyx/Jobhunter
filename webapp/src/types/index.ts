export type JobStatus =
  | 'needs_apply'
  | 'applied'
  | 'replied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'skipped'
  | 'closed'
  | 'archived'

export interface Job {
  id: string
  created_at: string
  updated_at: string
  company: string
  title: string
  location: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  url: string | null
  platform: string | null
  status: JobStatus
  description: string | null
  notes: string | null
  contact_name: string | null
  contact_email: string | null
  applied_at: string | null
  source: string | null
}

export interface Platform {
  id: string
  name: string
  url: string
  tier: 1 | 2 | 3
  tags: string[]
  notes: string | null
  is_active: boolean
  last_checked_at: string | null
}

export const STATUS_LABELS: Record<JobStatus, string> = {
  needs_apply: 'Needs Apply',
  applied: 'Applied',
  replied: 'Replied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  skipped: 'Skipped',
  closed: 'Closed',
  archived: 'Archived',
}

export const STATUS_ORDER: JobStatus[] = [
  'needs_apply',
  'applied',
  'replied',
  'interview',
  'offer',
  'rejected',
  'skipped',
  'closed',
  'archived',
]

export const TIER_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Tier 1 — Primary Boards',
  2: 'Tier 2 — General & Remote Boards',
  3: 'Tier 3 — Supplemental',
}
