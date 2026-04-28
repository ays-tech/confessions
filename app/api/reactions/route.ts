import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, emoji } = body

    // Map emoji to column
    const colMap: Record<string, string> = {
      '😭': 'reactions_cry',
      '😂': 'reactions_laugh',
      '💀': 'reactions_dead',
    }

    const col = colMap[emoji]
    if (!col) {
      return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 })
    }

    // Skip reaction update for seed data (ids starting with 'seed-')
    if (String(id).startsWith('seed-')) {
      return NextResponse.json({ ok: true, seed: true })
    }

    // Use RPC to atomically increment
    const { error } = await supabase.rpc('increment_reaction', {
      confession_id: id,
      reaction_col: col,
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/reactions error:', err)
    return NextResponse.json({ error: 'Failed to react' }, { status: 500 })
  }
}
