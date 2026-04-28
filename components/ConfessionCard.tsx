'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { TAG_COLORS } from '@/lib/seeds'
import { formatNum, timeAgo, getShareText } from '@/lib/utils'
import { APP_URL } from '@/lib/config'

const EMOJIS = ['😭', '😂', '💀'] as const
const EMOJI_TO_KEY = {
  '😭': 'reactions_cry',
  '😂': 'reactions_laugh',
  '💀': 'reactions_dead',
} as const

interface Props {
  confession: any
  featured?: boolean
}

export default function ConfessionCard({ confession, featured = false }: Props) {
  // Local reaction counts — starts from server value, updated instantly
  const [counts, setCounts] = useState({
    reactions_cry:   confession.reactions_cry   || 0,
    reactions_laugh: confession.reactions_laugh || 0,
    reactions_dead:  confession.reactions_dead  || 0,
  })
  const [reacted, setReacted]   = useState<string | null>(null)
  const [popEmoji, setPopEmoji] = useState<string | null>(null)
  const [copied, setCopied]     = useState(false)

  // Debounce ref — fires DB write 2s after tap, skips if already pending
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleReact = (emoji: string) => {
    if (reacted) return

    const key = EMOJI_TO_KEY[emoji as keyof typeof EMOJI_TO_KEY]

    // 1. Instant local update — no wait
    setReacted(emoji)
    setPopEmoji(emoji)
    setCounts(prev => ({ ...prev, [key]: prev[key] + 1 }))
    setTimeout(() => setPopEmoji(null), 500)

    // 2. Skip DB entirely for seed data
    if (String(confession.id).startsWith('seed-')) return

    // 3. Debounced DB write — fires once after 2s
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confession.id, emoji }),
      }).catch(() => {
        // Silent fail — user already saw the optimistic update
      })
    }, 2000)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    const shareText = getShareText(confession, APP_URL)
    const shareUrl  = `${APP_URL}/confession/${confession.id}`
    if (navigator.share) {
      navigator.share({ title: 'Corper Confession 😭', text: shareText, url: shareUrl })
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2200)
      })
    }
  }

  const tagColor = TAG_COLORS[confession.tag] || '#6B7280'

  return (
    <div style={{
      background: featured ? 'rgba(255,193,7,0.04)' : 'rgba(255,255,255,0.035)',
      border: featured ? '1.5px solid rgba(255,193,7,0.4)' : '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      padding: '20px',
      marginBottom: 14,
      position: 'relative',
      boxShadow: featured ? '0 0 32px rgba(255,193,7,0.07)' : '0 4px 24px rgba(0,0,0,0.18)',
    }}>

      {/* Trending badge */}
      {featured && (
        <div style={{
          position: 'absolute', top: -11, left: 18,
          background: 'linear-gradient(135deg, #FFC107, #FF6B35)',
          borderRadius: 20, padding: '3px 12px',
          fontSize: 11, fontWeight: 700, color: '#000', letterSpacing: 0.8,
        }}>🔥 TRENDING</div>
      )}

      {/* Tag + Time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        {confession.tag ? (
          <span style={{
            background: tagColor + '20', color: tagColor,
            border: `1px solid ${tagColor}40`,
            borderRadius: 20, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
          }}>{confession.tag}</span>
        ) : <span />}
        <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12 }}>
          {timeAgo(confession.created_at)}
        </span>
      </div>

      {/* Confession text */}
      <Link href={`/confession/${confession.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <p style={{
          fontSize: 15.5, lineHeight: 1.68,
          color: 'rgba(255,255,255,0.9)',
          margin: '0 0 18px', fontWeight: 400,
          fontFamily: "'Sora', sans-serif",
        }}>
          "{confession.text}"
        </p>
      </Link>

      {/* Reactions + Share */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {EMOJIS.map(emoji => {
            const key = EMOJI_TO_KEY[emoji]
            const isPopping = popEmoji === emoji
            return (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                style={{
                  background: reacted === emoji ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.04)',
                  border: reacted === emoji ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  padding: '5px 10px',
                  cursor: reacted ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  color: 'rgba(255,255,255,0.8)',
                  transition: 'background 0.2s ease',
                  transform: isPopping ? 'scale(1.3)' : 'scale(1)',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                <span style={{ fontSize: 14 }}>{emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{formatNum(counts[key])}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleShare}
          style={{
            background: copied ? 'rgba(80,200,120,0.12)' : 'rgba(255,193,7,0.08)',
            border: copied ? '1px solid rgba(80,200,120,0.3)' : '1px solid rgba(255,193,7,0.22)',
            borderRadius: 20, padding: '6px 13px',
            cursor: 'pointer',
            color: copied ? '#50C878' : '#FFC107',
            fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 4,
            transition: 'all 0.2s',
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {copied ? '✅ Copied' : 'Share ↗'}
        </button>
      </div>
    </div>
  )
}
