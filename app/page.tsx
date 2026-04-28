import HomeClient from '@/components/HomeClient'
import { SEED_CONFESSIONS } from '@/lib/seeds'
import { supabase } from '@/lib/supabase'

async function getInitialConfessions() {
  try {
    const { data, error } = await supabase
      .from('confessions')
      .select('*')
      .eq('is_approved', true)
      .order('reactions_cry', { ascending: false })
      .limit(20)

    if (error || !data || data.length === 0) return SEED_CONFESSIONS
    return data
  } catch {
    return SEED_CONFESSIONS
  }
}

export default async function HomePage() {
  const initialConfessions = await getInitialConfessions()
  return <HomeClient initialConfessions={initialConfessions} />
}
