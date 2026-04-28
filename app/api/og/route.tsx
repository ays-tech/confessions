import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { TAG_COLORS } from '@/lib/seeds'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text') || 'Anonymous NYSC confession'
  const tag = searchParams.get('tag') || 'PPA Wahala'
  const batch = searchParams.get('batch') || '2025B'
  const cry = searchParams.get('cry') || '0'
  const laugh = searchParams.get('laugh') || '0'
  const dead = searchParams.get('dead') || '0'

  const tagColor = TAG_COLORS[tag] || '#FF6B35'
  const truncated = text.length > 180 ? text.slice(0, 180) + '...' : text

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#080808',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,193,7,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: 40 }}>😭</span>
          <span style={{
            fontSize: 28,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #FFC107, #FF6B35)',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '-0.5px',
          }}>Corper Confessions</span>
          <div style={{
            marginLeft: 'auto',
            background: tagColor + '30',
            border: `1px solid ${tagColor}60`,
            borderRadius: 20,
            padding: '6px 16px',
            fontSize: 14,
            fontWeight: 700,
            color: tagColor,
            letterSpacing: '0.5px',
          }}>{tag.toUpperCase()}</div>
        </div>

        {/* Confession */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '32px 0',
        }}>
          <p style={{
            fontSize: truncated.length > 120 ? 32 : 40,
            lineHeight: 1.55,
            color: 'rgba(255,255,255,0.92)',
            margin: 0,
            fontStyle: 'italic',
            fontWeight: 400,
          }}>
            "{truncated}"
          </p>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 24,
        }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            {[['😭', cry], ['😂', laugh], ['💀', dead]].map(([emoji, count]) => (
              <div key={emoji} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 22, color: 'rgba(255,255,255,0.7)' }}>
                <span>{emoji}</span>
                <span style={{ fontWeight: 600, fontSize: 18 }}>{Number(count) >= 1000 ? (Number(count)/1000).toFixed(1)+'k' : count}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Anonymous Corper · {batch}</span>
            <span style={{ color: '#FFC107', fontSize: 16, fontWeight: 700 }}>corperconfessions.ng</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
