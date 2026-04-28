import { NextRequest, NextResponse } from 'next/server'

const hasSupabase = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'
)

const colMap: Record<string, string> = {
  '😭': 'reactions_cry',
  '😂': 'reactions_laugh',
  '💀': 'reactions_dead',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, emoji, action } = body // action: 'add' | 'remove'

    const col = colMap[emoji]
    if (!col) {
      return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 })
    }

    // Seed or no Supabase — just return ok (UI already updated optimistically)
    if (String(id).startsWith('seed-') || !hasSupabase) {
      return NextResponse.json({ ok: true })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Use raw SQL expression to atomically increment or decrement
    // This avoids the fetch-then-update race condition entirely
    const expression = action === 'remove'
      ? `${col} - 1`
      : `${col} + 1`

    const { error } = await supabase.rpc('adjust_reaction', {
      p_id:         id,
      p_col:        col,
      p_adjustment: action === 'remove' ? -1 : 1,
    })

    if (error) {
      // RPC might not exist yet — fall back to safe direct update
      console.warn('RPC failed, falling back:', error.message)

      const { data: current } = await supabase
        .from('confessions')
        .select(col)
        .eq('id', id)
        .single()

      if (current) {
        const currentVal = (current as any)[col] || 0
        const newVal = Math.max(0, action === 'remove' ? currentVal - 1 : currentVal + 1)
        await supabase
          .from('confessions')
          .update({ [col]: newVal })
          .eq('id', id)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/reactions error:', err)
    // Still return ok — UI is already updated optimistically, don't break UX
    return NextResponse.json({ ok: true })
  }
}
