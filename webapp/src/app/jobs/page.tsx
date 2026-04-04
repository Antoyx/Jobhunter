import { createClient } from '@/lib/supabase/server'
import { JobsPage } from '@/components/jobs/JobsPage'
import { Job } from '@/types'

export const dynamic = 'force-dynamic'

export default async function JobsRoute() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  const jobs: Job[] = error ? [] : (data as Job[])

  return <JobsPage initialJobs={jobs} />
}
