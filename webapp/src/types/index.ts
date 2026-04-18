export type JobStatus =
  | 'prospect'
  | 'needs_apply'
  | 'ai_apply_failed'
  | 'applied'
  | 'replied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'closed'

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
  prospect: 'Prospect',
  needs_apply: 'Needs Apply',
  ai_apply_failed: 'AI Apply Failed',
  applied: 'Applied',
  replied: 'Replied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  closed: 'Closed',
}

export const STATUS_ORDER: JobStatus[] = [
  'prospect',
  'needs_apply',
  'ai_apply_failed',
  'applied',
  'replied',
  'interview',
  'offer',
  'rejected',
  'closed',
]

export const TIER_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Tier 1 — Primary Boards',
  2: 'Tier 2 — General & Remote Boards',
  3: 'Tier 3 — Supplemental',
}
