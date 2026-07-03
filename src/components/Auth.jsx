import { useState } from 'react'
import { supabase } from '../supabase.js'

export default function Auth() {
  const [mode, setMode]       = useState('login') // 'login' | 'signup'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created! You can now log in.')
        setMode('login')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // App.jsx handles the redirect via onAuthStateChange
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#141414',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚒</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.02em' }}>
            Paint<span style={{ color: '#e94560' }}>Forge</span>
          </h1>
          <p style={{ color: '#555', fontSize: 14, marginTop: 6 }}>
            Your miniature painting companion
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#1e1e2e', borderRadius: 16,
          border: '1px solid #2e2e3e', padding: 32,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f0', marginBottom: 24 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="artificer@paintforge.io"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  background: '#141414', border: '1px solid #3a3a4a',
                  color: '#f0f0f0', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  background: '#141414', border: '1px solid #3a3a4a',
                  color: '#f0f0f0', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: '#2a1010', border: '1px solid #5a2020',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                color: '#e07070', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                background: '#102a10', border: '1px solid #205a20',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                color: '#70c070', fontSize: 13,
              }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 8,
                background: loading ? '#555' : '#e94560',
                border: 'none', color: '#fff', fontSize: 15,
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <span style={{ color: '#555', fontSize: 13 }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: '#e94560', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
            >
              {mode === 'login' ? 'Sign up free' : 'Log in'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#333', fontSize: 12, marginTop: 24 }}>
          PaintForge by Hobby Atelier · Early Access
        </p>
      </div>
    </div>
  )
}
