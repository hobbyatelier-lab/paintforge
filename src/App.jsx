import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'
import Auth from './components/Auth.jsx'
import Inventory from './components/Inventory.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'

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

  if (loading) return <LoadingScreen />

  if (!session) return <Auth />

  return <Inventory user={session.user} />
}
