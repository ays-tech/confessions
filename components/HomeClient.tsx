'use client'
import { useState, useEffect, useCallback } from 'react'
import ConfessionCard from './ConfessionCard'
import SubmitModal from './SubmitModal'
import { formatNum } from '@/lib/utils'
import { APP_URL } from '@/lib/config'

interface Props {
  initialConfessions: any[]
}

export default function HomeClient({ initialConfessions }: Props) {
  const [confessions, setConfessions] = useState<any[]>(initialConfessions)
  const [sortBy, setSortBy]           = useState<'hot' | 'new'>('hot')
  const [showModal, setShowModal]     = useState(false)
  const [loading, setLoading]         = useState(false)
  const [page, setPage]               = useState(0)
  const [hasMore, setHasMore]         = useState(true)
  const [shareBanner, setShareBanner] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('confess') === 'true') setShowModal(true)
  }, [])

  const fetchConfessions = useCallback(async (sort: string, pageNum: number, replace: boolean) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/confessions?sort=${sort}&page=${pageNum}`)
      const json = await res.json()
      const data = json.data || []
      if (replace) setConfessions(data)
      else setConfessions(prev => [...prev, ...data])
      setHasMore(data.length === 20)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(0)
    fetchConfessions(sortBy, 0, true)
  }, [sortBy, fetchConfessions])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchConfessions(sortBy, next, false)
  }

  const handleSubmitted = (newConfession: any) => {
    if (newConfession) setConfessions(prev => [newConfession, ...prev])
  }

  const handleShareApp = () => {
    const msg = `😭 Corpers are confessing anonymously and I can't stop reading\n\n${APP_URL}\n\n#NYSC #CorperLife #CorperConfessions`
    if (navigator.share) {
      navigator.share({ title: 'Corper Confessions', text: msg, url: APP_URL })
    } else {
      navigator.clipboard.writeText(msg).then(() => {
        setShareBanner(true)
        setTimeout(() => setShareBanner(false), 3000)
      })
    }
  }

  const displayed = [...confessions].sort((a, b) => {
    if (sortBy === 'hot') {
      const ta = (a.reactions_cry || 0) + (a.reactions_laugh || 0) + (a.reactions_dead || 0)
      const tb = (b.reactions_cry || 0) + (b.reactions_laugh || 0) + (b.reactions_dead || 0)
      return tb - ta
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const totalReactions = confessions.reduce(
    (sum, c) => sum + (c.reactions_cry || 0) + (c.reactions_laugh || 0) + (c.reactions_dead || 0), 0
  )
  const maxCry   = Math.max(0, ...confessions.map(c => c.reactions_cry   || 0))
  const maxLaugh = Math.max(0, ...confessions.map(c => c.reactions_laugh || 0))
  const maxDead  = Math.max(0, ...confessions.map(c => c.reactions_dead  || 0))

  return (
    <>
      <div style={{
        minHeight: '100vh', background: '#080808',
        maxWidth: 540, margin: '0 auto',
        fontFamily: "'Sora', sans-serif", color: '#fff',
        position: 'relative',
      }}>
        {/* Ambient blobs */}
        <div style={{ position: 'fixed', top: -100, left: -100, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* ── STICKY HEADER ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(8,8,8,0.94)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 18px 14px',
        }}>
          {/* Title + Share */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 22 }}>😭</span>
                <h1 style={{
                  margin: 0, fontSize: 19, fontWeight: 800,
                  fontFamily: "'Space Mono', monospace",
                  background: 'linear-gradient(135deg, #FFC107, #FF6B35)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  letterSpacing: -0.5,
                }}>Corper Confessions</h1>
              </div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.28)', fontSize: 12 }}>
                {confessions.length} confessions · {formatNum(totalReactions)} reactions
              </p>
            </div>
            <button onClick={handleShareApp} style={{
              background: 'rgba(255,193,7,0.09)',
              border: '1px solid rgba(255,193,7,0.22)',
              borderRadius: 12, padding: '8px 13px',
              cursor: 'pointer', color: '#FFC107',
              fontSize: 12, fontWeight: 700,
              fontFamily: "'Sora', sans-serif",
            }}>Share App ↗</button>
          </div>

          {/* Sort tabs — Hot & New only */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['hot', 'new'] as const).map(val => (
              <button key={val} onClick={() => setSortBy(val)} style={{
                background: sortBy === val ? 'rgba(255,193,7,0.12)' : 'transparent',
                border: sortBy === val ? '1px solid rgba(255,193,7,0.32)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '7px 16px',
                cursor: 'pointer',
                color: sortBy === val ? '#FFC107' : 'rgba(255,255,255,0.38)',
                fontSize: 13, fontWeight: sortBy === val ? 700 : 400,
                transition: 'all 0.2s', fontFamily: "'Sora', sans-serif",
              }}>
                {val === 'hot' ? '🔥 Hot' : '✨ New'}
              </button>
            ))}
          </div>
        </div>

        {/* ── STATS BAR ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          background: 'rgba(255,255,255,0.025)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          {[
            ['😭', 'Most Felt',  formatNum(maxCry)],
            ['😂', 'Funniest',   formatNum(maxLaugh)],
            ['💀', 'Most Dead',  formatNum(maxDead)],
          ].map(([emoji, label, val]) => (
            <div key={label} style={{ padding: '11px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 17 }}>{emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 2 }}>{val}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── FEED ── */}
        <div style={{ padding: '18px 14px 130px' }}>
          {displayed.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🤷</div>
              <p style={{ margin: 0, lineHeight: 1.6 }}>No confessions yet.<br />Be the first!</p>
            </div>
          )}

          {displayed.map((c, i) => (
            <div key={c.id} style={{
              animation: 'fadeSlideUp 0.4s ease both',
              animationDelay: `${Math.min(i, 5) * 0.06}s`,
            }}>
              <ConfessionCard
                confession={c}
                featured={i === 0 && sortBy === 'hot'}
              />
            </div>
          ))}

          {hasMore && !loading && confessions.length > 0 && (
            <button onClick={loadMore} style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: 14,
              color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Sora', sans-serif", marginTop: 4,
            }}>Load more confessions</button>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: 24, color: 'rgba(255,255,255,0.28)', fontSize: 14 }}>
              Loading...
            </div>
          )}
        </div>

        {/* ── FAB ── */}
        <div style={{
          position: 'fixed', bottom: 24,
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, width: 'calc(100% - 28px)', maxWidth: 512,
        }}>
          <button
            onClick={() => setShowModal(true)}
            className="fab-glow"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #FFC107, #FF6B35)',
              border: 'none', borderRadius: 18,
              padding: '17px 24px',
              fontSize: 16, fontWeight: 700, color: '#000',
              cursor: 'pointer', fontFamily: "'Sora', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              letterSpacing: -0.3,
            }}
          >
            <span style={{ fontSize: 20 }}>🤫</span>
            Drop Your Confession
          </button>
        </div>

        {shareBanner && (
          <div style={{
            position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
            background: '#FFC107', color: '#000',
            borderRadius: 12, padding: '10px 20px',
            fontWeight: 700, fontSize: 14, zIndex: 999,
            whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(255,193,7,0.4)',
          }}>
            📋 Copied! Paste to WhatsApp 🔥
          </div>
        )}
      </div>

      {showModal && (
        <SubmitModal
          onClose={() => setShowModal(false)}
          onSubmitted={(c) => { handleSubmitted(c); setShowModal(false) }}
        />
      )}
    </>
  )
}
