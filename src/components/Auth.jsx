import { useState } from 'react'
import { supabase } from '../supabase.js'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND_CYAN   = '#36E2DD'
const BG_DARK      = '#1A1A1F'
const BG_CARD      = '#1E2428'
const BG_INPUT     = '#141418'
const BORDER       = '#2A3035'
const TEXT_PRIMARY = '#F0F4F4'
const TEXT_MUTED   = '#6B8080'

export default function Auth() {
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created! You can now log in.')
        setMode('login')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: BG_DARK,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: "'Montserrat', system-ui, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo + Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img
            src="/logo.svg"
            alt="PaintForge"
            style={{ width: 96, height: 96, marginBottom: 16, display: 'block', margin: '0 auto 16px' }}
          />
          <h1 style={{
            fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em',
            lineHeight: 1, margin: 0,
          }}>
            <span style={{ color: BRAND_CYAN }}>Paint</span>
            <span style={{ color: '#2E3A3A' }}>forge</span>
          </h1>
          <p style={{ color: TEXT_MUTED, fontSize: 13, marginTop: 8, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Your miniature painting companion
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: BG_CARD, borderRadius: 16,
          border: `1px solid ${BORDER}`, padding: 32,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 24, letterSpacing: '-0.01em' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>

          {error   && <div style={{ background: '#2d1414', border: '1px solid #6b2020', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          {success && <div style={{ background: '#142d1c', border: `1px solid ${BRAND_CYAN}33`, borderRadius: 8, padding: '10px 14px', color: BRAND_CYAN, fontSize: 13, marginBottom: 16 }}>{success}</div>}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '10px 14px', background: BG_INPUT,
                border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT_PRIMARY,
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px', background: BG_INPUT,
                border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT_PRIMARY,
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          <button
            onClick={handleSubmit} disabled={loading}
            style={{
              width: '100%', padding: '12px', background: BRAND_CYAN,
              border: 'none', borderRadius: 8, color: '#0A1414',
              fontSize: 14, fontWeight: 800, letterSpacing: '0.02em',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
            }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <span style={{ color: TEXT_MUTED, fontSize: 13 }}>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
              style={{ background: 'none', border: 'none', color: BRAND_CYAN, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: TEXT_MUTED, fontSize: 11, marginTop: 24, opacity: 0.6 }}>
          © {new Date().getFullYear()} Hobby Atelier · PaintForge
        </p>
      </div>
    </div>
  )
}
