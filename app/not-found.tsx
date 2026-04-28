import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px',
      textAlign: 'center',
      maxWidth: 540,
      margin: '0 auto',
      fontFamily: "'Sora', sans-serif",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ fontSize: 72, marginBottom: 20, animation: 'fadeSlideUp 0.5s ease' }}>😭</div>

      <h1 style={{
        margin: '0 0 12px',
        fontSize: 28,
        fontWeight: 800,
        fontFamily: "'Space Mono', monospace",
        background: 'linear-gradient(135deg, #FFC107, #FF6B35)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: -0.5,
      }}>
        Confession Not Found
      </h1>

      <p style={{
        color: 'rgba(255,255,255,0.4)',
        fontSize: 15,
        lineHeight: 1.65,
        margin: '0 0 12px',
      }}>
        This confession may have been removed or never existed.
      </p>

      <p style={{
        color: 'rgba(255,255,255,0.25)',
        fontSize: 13,
        margin: '0 0 36px',
        fontStyle: 'italic',
      }}>
        The NYSC suffering, however, is very real and ongoing. 🫡
      </p>

      {/* Cards showing what they're missing */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: '18px 20px',
        marginBottom: 28,
        width: '100%',
        textAlign: 'left',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 10px' }}>While you're here...</p>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
          "Someone is out there right now teaching goats at their PPA. Go read their story."
        </p>
      </div>

      <Link
        href="/"
        style={{
          display: 'block',
          width: '100%',
          background: 'linear-gradient(135deg, #FFC107, #FF6B35)',
          border: 'none',
          borderRadius: 16,
          padding: '16px 24px',
          fontSize: 15,
          fontWeight: 700,
          color: '#000',
          textDecoration: 'none',
          textAlign: 'center',
          boxSizing: 'border-box',
          boxShadow: '0 8px 32px rgba(255,193,7,0.25)',
        }}
      >
        Read other confessions →
      </Link>

      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 20 }}>
        Or drop your own confession while you're here 🤫
      </p>
    </main>
  )
}
