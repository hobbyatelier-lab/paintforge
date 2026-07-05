import { useState } from 'react'
import logoUrl from '../assets/logo.svg'
import { supabase } from '../supabase.js'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND_CYAN   = '#36E2DD'
const BG_DARK      = '#1A1A1F'
const BG_CARD      = '#1E2428'
const BG_INPUT     = '#141418'
const BORDER       = '#2A3035'
const TEXT_PRIMARY = '#F0F4F4'
const TEXT_MUTED   = '#6B8080'
const MIN_PW       = 8

export default function Auth() {
  const [mode, setMode]         = useState('login')   // 'login' | 'signup' | 'forgot'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState('')

  function validate() {
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return false }
    if (mode !== 'forgot' && password.length < MIN_PW) {
      setError(`Password must be at least ${MIN_PW} characters.`); return false
    }
    return true
  }

  async function handleSubmit() {
    setError(''); setSuccess('')
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created! Check your inbox and confirm your email before signing in.')
        setMode('login')
        setPassword('')
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        setSuccess('Reset link sent! Check your inbox — the link expires in 24 hours.')
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

  function switchMode(next) {
    setMode(next); setError(''); setSuccess(''); setPassword('')
  }

  const isLogin  = mode === 'login'
  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot'

  return (
    <div style={{
      minHeight: '100vh', background: BG_DARK,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: "'Montserrat', system-ui, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo + Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img src={logoUrl} alt="PaintForge"
            style={{ width: 160, height: 160, display: 'block', margin: '0 auto 20px' }} />
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, margin: 0 }}>
            <span style={{ color: BRAND_CYAN }}>Paint</span>
            <span style={{ color: '#8AABAB' }}>forge</span>
          </h1>
          <p style={{ color: TEXT_MUTED, fontSize: 13, marginTop: 8, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Your miniature painting companion
          </p>
        </div>

        {/* Card */}
        <div style={{ background: BG_CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 32 }}>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 24, letterSpacing: '-0.01em' }}>
            {isLogin ? 'Sign in to your account' : isSignup ? 'Create your account' : 'Reset your password'}
          </h2>

          {error   && <div style={{ background:'#2d1414', border:'1px solid #6b2020', borderRadius:8, padding:'10px 14px', color:'#f87171', fontSize:13, marginBottom:16 }}>{error}</div>}
          {success && <div style={{ background:'#142d1c', border:`1px solid ${BRAND_CYAN}33`, borderRadius:8, padding:'10px 14px', color:BRAND_CYAN, fontSize:13, marginBottom:16 }}>{success}</div>}

          {/* Email field */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:TEXT_MUTED, marginBottom:6, letterSpacing:'0.04em', textTransform:'uppercase' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width:'100%', padding:'10px 14px', background:BG_INPUT, border:`1px solid ${BORDER}`, borderRadius:8, color:TEXT_PRIMARY, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
          </div>

          {/* Password field — hidden on forgot mode */}
          {!isForgot && (
            <div style={{ marginBottom: 8 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:TEXT_MUTED, marginBottom:6, letterSpacing:'0.04em', textTransform:'uppercase' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder={isSignup ? `At least ${MIN_PW} characters` : '••••••••'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ width:'100%', padding:'10px 14px', background:BG_INPUT, border:`1px solid ${BORDER}`, borderRadius:8, color:TEXT_PRIMARY, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            </div>
          )}

          {/* Forgot password link — only on login mode */}
          {isLogin && (
            <div style={{ textAlign:'right', marginBottom:20 }}>
              <button onClick={() => switchMode('forgot')}
                style={{ background:'none', border:'none', color:TEXT_MUTED, fontSize:11, cursor:'pointer', fontFamily:'inherit', textDecoration:'underline' }}>
                Forgot password?
              </button>
            </div>
          )}

          {!isLogin && <div style={{ marginBottom: 20 }} />}

          {/* Primary action */}
          <button onClick={handleSubmit} disabled={loading}
            style={{ width:'100%', padding:'12px', background:BRAND_CYAN, border:'none', borderRadius:8, color:'#0A1414', fontSize:14, fontWeight:800, letterSpacing:'0.02em', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, fontFamily:'inherit' }}>
            {loading ? 'Please wait…' : isLogin ? 'Sign In' : isSignup ? 'Create Account' : 'Send Reset Link'}
          </button>

          {/* Mode switchers */}
          <div style={{ textAlign:'center', marginTop:20 }}>
            {!isForgot ? (
              <>
                <span style={{ color:TEXT_MUTED, fontSize:13 }}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button onClick={() => switchMode(isLogin ? 'signup' : 'login')}
                  style={{ background:'none', border:'none', color:BRAND_CYAN, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </>
            ) : (
              <button onClick={() => switchMode('login')}
                style={{ background:'none', border:'none', color:TEXT_MUTED, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                ← Back to sign in
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign:'center', color:TEXT_MUTED, fontSize:11, marginTop:24, opacity:0.6 }}>
          © {new Date().getFullYear()} Hobby Atelier · PaintForge
        </p>
      </div>
    </div>
  )
}
