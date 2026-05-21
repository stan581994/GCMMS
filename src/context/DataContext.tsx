import React, { createContext, useContext, useState } from 'react'
import { mockMembers, mockHouseholds, mockUsers } from '@/data/mock'
import type { Member, Household, AppUser } from '@/types'

interface DataContextType {
  members: Member[]
  households: Household[]
  users: AppUser[]
  updateMember: (id: string, updates: Partial<Member>) => void
  updateHousehold: (id: string, updates: Partial<Household>) => void
  updateUser: (id: string, updates: Partial<AppUser>) => void
  addUser: (user: AppUser) => void
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(mockMembers)
  const [households, setHouseholds] = useState<Household[]>(mockHouseholds)
  const [users, setUsers] = useState<AppUser[]>(mockUsers)

  const updateMember = (id: string, updates: Partial<Member>) =>
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
      )
    )

  const updateHousehold = (id: string, updates: Partial<Household>) =>
    setHouseholds((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)))

  const updateUser = (id: string, updates: Partial<AppUser>) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))

  const addUser = (user: AppUser) => setUsers((prev) => [...prev, user])

  return (
    <DataContext.Provider
      value={{ members, households, users, updateMember, updateHousehold, updateUser, addUser }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
