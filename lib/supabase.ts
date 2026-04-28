import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Confession = {
  id: string
  text: string
  tag: string
  batch: string
  reactions_cry: number
  reactions_laugh: number
  reactions_dead: number
  created_at: string
  is_approved: boolean
}
