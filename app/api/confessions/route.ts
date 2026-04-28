import { NextRequest, NextResponse } from 'next/server'
import { SEED_CONFESSIONS } from '@/lib/seeds'

const hasSupabase = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'
)

function getSorted(arr: any[], sort: string) {
  return [...arr].sort((a, b) =>
    sort === 'hot'
      ? (b.reactions_cry + b.reactions_laugh + b.reactions_dead) -
        (a.reactions_cry + a.reactions_laugh + a.reactions_dead)
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sort  = searchParams.get('sort') || 'hot'
  const page  = parseInt(searchParams.get('page') || '0')
  const limit = 20

  // No Supabase configured — always return seeds (local dev)
  if (!hasSupabase) {
    const seeds = getSorted(SEED_CONFESSIONS, sort)
    return NextResponse.json({ data: seeds.slice(page * limit, (page + 1) * limit) })
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let query = supabase
      .from('confessions')
      .select('*')
      .eq('is_approved', true)
      .range(page * limit, (page + 1) * limit - 1)

    query = sort === 'hot'
      ? query.order('reactions_cry', { ascending: false })
      : query.order('created_at',    { ascending: false })

    const { data, error } = await query
    if (error) throw error

    // If DB is empty, show seeds so app never feels dead
    if (!data || data.length === 0) {
      const seeds = getSorted(SEED_CONFESSIONS, sort)
      return NextResponse.json({ data: seeds.slice(page * limit, (page + 1) * limit) })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('GET /api/confessions error:', err)
    // Always fall back to seeds
    const seeds = getSorted(SEED_CONFESSIONS, sort)
    return NextResponse.json({ data: seeds.slice(page * limit, (page + 1) * limit) })
  }
}

export async function POST(request: NextRequest) {
  if (!hasSupabase) {
    return NextResponse.json(
      { error: 'Database not configured. Add Supabase env vars.' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { text } = body

    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: 'Confession too short' }, { status: 400 })
    }
    if (text.trim().length > 280) {
      return NextResponse.json({ error: 'Confession too long' }, { status: 400 })
    }

    const banned = ['spam', 'advertisement', 'click here', 'whatsapp.com', 'bit.ly']
    if (banned.some(b => text.toLowerCase().includes(b))) {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('confessions')
      .insert([{
        text: text.trim(),
        reactions_cry:   0,
        reactions_laugh: 0,
        reactions_dead:  0,
        is_approved:     true,
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/confessions error:', err)
    return NextResponse.json({ error: 'Failed to submit confession' }, { status: 500 })
  }
}
