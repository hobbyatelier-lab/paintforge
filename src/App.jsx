import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'
import Auth from './components/Auth.jsx'
import Inventory from './components/Inventory.jsx'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{
      background: '#141414', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center', color: '#555' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚒</div>
        <p style={{ fontSize: 14 }}>Loading PaintForge…</p>
      </div>
    </div>
  )

  if (!session) return <Auth />

  return <Inventory user={session.user} />
}
