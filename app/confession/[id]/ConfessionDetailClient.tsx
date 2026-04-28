'use client'
import Link from 'next/link'
import { TAG_COLORS } from '@/lib/seeds'
import { formatNum, timeAgo, getShareText } from '@/lib/utils'
import { APP_URL } from '@/lib/config'
import { useState } from 'react'

const EMOJIS = ['😭', '😂', '💀'] as const
const EMOJI_TO_KEY: Record<string, 'reactions_cry' | 'reactions_laugh' | 'reactions_dead'> = {
  '😭': 'reactions_cry',
  '😂': 'reactions_laugh',
  '💀': 'reactions_dead',
}

export default function ConfessionDetailClient({ confession }: { confession: any }) {
  const [reactions, setReactions] = useState({
    '😭': confession?.reactions_cry || 0,
    '😂': confession?.reactions_laugh || 0,
    '💀': confession?.reactions_dead || 0,
  })
  const [reacted, setReacted] = useState<string | null>(null)
  const [popEmoji, setPopEmoji] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!confession) {
    return (
      <div style={{
        minHeight: '100vh', background: '#080808',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 16, padding: 24, fontFamily: "'Sora', sans-serif",
      }}>
        <span style={{ fontSize: 64 }}>🤷</span>
        <p style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', margin: 0 }}>
          This confession doesn't exist or was removed.
        </p>
        <Link href="/" style={{ color: '#FFC107', textDecoration: 'none', fontWeight: 700 }}>
          ← Back to confessions
        </Link>
      </div>
    )
  }

  const tagColor = TAG_COLORS[confession.tag] || '#FF6B35'

  const handleReact = async (emoji: string) => {
    if (reacted) return
    setReacted(emoji)
    setPopEmoji(emoji)
    setReactions(prev => ({ ...prev, [emoji]: prev[emoji as keyof typeof prev] + 1 }))
    setTimeout(() => setPopEmoji(null), 500)
    await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: confession.id, emoji }),
    })
  }

  const handleShare = () => {
    const shareText = getShareText(confession, APP_URL)
    const shareUrl = `${APP_URL}/confession/${confession.id}`
    if (navigator.share) {
      navigator.share({ title: 'Corper Confession 😭', text: shareText, url: shareUrl })
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      fontFamily: "'Sora', sans-serif", color: '#fff',
    }}>
      {/* Ambient blob */}
      <div style={{ position: 'fixed', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* Back */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
          fontSize: 14, marginBottom: 28,
        }}>
          ← All Confessions
        </Link>

        {/* Main card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: 28, marginBottom: 20,
        }}>
          {/* Tag + batch */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{
              background: tagColor + '22', color: tagColor,
              border: `1px solid ${tagColor}45`,
              borderRadius: 20, padding: '4px 12px',
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
            }}>{confession.tag}</span>
            <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13 }}>
              {confession.batch} · {timeAgo(confession.created_at)}
            </span>
          </div>

          {/* Confession text */}
          <p style={{
            fontSize: 21, lineHeight: 1.7,
            color: 'rgba(255,255,255,0.92)',
            margin: '0 0 28px', fontWeight: 400,
          }}>
            "{confession.text}"
          </p>

          {/* Reactions */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {EMOJIS.map(emoji => {
              const isPopping = popEmoji === emoji
              return (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  style={{
                    background: reacted === emoji ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                    border: reacted === emoji ? '1px solid rgba(255,255,255,0.28)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 24, padding: '10px 16px',
                    cursor: reacted ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: 'rgba(255,255,255,0.8)',
                    transition: 'all 0.15s',
                    transform: isPopping ? 'scale(1.3)' : 'scale(1)',
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{emoji}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    {formatNum(reactions[emoji as keyof typeof reactions])}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Share */}
          <button onClick={handleShare} style={{
            width: '100%',
            background: copied ? 'rgba(80,200,120,0.15)' : 'linear-gradient(135deg, #FFC107, #FF6B35)',
            border: copied ? '1px solid rgba(80,200,120,0.3)' : 'none',
            borderRadius: 16, padding: '15px',
            fontSize: 15, fontWeight: 700,
            color: copied ? '#50C878' : '#000',
            cursor: 'pointer',
            fontFamily: "'Sora', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}>
            {copied ? '✅ Copied to clipboard!' : '↗ Share this Confession'}
          </button>
        </div>

        {/* Anon note */}
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, textAlign: 'center', margin: '0 0 28px' }}>
          🔒 Posted anonymously
        </p>

        {/* CTA to home */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: '20px',
          textAlign: 'center',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 14px' }}>
            More corpers are confessing right now 👀
          </p>
          <Link href="/" style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14, padding: '12px 24px',
            color: '#fff', textDecoration: 'none',
            fontWeight: 600, fontSize: 14,
          }}>
            Read All Confessions 😭
          </Link>
        </div>
      </div>
    </div>
  )
}
