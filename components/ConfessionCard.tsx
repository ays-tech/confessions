'use client'
import { useState } from 'react'
import Link from 'next/link'
import { TAG_COLORS } from '@/lib/seeds'
import { formatNum, timeAgo, getShareText } from '@/lib/utils'
import { APP_URL } from '@/lib/config'

const EMOJIS = ['😭', '😂', '💀'] as const
const EMOJI_TO_KEY: Record<string, 'reactions_cry' | 'reactions_laugh' | 'reactions_dead'> = {
  '😭': 'reactions_cry',
  '😂': 'reactions_laugh',
  '💀': 'reactions_dead',
}

interface Props {
  confession: any
  featured?: boolean
  onReact: (id: string, emoji: string) => void
}

export default function ConfessionCard({ confession, featured = false, onReact }: Props) {
  const [reacted, setReacted] = useState<string | null>(null)
  const [popEmoji, setPopEmoji] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const tagColor = TAG_COLORS[confession.tag] || '#FF6B35'

  const handleReact = (emoji: string) => {
    if (reacted) return
    setReacted(emoji)
    setPopEmoji(emoji)
    onReact(confession.id, emoji)
    setTimeout(() => setPopEmoji(null), 500)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    const shareText = getShareText(confession, APP_URL)
    const shareUrl = `${APP_URL}/confession/${confession.id}`
    if (navigator.share) {
      navigator.share({ title: 'Corper Confession 😭', text: shareText, url: shareUrl })
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2200)
      })
    }
  }

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

      {/* Tag + Time row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{
          background: tagColor + '20', color: tagColor,
          border: `1px solid ${tagColor}40`,
          borderRadius: 20, padding: '3px 10px',
          fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
        }}>{confession.tag}</span>
        <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12 }}>
          {confession.batch} · {timeAgo(confession.created_at)}
        </span>
      </div>

      {/* Confession text — tappable to detail page */}
      <Link href={`/confession/${confession.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <p style={{
          fontSize: 15.5,
          lineHeight: 1.68,
          color: 'rgba(255,255,255,0.9)',
          margin: '0 0 18px',
          fontWeight: 400,
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
            const count = confession[key] || 0
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
                  transition: 'transform 0.15s ease, background 0.2s ease',
                  transform: isPopping ? 'scale(1.3)' : 'scale(1)',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                <span style={{ fontSize: 14 }}>{emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{formatNum(count)}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleShare}
          style={{
            background: copied ? 'rgba(80,200,120,0.12)' : 'rgba(255,193,7,0.08)',
            border: copied ? '1px solid rgba(80,200,120,0.3)' : '1px solid rgba(255,193,7,0.22)',
            borderRadius: 20,
            padding: '6px 13px',
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
