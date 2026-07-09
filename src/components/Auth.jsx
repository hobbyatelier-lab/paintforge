import { useState, useEffect } from 'react'
import logoUrl from '../assets/logo.svg'
import { supabase } from '../supabase.js'

const BRAND_CYAN = '#36E2DD'
const BG_DARK    = '#1A1A1F'
const BG_CARD    = '#1E2428'
const BG_INPUT   = '#141418'
const BORDER     = '#2A3035'
const TEXT_PRIMARY = '#F0F4F4'
const TEXT_MUTED   = '#6B8080'
const MIN_PW       = 8

export default function Auth() {
  const [mode, setMode]         = useState('login')   // 'login' | 'signup' | 'forgot' | 'reset'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState('')

  // ── Detect password recovery session on mount ──────────────────────────────
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset')
        setError('')
        setSuccess('')
      }
    })
  }, [])

  function validate() {
    if (mode === 'reset') {
      if (password.length < MIN_PW) { setError(`Password must be at least ${MIN_PW} characters.`); return false }
      if (password !== confirm)     { setError('Passwords do not match.'); return false }
      return true
    }
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
      if (mode === 'reset') {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setSuccess('Password updated! You can now sign in.')
        setMode('login')
        setPassword(''); setConfirm('')
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created! Check your inbox and confirm your email before signing in.')
        setMode('login'); setPassword('')
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}`,
        })
        if (error) throw error
        setSuccess('Reset link sent! Check your inbox — click the link to set a new password.')
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
    setMode(next); setError(''); setSuccess(''); setPassword(''); setConfirm('')
  }

  const isLogin  = mode === 'login'
  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot'
  const isReset  = mode === 'reset'

  const title = isReset  ? 'Set a new password'
              : isForgot ? 'Reset your password'
              : isSignup ? 'Create your account'
              :            'Sign in to your account'

  const btnLabel = loading ? 'Please wait…'
                 : isReset  ? 'Set New Password'
                 : isForgot ? 'Send Reset Link'
                 : isSignup ? 'Create Account'
                 :            'Sign In'

  return (
    <div style={{ minHeight:'100vh', background:BG_DARK, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Montserrat',system-ui,sans-serif" }}>
      <div style={{ width:'100%', maxWidth:400 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <img src={logoUrl} alt="PaintForge" style={{ width:160, height:160, display:'block', margin:'0 auto 20px' }} />
          <h1 style={{ fontSize:32, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1, margin:0 }}>
            <span style={{ color:BRAND_CYAN }}>Paint</span>
            <span style={{ color:'#8AABAB' }}>forge</span>
          </h1>
          <p style={{ color:TEXT_MUTED, fontSize:13, marginTop:8, fontWeight:500, letterSpacing:'0.05em', textTransform:'uppercase' }}>
            Your miniature painting companion
          </p>
        </div>

        {/* Card */}
        <div style={{ background:BG_CARD, borderRadius:16, border:`1px solid ${BORDER}`, padding:32 }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:TEXT_PRIMARY, marginBottom:24, letterSpacing:'-0.01em' }}>{title}</h2>

          {error   && <div style={{ background:'#2d1414', border:'1px solid #6b2020', borderRadius:8, padding:'10px 14px', color:'#f87171', fontSize:13, marginBottom:16 }}>{error}</div>}
          {success && <div style={{ background:'#142d1c', border:`1px solid ${BRAND_CYAN}33`, borderRadius:8, padding:'10px 14px', color:BRAND_CYAN, fontSize:13, marginBottom:16 }}>{success}</div>}

          {/* Email — hidden on reset mode */}
          {!isReset && (
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:TEXT_MUTED, marginBottom:6, letterSpacing:'0.04em', textTransform:'uppercase' }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                style={{ width:'100%', padding:'10px 14px', background:BG_INPUT, border:`1px solid ${BORDER}`, borderRadius:8, color:TEXT_PRIMARY, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            </div>
          )}

          {/* Password */}
          {!isForgot && (
            <div style={{ marginBottom:8 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:TEXT_MUTED, marginBottom:6, letterSpacing:'0.04em', textTransform:'uppercase' }}>
                {isReset ? 'New Password' : 'Password'}
              </label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder={isSignup||isReset ? `At least ${MIN_PW} characters` : '••••••••'}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                style={{ width:'100%', padding:'10px 14px', background:BG_INPUT, border:`1px solid ${BORDER}`, borderRadius:8, color:TEXT_PRIMARY, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            </div>
          )}

          {/* Confirm password — reset mode only */}
          {isReset && (
            <div style={{ marginBottom:8 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:TEXT_MUTED, marginBottom:6, letterSpacing:'0.04em', textTransform:'uppercase' }}>Confirm Password</label>
              <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}
                placeholder="Same password again"
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                style={{ width:'100%', padding:'10px 14px', background:BG_INPUT, border:`1px solid ${BORDER}`, borderRadius:8, color:TEXT_PRIMARY, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            </div>
          )}

          {/* Forgot link */}
          {isLogin && (
            <div style={{ textAlign:'right', marginBottom:20 }}>
              <button onClick={()=>switchMode('forgot')}
                style={{ background:'none', border:'none', color:TEXT_MUTED, fontSize:11, cursor:'pointer', fontFamily:'inherit', textDecoration:'underline' }}>
                Forgot password?
              </button>
            </div>
          )}

          {!isLogin && <div style={{ marginBottom:20 }} />}

          {/* Primary action */}
          <button onClick={handleSubmit} disabled={loading}
            style={{ width:'100%', padding:12, background:BRAND_CYAN, border:'none', borderRadius:8, color:'#0A1414', fontSize:14, fontWeight:800, letterSpacing:'0.02em', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, fontFamily:'inherit' }}>
            {btnLabel}
          </button>

          {/* Mode switchers */}
          {!isReset && (
            <div style={{ textAlign:'center', marginTop:20 }}>
              {!isForgot ? (
                <>
                  <span style={{ color:TEXT_MUTED, fontSize:13 }}>{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
                  <button onClick={()=>switchMode(isLogin?'signup':'login')}
                    style={{ background:'none', border:'none', color:BRAND_CYAN, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </>
              ) : (
                <button onClick={()=>switchMode('login')}
                  style={{ background:'none', border:'none', color:TEXT_MUTED, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                  ← Back to sign in
                </button>
              )}
            </div>
          )}
        </div>

        <p style={{ textAlign:'center', color:TEXT_MUTED, fontSize:11, marginTop:24, opacity:0.6 }}>
          <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:4, flexWrap:'wrap' }}>
            <a href="/about.html" style={{ color:'#3a5050', fontSize:10, textDecoration:'none' }}>About</a>
            <a href="/tos.html" style={{ color:'#3a5050', fontSize:10, textDecoration:'none' }}>Terms</a>
            <a href="/privacy.html" style={{ color:'#3a5050', fontSize:10, textDecoration:'none' }}>Privacy</a>
            <a href="/changelog.html" style={{ color:'#3a5050', fontSize:10, textDecoration:'none' }}>Changelog</a>
          </div>
          © {new Date().getFullYear()} Hobby Atelier · PaintForge
        </p>
      </div>
    </div>
  )
}
