import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, emoji } = body

    const colMap: Record<string, 'reactions_cry' | 'reactions_laugh' | 'reactions_dead'> = {
      '😭': 'reactions_cry',
      '😂': 'reactions_laugh',
      '💀': 'reactions_dead',
    }

    const col = colMap[emoji]
    if (!col) {
      return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 })
    }

    // Seed confessions are in-memory only — just return ok
    if (String(id).startsWith('seed-')) {
      return NextResponse.json({ ok: true })
    }

    // Fetch current value, increment, update
    // This is safer than RPC for a simple setup
    const { data: current, error: fetchErr } = await supabase
      .from('confessions')
      .select(col)
      .eq('id', id)
      .single()

    if (fetchErr || !current) {
      return NextResponse.json({ error: 'Confession not found' }, { status: 404 })
    }

    const newVal = ((current as any)[col] || 0) + 1

    const { error: updateErr } = await supabase
      .from('confessions')
      .update({ [col]: newVal })
      .eq('id', id)

    if (updateErr) throw updateErr

    return NextResponse.json({ ok: true, [col]: newVal })
  } catch (err) {
    console.error('POST /api/reactions error:', err)
    return NextResponse.json({ error: 'Failed to react' }, { status: 500 })
  }
}
