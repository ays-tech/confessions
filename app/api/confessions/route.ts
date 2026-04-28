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

function getSupabase() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Inserts seed confessions into DB if the table is empty.
// Runs once — subsequent calls are no-ops because count > 0.
async function maybeInsertSeeds(supabase: any) {
  const { count } = await supabase
    .from('confessions')
    .select('*', { count: 'exact', head: true })

  if (count && count > 0) return // already seeded

  const rows = SEED_CONFESSIONS.map(s => ({
    text:            s.text,
    reactions_cry:   s.reactions_cry,
    reactions_laugh: s.reactions_laugh,
    reactions_dead:  s.reactions_dead,
    is_approved:     true,
    // preserve the original timestamps so sort order makes sense
    created_at:      s.created_at,
  }))

  const { error } = await supabase.from('confessions').insert(rows)
  if (error) console.error('Seed insert error:', error.message)
  else console.log(`✅ Seeded ${rows.length} confessions into DB`)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sort  = searchParams.get('sort') || 'hot'
  const page  = parseInt(searchParams.get('page') || '0')
  const limit = 20

  // No Supabase — return in-memory seeds (local dev without .env)
  if (!hasSupabase) {
    const seeds = getSorted(SEED_CONFESSIONS, sort)
    return NextResponse.json({ data: seeds.slice(page * limit, (page + 1) * limit) })
  }

  try {
    const supabase = getSupabase()

    // Seed the DB if empty — this is the fix
    await maybeInsertSeeds(supabase)

    let query = supabase
      .from('confessions')
      .select('*')
      .eq('is_approved', true)
      .range(page * limit, (page + 1) * limit - 1)

    query = sort === 'hot'
      ? query.order('reactions_cry', { ascending: false })
      : query.order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (err) {
    console.error('GET /api/confessions error:', err)
    // Fallback to in-memory seeds so page never breaks
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

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('confessions')
      .insert([{
        text:            text.trim(),
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