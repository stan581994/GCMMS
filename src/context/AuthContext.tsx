import React, { createContext, useContext, useState } from 'react'
import type { AppUser } from '@/types'
import { mockUsers } from '@/data/mock'

interface AuthContextType {
  currentUser: AppUser | null
  isAuthenticated: boolean
  login: (email: string, _password: string) => Promise<boolean>
  logout: () => void
  switchRole: (userId: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)

  const login = async (email: string, _password: string): Promise<boolean> => {
    const user = mockUsers.find((u) => u.email === email && u.is_active)
    if (user) {
      setCurrentUser(user)
      return true
    }
    return false
  }

  const logout = () => setCurrentUser(null)

  const switchRole = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId)
    if (user) setCurrentUser(user)
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
