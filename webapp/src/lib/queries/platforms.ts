import { createClient } from '@/lib/supabase/client'
import { Platform } from '@/types'

export async function fetchPlatforms(): Promise<Platform[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .eq('is_active', true)
    .order('tier')
    .order('name')
  if (error) throw error
  return data as Platform[]
}
