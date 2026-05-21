import React, { createContext, useContext, useState, useEffect } from 'react'
import type { AppUser } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  currentUser: AppUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  switchRole: (userId: string) => void
  changePassword: (newPassword: string) => Promise<boolean>
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Single source of truth for page-load session restoration
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (profile) setCurrentUser({ ...profile, email: session.user.email! })
      }
      setIsLoading(false)
    })

    // Only handle SIGNED_OUT here — login() owns SIGNED_IN, getSession() owns page load
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[onAuthStateChange]', event, session?.user?.id)
      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null)
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

  const changePassword = async (newPassword: string): Promise<boolean> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return !error
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, isAuthenticated: currentUser !== null, isLoading, login, logout, switchRole, changePassword }}
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
