'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const AuthContext = createContext(null)

const DEMO_USER_STUDENT = {
  id: 'demo-student-001',
  email: 'mounish.student@college.edu',
  user_metadata: { full_name: 'Mounish S (CSE Final Year)', role: 'student' }
}

const DEMO_PROFILE_STUDENT = {
  id: 'demo-student-001',
  full_name: 'Mounish S (CSE Final Year)',
  department: 'Computer Science & Engineering',
  phone: '+91 98765 43210',
  role: 'student'
}

const DEMO_USER_ADMIN = {
  id: 'demo-admin-001',
  email: 'admin.lostfound@college.edu',
  user_metadata: { full_name: 'Campus Security & Admin Desk', role: 'admin' }
}

const DEMO_PROFILE_ADMIN = {
  id: 'demo-admin-001',
  full_name: 'Campus Security & Admin Desk',
  department: 'Student Affairs & Campus Security',
  phone: '+91 94444 12345',
  role: 'admin'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemoUser, setIsDemoUser] = useState(false)
  const supabase = createClient()

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }, [supabase])

  useEffect(() => {
    // Check if demo user saved in localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedDemo = localStorage.getItem('campusfinder_demo_auth')
        if (savedDemo) {
          const parsed = JSON.parse(savedDemo)
          setUser(parsed.user)
          setProfile(parsed.profile)
          setIsDemoUser(true)
          setLoading(false)
          return
        }
      } catch (err) {
        console.warn('Demo session check error:', err)
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchProfile(user.id)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          setIsDemoUser(false)
          await fetchProfile(currentUser.id)
        } else {
          // If not signed in via Supabase, keep demo user if active
          if (typeof window !== 'undefined') {
            const savedDemo = localStorage.getItem('campusfinder_demo_auth')
            if (savedDemo) return
          }
          setProfile(null)
          setIsDemoUser(false)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe?.()
  }, [supabase, fetchProfile])

  const loginAsDemo = (role = 'student') => {
    const activeUser = role === 'admin' ? DEMO_USER_ADMIN : DEMO_USER_STUDENT
    const activeProfile = role === 'admin' ? DEMO_PROFILE_ADMIN : DEMO_PROFILE_STUDENT

    setUser(activeUser)
    setProfile(activeProfile)
    setIsDemoUser(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('campusfinder_demo_auth', JSON.stringify({
        user: activeUser,
        profile: activeProfile
      }))
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('campusfinder_demo_auth')
    }
    setUser(null)
    setProfile(null)
    setIsDemoUser(false)
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isDemoUser,
      loginAsDemo,
      signOut,
      refetchProfile: () => fetchProfile(user?.id)
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
