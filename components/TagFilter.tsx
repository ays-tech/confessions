'use client'
import { TAGS } from '@/lib/seeds'

interface Props {
  activeTag: string
  onTagChange: (tag: string) => void
}

export default function TagFilter({ activeTag, onTagChange }: Props) {
  return (
    <div
      className="no-scroll"
      style={{
        display: 'flex', gap: 8,
        overflowX: 'auto',
        paddingBottom: 14,
      }}
    >
      {TAGS.map(tag => (
        <button
          key={tag}
          onClick={() => onTagChange(tag)}
          style={{
            background: activeTag === tag ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
            border: activeTag === tag ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            padding: '6px 14px',
            cursor: 'pointer',
            color: activeTag === tag ? '#fff' : 'rgba(255,255,255,0.4)',
            fontSize: 12,
            fontWeight: activeTag === tag ? 700 : 400,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
