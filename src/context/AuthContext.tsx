import React, { createContext, useContext, useState, useEffect } from 'react'
import type { AppUser } from '@/types'
import { supabase } from '@/lib/supabase'

const SESSION_KEY = 'gcmms_session'

interface AuthContextType {
  currentUser: AppUser | null
  isAuthenticated: boolean
  initializing: boolean
  login: (email: string, _password: string) => Promise<boolean>
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
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const saved: AppUser = JSON.parse(raw)
        setCurrentUser(saved)
      }
    } catch {
      localStorage.removeItem(SESSION_KEY)
    }
    setInitializing(false)
  }, [])

  const login = async (email: string, _password: string): Promise<boolean> => {
    const user = mockUsers.find((u) => u.email === email && u.is_active)
    if (user) {
      setCurrentUser(user)
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
      return true
    } catch (err) {
      console.error('[login] caught exception', err)
      return false
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  const switchRole = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      setCurrentUser(user)
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    }
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, isAuthenticated: currentUser !== null, initializing, login, logout, switchRole }}
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
