'use client'
import { useState } from 'react'
import { TAGS } from '@/lib/seeds'

interface Props {
  onClose: () => void
  onSubmitted: (confession: any) => void
}

const BATCHES = ['2025B', '2025A', '2024C', '2024B', '2024A']

export default function SubmitModal({ onClose, onSubmitted }: Props) {
  const [text, setText]     = useState('')
  const [tag, setTag]       = useState('PPA Wahala')
  const [batch, setBatch]   = useState('2025B')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]   = useState('')
  const maxLen = 280

  const charLeft = maxLen - text.length
  const tooShort = text.trim().length < 20

  const handleSubmit = async () => {
    if (tooShort || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/confessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), tag, batch }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Something went wrong')
      onSubmitted(json.data)
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message || 'Failed to submit. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const baseInput: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '11px 14px',
    color: '#fff',
    fontSize: 14,
    fontFamily: "'Sora', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div style={{
        background: '#0D0D0D',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px 24px 0 0',
        padding: '28px 20px 44px',
        width: '100%',
        maxWidth: 540,
        animation: 'slideUpModal 0.32s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {submitted ? (
          /* ── SUCCESS STATE ── */
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16, animation: 'popIn 0.5s ease' }}>🔥</div>
            <h3 style={{ fontSize: 22, color: '#FFC107', margin: '0 0 10px', fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>
              Confession Dropped!
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.65, margin: '0 0 28px' }}>
              Your gist is now live and 100% anonymous.<br />
              Share the app so more corpers can feel seen 😭
            </p>
            <button onClick={onClose} style={{
              width: '100%', background: 'linear-gradient(135deg, #FFC107, #FF6B35)',
              border: 'none', borderRadius: 16, padding: '15px',
              fontSize: 15, fontWeight: 700, color: '#000',
              cursor: 'pointer', fontFamily: "'Sora', sans-serif",
            }}>
              Done, God abeg 🙏
            </button>
          </div>
        ) : (
          /* ── FORM STATE ── */
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 style={{ fontSize: 19, color: '#fff', margin: 0, fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>
                Drop Your Confession 🤫
              </h3>
              <button onClick={onClose} style={{
                background: 'rgba(255,255,255,0.07)', border: 'none',
                borderRadius: '50%', width: 32, height: 32,
                cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: 13, margin: '0 0 18px', lineHeight: 1.5 }}>
              100% anonymous. No name, no state code, no drama.
            </p>

            {/* Textarea */}
            <div style={{ position: 'relative', marginBottom: 4 }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value.slice(0, maxLen))}
                placeholder="What is NYSC doing to you? Spill everything... 😭"
                rows={5}
                style={{
                  ...baseInput,
                  resize: 'none',
                  lineHeight: 1.65,
                  paddingBottom: 32,
                }}
              />
              {/* Char count inside textarea */}
              <span style={{
                position: 'absolute', bottom: 10, right: 12,
                fontSize: 11, color: charLeft < 40 ? '#FF6B35' : 'rgba(255,255,255,0.22)',
                pointerEvents: 'none',
              }}>
                {charLeft} left
              </span>
            </div>

            {/* Category + Batch */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '14px 0 20px' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
                  Category
                </label>
                <select value={tag} onChange={e => setTag(e.target.value)} style={{ ...baseInput }}>
                  {TAGS.filter(t => t !== 'All').map(t => (
                    <option key={t} value={t} style={{ background: '#1a1a1a' }}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
                  Batch
                </label>
                <select value={batch} onChange={e => setBatch(e.target.value)} style={{ ...baseInput }}>
                  {BATCHES.map(b => (
                    <option key={b} value={b} style={{ background: '#1a1a1a' }}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p style={{ color: '#FF6B35', fontSize: 13, margin: '0 0 14px', textAlign: 'center' }}>
                ⚠️ {error}
              </p>
            )}

            {/* Hint */}
            {tooShort && text.length > 0 && (
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, margin: '0 0 12px', textAlign: 'center' }}>
                Write at least {20 - text.trim().length} more characters
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={tooShort || loading}
              style={{
                width: '100%',
                background: tooShort || loading
                  ? 'rgba(255,255,255,0.07)'
                  : 'linear-gradient(135deg, #FFC107, #FF6B35)',
                border: 'none', borderRadius: 16, padding: '15px',
                fontSize: 15, fontWeight: 700,
                color: tooShort || loading ? 'rgba(255,255,255,0.22)' : '#000',
                cursor: tooShort || loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Sora', sans-serif",
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Submitting...' : 'Submit Anonymously 🤫'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
