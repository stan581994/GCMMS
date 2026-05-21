import React, { createContext, useContext, useState, useEffect } from 'react'
import type { AppUser } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  currentUser: AppUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  switchRole: (userId: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

async function fetchProfile(userId: string): Promise<AppUser | null> {
  console.log('[fetchProfile] querying app_users for', userId)
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', userId)
    .single()
  console.log('[fetchProfile] result', { data, error })
  return data ?? null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)

  useEffect(() => {
    // Restore session on page load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (profile) setCurrentUser({ ...profile, email: session.user.email! })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[onAuthStateChange]', event, session?.user?.id)
      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null)
      } else if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (profile) setCurrentUser({ ...profile, email: session.user.email! })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[login] calling signInWithPassword...')
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      console.log('[login] signInWithPassword done', { userId: data?.user?.id, error })
      if (error || !data.user) {
        console.error('[login] auth failed', error)
        return false
      }

      console.log('[login] fetching profile for', data.user.id)
      const profile = await fetchProfile(data.user.id)
      console.log('[login] profile result', profile)
      if (!profile || !profile.is_active) {
        console.error('[login] no profile or inactive', { profile })
        await supabase.auth.signOut()
        return false
      }

      console.log('[login] success, setting user')
      setCurrentUser({ ...profile, email: data.user.email! })
      return true
    } catch (err) {
      console.error('[login] caught exception', err)
      return false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
  }

  const switchRole = async (userId: string) => {
    const profile = await fetchProfile(userId)
    if (profile) {
      const { data: { session } } = await supabase.auth.getSession()
      setCurrentUser({ ...profile, email: session?.user?.email ?? profile.email })
    }
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, isAuthenticated: currentUser !== null, login, logout, switchRole }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
