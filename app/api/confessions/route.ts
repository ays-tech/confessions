import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SEED_CONFESSIONS } from '@/lib/seeds'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sort  = searchParams.get('sort') || 'hot'
  const page  = parseInt(searchParams.get('page') || '0')
  const limit = 20

  try {
    let query = supabase
      .from('confessions')
      .select('*')
      .eq('is_approved', true)
      .range(page * limit, (page + 1) * limit - 1)

    if (sort === 'hot') {
      query = query.order('reactions_cry', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) throw error

    if (!data || data.length === 0) {
      const seeds = [...SEED_CONFESSIONS].sort((a, b) =>
        sort === 'hot'
          ? (b.reactions_cry + b.reactions_laugh + b.reactions_dead) - (a.reactions_cry + a.reactions_laugh + a.reactions_dead)
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      return NextResponse.json({ data: seeds.slice(page * limit, (page + 1) * limit) })
    }

    return NextResponse.json({ data })
  } catch {
    const seeds = [...SEED_CONFESSIONS].sort((a, b) =>
      (b.reactions_cry + b.reactions_laugh + b.reactions_dead) - (a.reactions_cry + a.reactions_laugh + a.reactions_dead)
    )
    return NextResponse.json({ data: seeds })
  }
}

export async function POST(request: NextRequest) {
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

    const { data, error } = await supabase
      .from('confessions')
      .insert([{
        text: text.trim(),
        reactions_cry: 0,
        reactions_laugh: 0,
        reactions_dead: 0,
        is_approved: true,
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
