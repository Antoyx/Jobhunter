import { createClient } from '@/lib/supabase/client'
import { Job, JobStatus } from '@/types'

export async function fetchJobs(status?: JobStatus | 'all'): Promise<Job[]> {
  const supabase = createClient()
  let query = supabase.from('jobs').select('*').order('created_at', { ascending: false })
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  const { data, error } = await query
  if (error) throw error
  return data as Job[]
}

export async function updateJob(id: string, patch: Partial<Job>): Promise<Job> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('jobs')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Job
}

export async function createJob(data: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> {
  const supabase = createClient()
  const { data: job, error } = await supabase
    .from('jobs')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return job as Job
}

export async function deleteJob(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('jobs').delete().eq('id', id)
  if (error) throw error
}
