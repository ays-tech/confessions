import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SEED_CONFESSIONS } from '@/lib/seeds'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag') || 'All'
  const sort = searchParams.get('sort') || 'hot'
  const page = parseInt(searchParams.get('page') || '0')
  const limit = 20

  try {
    let query = supabase
      .from('confessions')
      .select('*')
      .eq('is_approved', true)
      .range(page * limit, (page + 1) * limit - 1)

    if (tag !== 'All') {
      query = query.eq('tag', tag)
    }

    if (sort === 'hot') {
      // Order by total reactions (cry + laugh + dead)
      query = query.order('reactions_cry', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) throw error

    // Fall back to seeds if no data yet
    if (!data || data.length === 0) {
      let seeds = [...SEED_CONFESSIONS]
      if (tag !== 'All') seeds = seeds.filter(s => s.tag === tag)
      if (sort === 'hot') seeds.sort((a, b) =>
        (b.reactions_cry + b.reactions_laugh + b.reactions_dead) -
        (a.reactions_cry + a.reactions_laugh + a.reactions_dead)
      )
      else seeds.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      return NextResponse.json({ data: seeds.slice(page * limit, (page + 1) * limit), fromSeed: true })
    }

    return NextResponse.json({ data, fromSeed: false })
  } catch (err) {
    // Always fall back to seeds on error
    let seeds = [...SEED_CONFESSIONS]
    if (tag !== 'All') seeds = seeds.filter(s => s.tag === tag)
    if (sort === 'hot') seeds.sort((a, b) =>
      (b.reactions_cry + b.reactions_laugh + b.reactions_dead) -
      (a.reactions_cry + a.reactions_laugh + a.reactions_dead)
    )
    return NextResponse.json({ data: seeds, fromSeed: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, tag, batch } = body

    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: 'Confession too short' }, { status: 400 })
    }
    if (text.trim().length > 280) {
      return NextResponse.json({ error: 'Confession too long' }, { status: 400 })
    }

    // Basic spam/profanity check placeholder
    const banned = ['spam', 'advertisement', 'click here']
    const lower = text.toLowerCase()
    if (banned.some(b => lower.includes(b))) {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('confessions')
      .insert([{
        text: text.trim(),
        tag,
        batch,
        reactions_cry: 0,
        reactions_laugh: 0,
        reactions_dead: 0,
        is_approved: true, // set to false if you want manual moderation
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
